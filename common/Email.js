var postmark = require("postmark");

const client = new postmark.ServerClient("2f2a9816-068f-4966-8e5c-dbc564094384");

const fromEmail = "hi@mattyphillips.com";

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