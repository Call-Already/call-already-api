const _200 = (body) => {
  return {
    statusCode: 200,
    body: JSON.stringify(body)
  }
};

const _400 = (message) => {
  return {
    statusCode: 400,
    body: JSON.stringify({
      message: message
    }),
  }
};

const _500 = (message) => {
  return {
    statusCode: 500,
    body: JSON.stringify({
      message: message
    }),
  }
};

module.exports = {_200, _400, _500};