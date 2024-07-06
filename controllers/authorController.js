const errorResponse = require("../utils/errorResponse");
const Author = require("../models/authorModel");

exports.createAuthor = async (req, res, next) => {
  try {
    const author = await Author.create({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
    });

    res.status(201).json({
      status: "success",
      author,
    });
  } catch (err) {
    errorResponse(res, 500, "Failed to create author");
  }
};

exports.getAuthors = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = "_id" } = req.query;

    const authors = await Author.find()
      .populate("books", "title description")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sort);

    res.status(200).json({
      status: "success",
      data: { authors },
    });
  } catch (err) {
    errorResponse(res, 500, "Failed to get authors");
  }
};
