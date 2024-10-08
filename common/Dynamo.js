const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");

const dynamoDbClient = new DynamoDB({region: "us-east-1"});
const documentClient = DynamoDBDocument.from(dynamoDbClient);

const Dynamo = {
  async get(ID, TableName) {
    const params = {
      TableName: TableName,
      Key: {
        ID: ID
      }
    }

    const data = await documentClient.get(params);

    console.log(data);

    if (!data || !data.Item) {
      console.log(`There was an error fetching the data for ID=${ID} from Table=${TableName}`);
    }

    return data.Item;
  },

  async getUser(Email, TableName) {
    const params = {
      TableName: TableName,
      Key: {
        Email: Email
      }
    }

    const data = await documentClient.get(params);

    console.log(data);

    if (!data || !data.Item) {
      console.log(`There was an error fetching the data for Email=${Email} from Table=${TableName}`);
    }

    return data.Item;
  },

  async put(data, TableName) {
    const params = {
      TableName,
      Item: data,
    }

    await documentClient
      .put(params);
  },

  async delete(key, TableName) {
    var params = {
      TableName,
      Key: {
        Email: key,
      }
    };

    await documentClient
      .delete(params);
  },

  async update(Key, AttributeUpdates, TableName) {

    const params = {
      TableName,
      Key: {
        Email: Key,
      },
      AttributeUpdates,
    }

    await documentClient.update(params)
  }
};

module.exports = Dynamo;