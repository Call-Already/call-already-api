const AWS = require('aws-sdk');

const sesClient = new AWS.SES();

const SES = {
  async send({ to, from, subject, text }) {

    if (!to || !from || !subject || !text) {
      console.log(`Email: To, From, Subject, and Text are all required.`);
      return false;
    }
    
    const params = {
      Destination: {
        ToAddresses: [ to ]
      },
      Message: {
        Body: {
          Text: { Data: text },
        },
        Subject: { Data: subject },
      },
      Source: from
    };

    try {
      await sesClient.sendEmail(params).promise();
      return true;
    } catch (error) {
      console.log(`Error sending email:`, error);
      return false;
    }
  }
};

module.exports = SES;