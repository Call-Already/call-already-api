var postmark = require("postmark");

const client = new postmark.ServerClient("2f2a9816-068f-4966-8e5c-dbc564094384");

const fromEmail = "hi@mattyphillips.com";
const NO_COMMON_TIME_MESSAGE = "No common time found";

exports.sendWelcomeEmail = async (nickname, email, userId) => {
  client.sendEmailWithTemplate({
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
  client.sendEmailWithTemplate({
    "From": fromEmail,
    "To": email,
    "TemplateAlias": "confirmation",
    "TemplateModel": {
      "nickname": nickname,
      "group_code": groupCode,
    },
    "MessageStream": "confirmation"
  });
}

const sendScheduleEmail = async (nickname, email, groupCode, localTime, timezone) => {
  client.sendEmailWithTemplate({
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

const perfectScheduleCheck = async (users) => {
  let commonTime = "";
  // Get and go through the first user's SelectedTimes
  var firstUserTimes = users[0].SelectedTimes;
  for (var i = 0; i < firstUserTimes.length; i++) {
    commonTime = firstUserTimes[i];
    // Scan the rest of the users' SelectedTimes for the CommonTime
    for (var j = 1; j < users.length; j++) { // Off by 1 is here !!!
      var otherUser = users[j];
      var commonTimeFound = false;
      // Check this user's SelectedTimes to see if it contains CommonTime
      for (var k = 0; k < otherUser.SelectedTimes.length; k++) {
        var selectedTime = otherUser.SelectedTimes[k];
        if (selectedTime === commonTime) {
          commonTimeFound = true;
        }
      }
      // If this user did not have the CommonTime, CommonTime doesn't work.
      // Break and try another CommonTime from the first user.
      if (commonTimeFound === false) {
        break;
      }
      // If we are are here, CommonTime still stands true.
      // If we are also checking the last user, CommonTime works for all.
      // That means all users have succcessfully selected CommonTime.
      if (j === (users.length - 1)) { // users.length - 1 ?!?!
        return commonTime;
      }
    }
    // Next iteration here checks the next CommonTime from first user.
  }
  // If we reach here, no CommonTime was found amongst the users.
  return NO_COMMON_TIME_MESSAGE;
}

exports.sendScheduleEmails = async (users, groupCode) => {
  // const commonTime = await perfectScheduleCheck(users);
  // const commonTime = await perfectScoredScheduleCheck(users);
  // const commonTime = await imperfectScoredScheduleCheck(users);
  const commonTime = await perfectScheduleCheck(users);
  if (commonTime === NO_COMMON_TIME_MESSAGE) {
    // await sendFailureEmail
  } else {
    for (var i = 0; i < users.length; i++) {
      // const localTime = moment timezone time
      const user = users[i];
      sendScheduleEmail(user.Nickname, user.Email, groupCode, commonTime, user.Timezone);
    }
  }
}
