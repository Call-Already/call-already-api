var postmark = require("postmark");
const { perfectScheduleCheck, imperfectScheduleCheck } = require("./Scheduling");

const client = new postmark.ServerClient("2f2a9816-068f-4966-8e5c-dbc564094384");

const fromEmail = "hi@mattyphillips.com";
const NO_COMMON_TIME_MESSAGE = "No common time found";
const PERFECT_CALL = "perfect";
const IMPERFECT_CALL = "imperfect";

exports.sendWelcomeEmail = async (nickname, email, userId) => {
  await client.sendEmailWithTemplate({
    "From": fromEmail,
    "To": email,
    "TemplateAlias": "welcome",
    "TemplateModel": {
      "nickname": nickname,
      "verify_link": `https://callalready.com/verify-email?Email=${email}&UserID=${userId}`,
      "email": email,
      "help_url": "https://callalready.com/overview",
    },
    "MessageStream": "welcome"
  });
}

exports.sendConfirmationEmail = async (nickname, email, groupCode) => {
  try {
    await client.sendEmailWithTemplate({
      "From": fromEmail,
      "To": email,
      "TemplateAlias": "confirmation",
      "TemplateModel": {
        "nickname": nickname,
        "group_code": groupCode,
      },
      "MessageStream": "confirmation"
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

const sendFailureEmail = async (nickname, email, groupCode) => {
  return client.sendEmailWithTemplate({
    "From": fromEmail,
    "To": email,
    "TemplateAlias": "failure",
    "TemplateModel": {
      "nickname": nickname,
      "group_code": groupCode,
    },
    "MessageStream": "failure"
  });
}

const sendScheduleEmail = async (nickname, email, groupCode, localTime, timezone) => {
  return client.sendEmailWithTemplate({
    "From": fromEmail,
    "To": email,
    "TemplateAlias": "schedule",
    "TemplateModel": {
      "nickname": nickname,
      "group_code": groupCode,
      "local_date_time": localTime,
      "timezone": timezone
    },
    "MessageStream": "schedule"
  });
}

exports.sendScheduleEmails = async (users, groupCode, callType) => {

  try {
    // Get the best time from the user inputs
    let commonTime;
    if (callType === PERFECT_CALL) {
      commonTime = await perfectScheduleCheck(users);
    } else {
      commonTime = await imperfectScheduleCheck(users);
    }
    
    // If the group asked for pefect scheduling, we must send
    // a different email, Failure, when there was no common time
    // among all of them. Otherwise, we send the best time.
    if (commonTime === NO_COMMON_TIME_MESSAGE) {
      for (var i = 0; i < users.length; i++) {
        const user = users[i];
        await sendFailureEmail(user.Nickname, user.Email, groupCode);
      }
    } else {
      for (var i = 0; i < users.length; i++) {
        const user = users[i];
        const localTime = new Date(commonTime).toLocaleString('en-US', { 
          timeZone: user.Timezone
        });
        await sendScheduleEmail(user.Nickname, user.Email, groupCode, localTime, user.Timezone);
      }
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
