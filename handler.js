const Dynamo = require('./common/Dynamo')

const tableName = process.env.tableName;

exports.hello = async (event) => {

  const ID = "1";

  const userGroup = await Dynamo.get(ID, tableName).catch(err => {
    console.log(`Error in Dynamo get`, err);
    return null;
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: userGroup,
    }),
  };
};
