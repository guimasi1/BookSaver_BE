module.exports = function (res, statusCode, errorMessage) {
  res.status(statusCode).json({ status: "Failed", message: errorMessage });
};
