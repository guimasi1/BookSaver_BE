const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const errorResponse = require("../utils/errorResponse");
const logger = require("../utils/logger");

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: 60 * 60 * 24 * 7,
  });
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
    const correct = await bcrypt.compare(password, user.password);
    if (!user || !correct) {
      return res.status(401).json({
        status: "Failed",
        message: "Incorrect email or password",
      });
    }

    const token = createToken(user._id);
    logger.info("Token created");
    logger.info("Logged in");
    return res.status(200).json({
      status: "Success",
      message: "Logged in successfully",
      token,
    });
  } catch (err) {
    logger.error(err.message);
    return errorResponse(
      res,
      400,
      "An error occurred during the login process."
    );
  }
};

exports.protect = () => {};
