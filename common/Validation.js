const validatePostResponsesParams = (params) => {
  if (!params.ID || !params.Nickname || !params.email || !params.Timezone || !params.IsGroupCreator || !params.SelectedTimes) {
    console.log(`[PostResponses] Params missing data: ${JSON.stringify(params)}`);
    return false;
  } else {
    return true;
  }
}

const validateValidateGroupParams = (params) => {
  if (!params.ID) {
    console.log(`[ValidateGroup] Params missing data: ${JSON.stringify(params)}`);
    return false;
  } else {
    return true;
  }
}

module.exports = { validatePostResponsesParams, validateValidateGroupParams };