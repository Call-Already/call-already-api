exports.getTTL = async () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return parseInt((date.getTime() / 1000).toFixed(0));
}
