const User = require("../models/userModel");
const Book = require("../models/bookModel");
const errorResponse = require("../utils/errorResponse");
const { promisify } = require("util");
const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .populate("favouriteBooks", "title description")
      .populate("readBooks", "title description")
      .populate("reviews")
      .select("-password");

    logger.info("DB read");

    res.status(200).json({
      status: "success",
      data: {
        users,
      },
    });
  } catch (err) {
    logger.err(err);

    return errorResponse(res, 400, "Failed to get all users.");
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).select("-password -role");
    if (!user) {
      logger.warn("user not found " + userId);
      return res.status(404).json({
        status: "failed",
        message: "User with id " + userId + " not found.",
      });
    }

    logger.info("DB Read");
    res.status(200).json({
      status: "success",
      user,
    });
  } catch (err) {
    errorResponse(res, 500, "failed to load user");
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      logger.warn("No token provided");
      return res.status(401).json({
        status: "failed",
        message: "There's no token in the headers",
      });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id)
      .populate({
        path: "readBooks",
        populate: {
          path: "authorId",
          select: "-books",
        },
      })
      .populate("favouriteBooks")
      .select("-password -reviews");

    if (!user) {
      logger.warn("User not found");
      return res.status(404).json({
        status: "failed",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      user,
    });
  } catch (err) {
    logger.error("Error loading user:", err);
    errorResponse(res, 500, "Failed to load user");
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.userId);

    logger.info("user deleted");

    res.status(204).json({
      status: "success",
    });
  } catch (err) {
    logger.err(err);

    errorResponse(res, 500, "Failed to delete user");
  }
};

exports.deleteUserByUsername = async (req, res, next) => {
  try {
    const username = req.params.username;
    const result = await User.deleteOne({ username });
    if (result.deletedCount === 0) {
      logger.warn("user not found");
      return res.status(404).json({
        status: "failed",
        message: `user with username ${username} not found`,
      });
    }
    logger.info("user deleted");
    res.status(204).json({
      status: "success",
    });
  } catch (err) {
    errorResponse(res, 500, "failed to delete user");
  }
};
