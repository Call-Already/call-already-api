const Dynamo = require('./common/Dynamo')

const tableName = process.env.tableName;

exports.postResponses = async (event) => {
  const body = JSON.parse(event.body);

  // First, get the existing entry if it exists
  const entry = await Dynamo.get(body.ID, tableName)
    .catch(err => {
      console.log("Error in Dynamo get", err);
      return null;
    });

  // Process the entry and add the user's information
  const numUsers = entry.NumUsers || body.numUsers;
  const users = entry.Users || [];
  
  if (users.length === numUsers) {
    // Handle max users already being reached.
  }

  users.forEach(element => {
    if (element.NickName) {
      // Handle the user already being there.
    }
  });

  // Assumes user doesn't exist yet
  users.push(body.user);
  entry.Users = users;

  await Dynamo.put(entry, tableName).catch((err) => {
    console.log("Error in Dynamo put", err);
      return null;
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Post responses successful."
    }),
  };
};
