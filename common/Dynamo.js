const AWS = require('aws-sdk');

const documentClient = new AWS.DynamoDB.DocumentClient();

const Dynamo = {
  async get(ID, TableName) {
    const params = {
      TableName,
      Key: {
        ID
      }
    }

    const data = await documentClient
      .get(params)
      .promise();

    if (!data || !data.Item) {
      console.log(`There was an error fetching the data for ID=${ID} from Table=${TableName}`);
    }

    return data.Item;
  },

  async put(data, TableName) {
    const params = {
      TableName,
      Item: data,
    }

    await documentClient
      .put(params)
      .promise();
  }
};

module.exports = Dynamo;