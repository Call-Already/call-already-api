const Dynamo = require('./common/Dynamo');
const { _200, _500, _404, _400 } = require("./common/Responses");

var postmark = require("postmark");

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

const tableName = process.env.registryTableName;

const postmarkClient = new postmark.ServerClient("2f2a9816-068f-4966-8e5c-dbc564094384");

exports.register = async (event) => {
  const body = JSON.parse(event.body);

  // Check here to see if the user exists already.
  const existingEntry = await Dynamo.getUser(body.Email, tableName);
  if (existingEntry) {
    return _400(`Account alreadty exists for email ${existingEntry}`);
  }

  const UserID = uuidv4();
  
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  const hash = bcrypt.hashSync(body.Password, salt);

  const entry = {
    UserID: UserID,
    Nickname: body.Nickname,
    Email: body.Email,
    Password: hash,
    IsVerified: false,
  };

  await Dynamo.put(entry, tableName).catch((err) => {
    console.log("Error in Dynamo put", err);
    return _500(`Error saving user ${body}`)
  });

  // Send verification email.
  postmarkClient.sendEmail({
    "From": "hi@mattyphillips.com",
    "To": body.Email,
    "Subject": "Hello from CallAlready.com",
    "HtmlBody": `<a href="http://localhost:4200/verify-email?Email=${body.Email}&UserID=${UserID}">Verify your Email</a>`,
    "TextBody": "Hello from Postmark!",
    "MessageStream": "confirmation"
  });

  return _200();
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
    return _200(entry);
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

    if (match) {
      return _200(entry);
    } else {
      console.log("Email/passwords do not match");
      return _400("Email/passwords do not match");
    }
  } else {
    console.log("Email does not exist");
    return _404("Email does not exist");
  }
}
