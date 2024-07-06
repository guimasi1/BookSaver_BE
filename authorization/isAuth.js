const jwt = require("jsonwebtoken");
const errorResponse = require("../utils/errorResponse");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    return errorResponse(res, 401, "Not authenticated");
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return errorResponse(res, 500, "Token not valid");
  }
  if (!decodedToken) {
    return errorResponse(res, 401, "Not authenticated");
  }
  next();
};
