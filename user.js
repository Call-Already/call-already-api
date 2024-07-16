exports.postResponses = async (event) => {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Post responses",
      }),
    };
  };
  