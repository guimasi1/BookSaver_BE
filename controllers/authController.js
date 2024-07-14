const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const errorResponse = require("../utils/errorResponse");
const logger = require("../utils/logger");
const { promisify } = require("util");
const AppError = require("../utils/appError");

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: 60 * 60 * 24 * 7,
  });
};

exports.createAdmin = async (req, res, next) => {
  try {
    const userWithSameEmail = await User.findOne({ email: req.body.email });
    if (userWithSameEmail)
      throw new Error(
        `There's already an user with this email: ` + req.body.email
      );
    const userWithSameUsername = await User.findOne({
      username: req.body.username,
    });
    if (userWithSameUsername)
      throw new Error(
        `There's already an user with this username: ` + req.body.username
      );

    const {
      email,
      password,
      username,
      profilePictureUrl,
      firstname,
      lastname,
    } = req.body;

    const newUser = await User.create({
      email,
      password,
      username,
      profilePictureUrl,
      firstname,
      lastname,
      role: "ADMIN",
    });

    logger.info(`Admin with username ${req.body.username} created`);
    return res.status(200).json({
      userId: newUser._id,
    });
  } catch (err) {
    logger.error(err.message);
    return errorResponse(res, 400, "Failed to register the new admin. " + err);
  }
};

exports.signUp = async (req, res, next) => {
  try {
    const userWithSameEmail = await User.findOne({ email: req.body.email });
    if (userWithSameEmail)
      throw new Error(
        `There's already an user with this email: ` + req.body.email
      );
    const userWithSameUsername = await User.findOne({
      username: req.body.username,
    });
    if (userWithSameUsername)
      throw new Error(
        `There's already an user with this username: ` + req.body.username
      );

    const {
      email,
      password,
      username,
      profilePictureUrl,
      firstname,
      lastname,
    } = req.body;

    const newUser = await User.create({
      email,
      password,
      username,
      profilePictureUrl,
      firstname,
      lastname,
    });

    logger.info(`User with username ${req.body.username} created`);
    return res.status(200).json({
      userId: newUser._id,
    });
  } catch (err) {
    logger.error(err.message);
    return errorResponse(res, 400, "Failed to register the new user. " + err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "Failed",
      message: "Missing password or email",
    });
  }

  try {
    const user = await User.findOne({ email: req.body.email });
    logger.info(user);
    const correct = await bcrypt.compare(password, user.password);
    console.log(user.password);
    if (!user || !correct) {
      logger.warn("Incorrect email or password");
      return res.status(401).json({
        status: "Failed",
        message: "Incorrect email or password",
      });
    }

    const token = createToken(user._id);
    logger.info("Token created");

    req.user = user;
    res.status(200).json({
      token,
    });
    next();
  } catch (err) {
    logger.error(err.message);
    return errorResponse(
      res,
      401,
      "An error occurred during the login process."
    );
  }
};

exports.restrictTo = (...roles) => {
  return async (req, res, next) => {
    try {
      if (!roles.includes(req.user.role)) {
        logger.warn("You don't have the authorization");
        return res.status(403).json({
          status: "failed",
          message: "You don't have the authorization",
        });
      }
      next();
    } catch (err) {
      errorResponse(res, 500, err.message);
    }
  };
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      logger.warn("Not logged in");
      throw new AppError("Not logged in", 401);
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      logger.warn("User not found");
      throw new AppError("User not found", 401);
    }

    req.user = currentUser;
    next();
  } catch (err) {
    errorResponse(res, 500, err.message);
  }
};
