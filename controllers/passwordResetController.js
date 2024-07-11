const Token = require("../models/tokenModel");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const AppError = require("../utils/appError");
const errorResponse = require("../utils/errorResponse");
const logger = require("../utils/logger");
const sendEmail = require("../utils/sendEmail");
const tokenModel = require("../models/tokenModel");

const generateToken = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError("No user found with this email");
    }

    const userId = user.id;

    const token = await Token.findById(userId);
    if (token) {
      const result = await Token.deleteOne({ userId });
      if (result.deletedCount === 0) {
        res.status(404).json({
          status: "failed",
          message: "no token found",
        });
      }
    }

    logger.info("token deleted");

    const resetToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    await Token.create({
      userId,
      token: resetToken,
    });
    logger.info("token created");
    return resetToken;
  } catch (err) {
    throw new AppError("Could not generate token", 500);
  }
};

exports.passwordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const resetToken = await generateToken(email);
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({
        status: "failed",
        message: "no user found with this email",
      });
    }

    const link = `${process.env.BASE_URL}/password-reset/${user._id}/${resetToken}`;

    await sendEmail(email, "Reset password", link);

    res.status(200).json({
      status: "success",
    });
  } catch (err) {
    errorResponse(res, 500, "failed to handle the request. " + err.message);
  }
};

exports.confirmPassword = async (req, res, next) => {
  try {
    const { userId, token } = req.params;
    const { password } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      logger.warn("user not found");
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }

    const resetToken = await Token.findOne({
      userId,
      token,
    });

    if (!resetToken) {
      logger.warn("invalid token");
      return res.status(400).json({
        status: "failed",
        message: "invalid token or expired",
      });
    }

    const newPassword = await bcrypt.hash(password, 11);

    const userFound = await User.findByIdAndUpdate(userId, {
      password: newPassword,
    });

    if (!userFound) {
      return res.status(404).json({
        status: "failed",
        message: "user not found",
      });
    }

    logger.info("new password created");

    await Token.deleteMany({
      userId,
      token,
    });

    return res.status(200).json({
      status: "success",
    });
  } catch (err) {
    errorResponse(res, 500, "failed to set new password. " + err.message);
  }
};
