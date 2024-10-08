const Dynamo = require('./common/Dynamo');
const { _200, _500, _404, _400, _403 } = require("./common/Responses");
const { generateToken } = require("./common/Authorization");
const { sendWelcomeEmail } = require('./common/Email');

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const SALT_ROUNDS = 10;

const tableName = process.env.registryTableName;

exports.register = async (event) => {
  const body = JSON.parse(event.body);

  // Check here to see if the user exists already.
  const existingEntry = await Dynamo.getUser(body.Email, tableName);
  if (existingEntry && existingEntry.IsVerified) {
    return _400(`Account already exists for email ${existingEntry}`);
  }

  const UserID = uuidv4();
  
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  const hash = bcrypt.hashSync(body.Password, salt);

  const entry = {
    UserID: UserID,
    Nickname: body.Nickname,
    Email: body.Email,
    PhoneNumber: body.PhoneNumber,
    IsOptedInToWhatsApp: body.IsOptedInToWhatsApp,
    Password: hash,
    IsVerified: false,
  };

  await Dynamo.put(entry, tableName).catch((err) => {
    console.log("Error in Dynamo put", err);
    return _500(`Error saving user ${body}`)
  });

  try {
    const welcomeEmailSuccess = await sendWelcomeEmail(body.Nickname, body.Email, UserID);
    if (welcomeEmailSuccess) {
      return _200();
    } else {
      console.log("Could not send Welcome email", error);
      return _500(`Error sending Welcome email to ${body}`)
    }
  } catch (error) {
    console.log("Could not send Welcome email", error);
    return _500(`Error sending Welcome email to ${body}`)
  }
}

exports.verifyEmail = async (event) => {
  const queryParameters = event.queryStringParameters;

  const Email = queryParameters.Email;
  const UserID = queryParameters.UserID;

  const entry = await Dynamo.getUser(Email, tableName);

  if (entry) {
    if (entry.UserID != UserID) {
      return _400(`Need valid UserID to verify the email address.`);
    }
    entry.IsVerified = true;
    await Dynamo.put(entry, tableName).catch((err) => {
      console.log("Error in Dynamo put", err);
      return _500(`Error verifying user email ${Email}`)
    });

    const token = generateToken(entry.UserID);
    
    return _200({User: entry, Token: token});
  } else {
    return _404(`Could not verify email, user with email ${Email} does not exist.`)
  }
}

exports.loginUser = async (event) => {
  const body = JSON.parse(event.body);

  const entry = await Dynamo.getUser(body.Email, tableName).catch((err) => {
    console.log("Error in Dynamo get", err);
    return _500(`Error loggin in user ${body}`)
  });

  if (entry) {
    const match = await bcrypt.compare(body.Password, entry.Password);

    if (!entry.IsVerified) {
      return _403();
    }

    if (match) {
      const token = generateToken(entry.UserID);

      return _200({User: entry, Token: token});
    } else {
      console.log("Email/passwords do not match");
      return _400("Email/passwords do not match");
    }
  } else {
    console.log("Email does not exist");
    return _404("Email does not exist");
  }
}

exports.getUser = async (event) => {
  const queryParameters = event.queryStringParameters;

  const Email = queryParameters.Email;

  const entry = await Dynamo.getUser(Email, tableName).catch((err) => {
    console.log("Error in Dynamo get", err);
    return _500(`Error getting user ${body}`)
  });

  return _200(entry);
}

exports.deleteUser = async (event) => {
  const queryParameters = event.queryStringParameters;

  const Email = queryParameters.Email;

  await Dynamo.delete(Email, tableName);

  return _200();
}

exports.updateUser = async (event) => {
  const body = JSON.parse(event.body);

  console.log(body);

  let phoneNumber;
  if (!body.PhoneNumber) {
    phoneNumber = "";
  } else {
    phoneNumber = body.PhoneNumber;
  }

  const AttributeUpdates = {
    Nickname: {
      Action: "PUT",
      Value: body.Nickname,
    },
    PhoneNumber: {
      Action: "PUT",
      Value: phoneNumber,
    },
    IsOptedInToWhatsApp: {
      Action: "PUT",
      Value: body.IsOptedInToWhatsApp,
    },
  };

  await Dynamo.update(body.Email, AttributeUpdates, tableName).catch((err) => {
    console.log("Error in Dynamo update", err);
    return _500(`Error update user ${body}`)
  });

  return _200();
}