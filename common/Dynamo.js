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

  async put(data, TableName) {
    const params = {
      TableName,
      Item: data,
    }

    console.log(params);

    await documentClient
      .put(params);
  }
};

module.exports = Dynamo;