const { getUser, put } = require("./Dynamo");

const registryTableName = process.env.registryTableName;

exports.getTTL = async () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return parseInt((date.getTime() / 1000).toFixed(0));
}

exports.incrementGroupsCreated = async (email) => {
  try {
    const user = await getUser(email, registryTableName);
    if (user.GroupsCreated) {
      user.GroupsCreated = user.GroupsCreated + 1;
    } else {
      user.GroupsCreated = 1;
    }
    await put(user, registryTableName);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

exports.incrementGroupsJoined = async (email) => {
  try {
    const user = await getUser(email, registryTableName);
    if (user.GroupsJoined) {
      user.GroupsJoined = user.GroupsJoined + 1;
    } else {
      user.GroupsJoined = 1;
    }
    await put(user, registryTableName);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
