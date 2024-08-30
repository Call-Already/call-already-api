const validatePostResponsesParams = (params) => {
  if (!params.ID || !params.Nickname || !params.email || !params.Timezone || !params.IsGroupCreator || !params.SelectedTimes) {
    console.log(`Params missing data: ${params}`);
    return false;
  } else {
    return true;
  }
}

module.exports = validatePostResponsesParams;