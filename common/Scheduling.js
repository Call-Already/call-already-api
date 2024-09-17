const NO_COMMON_TIME_MESSAGE = "No common time found";

exports.perfectScheduleCheck = async (users) => {
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

exports.imperfectScheduleCheck = async (users) => {
  const timetable = new Map();
  // Go through each User's SelectedTimes and add them to the timetable.
  for (var i = 0; i < users.length; i++) {
    var user = users[i];
    for (var j = 0; j < user.SelectedTimes.length; j++) {
      var selectedTime = user.SelectedTimes[j];
      var timetableValue = timetable.get(selectedTime);
      if (timetableValue) {
        // Add to the existing timetable entry.
        timetable.set(selectedTime, timetableValue + 1);
      } else {
        // Timetable entry doesn't exist for this time. Add it.
        timetable.set(selectedTime, 1);
      }
    }
  }

  // Select the time with the most users 
  // Assumes there are at least two users.
  var maxUsers = 0;
  var maxUsersTime = "";
  for (let [key, value] of  timetable.entries()) {
    if (value > maxUsers) {
      maxUsers = value;
      maxUsersTime = key;
    }
  }

  return maxUsersTime;
}
