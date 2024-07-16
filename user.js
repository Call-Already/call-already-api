exports.postResponses = async (event) => {
  const body = JSON.parse(event.body);
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Post responses " + body?.test,
    }),
  };
};
