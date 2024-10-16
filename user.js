const Dynamo = require('./common/Dynamo');
const { sendConfirmationEmail, sendScheduleEmails } = require('./common/Email');
const { _200, _400, _404, _500 } = require('./common/Responses');
const { getTTL, incrementGroupsCreated, incrementGroupsJoined } = require('./common/Utils');
const { validatePostResponsesParams, validateValidateGroupParams } = require('./common/Validation');
const { sendConfirmationWhatsApp, sendScheduleWhatsApps } = require('./common/WhatsApp');

const tableName = process.env.tableName;
const registryTableName = process.env.registryTableName;

exports.validateGroup = async (event) => {
  const queryParameters = event.queryStringParameters;

  validateValidateGroupParams(queryParameters);

  // First, get the existing entry if it exists
  const entry = await Dynamo.get(queryParameters.ID, tableName);

  if (entry) {

    if (entry.Users && entry.Users.length >= entry.NumUsers) {
      return _400(`Group ${queryParameters.ID} is already full.`);
    }

    // Collect the users to show the user who they're joining
    const userNicknames = [];

    for (var user in entry.Users) {
      userNicknames.push(entry.Users[user].Nickname);
    }

    const responseBody = {
      Dates: entry.Dates,
      UserNicknames: userNicknames,
      NumUsers: entry.NumUsers,
      CallType: entry.CallType,
    };

    return _200(responseBody);
  } else {
    console.log(`Could not validate a group exists ${queryParameters.ID}`);
    return _404(`Group ${queryParameters.ID} does not exist.`);
  }
}

exports.createGroup = async (event) => {
  const body = JSON.parse(event.body);

  // First, get the existing entry if it exists
  const existingEntry = await Dynamo.get(body.ID, tableName);

  // Return a retry code as the group somehow exists already.
  if (existingEntry) {
    return _400(`Group ${body.ID} already exists. Try making a group with a different code.`);
  }

  const ttl = await getTTL();

  const entry = {
    ID: body.ID,
    Dates: body.Dates,
    NumUsers: body.NumUsers,
    ShowUsers: body.ShowUsers,
    CallType: body.CallType,
    TTL: ttl,
  };

  await Dynamo.put(entry, tableName).catch((err) => {
    console.log("Error in Dynamo put", err);
    return _500(`Error saving group of ID ${body.ID}`);
  });

  const incrementSuccess = await incrementGroupsCreated(body.Email);

  if (incrementSuccess) {
    return _200();
  } else {
    return _500();
  }
}

exports.postResponses = async (event) => {
  const body = JSON.parse(event.body);

  console.log(body);

  validatePostResponsesParams(body);

  // First, get the existing entry if it exists
  const entry = await Dynamo.get(body.ID, tableName);

  // Expect the entry to exist already, if not, return bad request.
  if (!entry) {
    return _404(`Could not find existing group of ID ${body.ID}`);
  }

  // Prepare the memory users object, remove the existing user if there.
  let users = entry.Users;
  if (!users) {
    users = [];
  }
  users = users.filter(user => user.Nickname !== body.Nickname);

  const userEntry = await Dynamo.getUser(body.Email, registryTableName);
  const phoneNumber = userEntry.PhoneNumber;
  const isOptedInToWhatsApp = userEntry.IsOptedInToWhatsApp;

  const user = {
    Nickname: body.Nickname,
    Email: body.Email,
    Timezone: body.Timezone,
    SelectedTimes: body.SelectedTimes,
    IsGroupCreator: body.IsGroupCreator,
    PhoneNumber: phoneNumber,
    IsOptedInToWhatsApp: isOptedInToWhatsApp,
  };

  // After validation assumes user doesn't exist yet
  users.push(user);
  entry.Users = users;

  await Dynamo.put(entry, tableName).catch((err) => {
    console.log("Error in Dynamo put", err);
    return _500(`Error saving responses ${body}`)
  });

  // Increment the user's groups joined count if they are joining.
  if (!body.IsGroupCreator) {
    const incrementSuccess = await incrementGroupsJoined(body.Email);
    if (!incrementSuccess) {
      console.log("Error incrementing groups joined", body);
      return _500(`Error incrementing groups joined ${body}`);
    }
  }

  if (phoneNumber && isOptedInToWhatsApp) {
    const confirmationWhatsAppSuccess = await sendConfirmationWhatsApp(phoneNumber, body.Nickname, body.ID);
    if (!confirmationWhatsAppSuccess) {
      console.log("Error sending schedule WhatsApp", body);
      return _500(`Error sending schedule WhatsApp ${body}`);
    }
  }

  const confirmationEmailSuccess = await sendConfirmationEmail(body.Nickname, body.Email, body.ID);

  if (confirmationEmailSuccess) {
    // Handle max users being reached,
    // send email with time confirmation to all.
    if (entry.NumUsers === entry.Users.length) {
      const scheduleEmailsSuccess = await sendScheduleEmails(entry.Users, body.ID, entry.CallType);
      const scheduleWhatsAppSuccess = await sendScheduleWhatsApps(entry.Users, body.ID, entry.CallType)

      if (scheduleEmailsSuccess && scheduleWhatsAppSuccess) {
        return _200();
      } else {
        console.log("Error sending schedule comms", body);
        return _500(`Error sending schedule comms ${body}`);
      }
    } else {
      // We don't need to send schedule emails, so just reply with success.
      return _200();
    }
  } else {
    // Confirmation email failed to send
    console.log("Error sending confirmation email", body);
    return _500(`Error sending confirmation email ${body}`);
  }
};
