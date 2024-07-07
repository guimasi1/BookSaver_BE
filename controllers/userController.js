const User = require("../models/userModel");
const Book = require("../models/bookModel");
const errorResponse = require("../utils/errorResponse");

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .populate("favouriteBooks", "title description")
      .populate("readBooks", "title description")
      .populate("reviews");

    res.status(200).json({
      status: "success",
      data: {
        users,
      },
    });
  } catch (err) {
    return errorResponse(res, 400, "Failed to get all users.");
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(204).json({
      status: "success",
    });
  } catch (err) {
    errorResponse(res, 500, "Failed to delete user");
  }
};
