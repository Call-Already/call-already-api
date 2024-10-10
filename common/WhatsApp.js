const twilio = require("twilio");
const { perfectScheduleCheck, imperfectScheduleCheck } = require("./Scheduling");

const accountSid = process.env.whatsAppAccountSID;
const authToken = process.env.whatsAppAuthToken;
const client = twilio(accountSid, authToken);

const NO_COMMON_TIME_MESSAGE = "No common time found";
const PERFECT_CALL = "perfect";
const IMPERFECT_CALL = "imperfect";

exports.sendConfirmationWhatsApp = async (phoneNumber, nickname, groupCode) => {
  try {
    await client.messages.create({
      contentSid: "HX987ecc94c3f1c231eccb623ad61b38d1", // Confirmation template
      contentVariables: JSON.stringify({
        "nickname": nickname,
        "groupCode": groupCode,
       }),
      from: "whatsapp:+19254034782",
      messagingServiceSid: "MG48e033a5dee9d568f2ee200ba2636f82",
      to: `whatsapp:${phoneNumber}`,
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const sendScheduleWhatsApp = async (phoneNumber, nickname, groupCode, dateTime, timezone) => {
  try {
    await client.messages.create({
      contentSid: "HX004d39ce80db06847bfa9653fc83543b", // Schedule template
      contentVariables: JSON.stringify({
        "nickname": nickname,
        "groupCode": groupCode,
        "dateTime": dateTime,
        "timezone": timezone,
       }),
      from: "whatsapp:+19254034782",
      messagingServiceSid: "MG48e033a5dee9d568f2ee200ba2636f82",
      to: `whatsapp:${phoneNumber}`,
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

exports.sendScheduleWhatsApps = async (users, groupCode, callType) => {
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
      // for (var i = 0; i < users.length; i++) {
      //   const user = users[i];
      //   await sendFailureEmail(user.Nickname, user.Email, groupCode);
      // }
    } else {
      for (var i = 0; i < users.length; i++) {
        const user = users[i];
        // Only send the schedule whatsApp if the user has a phone number.
        if (user.PhoneNumber && user.IsOptedInToWhatsApp) {
          const localTime = new Date(commonTime).toLocaleString('en-US', { 
            timeZone: user.Timezone
          });
          await sendScheduleWhatsApp(user.PhoneNumber, user.Nickname, groupCode, localTime, user.Timezone);
        }
      }
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};