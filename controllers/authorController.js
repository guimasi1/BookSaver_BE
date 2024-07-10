const mongoose = require("mongoose");
const errorResponse = require("../utils/errorResponse");
const Author = require("../models/authorModel");
const Book = require("../models/bookModel");
const logger = require("../utils/logger");

exports.createAuthor = async (req, res, next) => {
  try {
    const author = await Author.create({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
    });
    logger.info("author created");

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
    logger.info("DB read");

    res.status(200).json({
      status: "success",
      data: { authors },
    });
  } catch (err) {
    logger.error(err.message);

    errorResponse(res, 500, "Failed to get authors");
  }
};

exports.deleteAuthor = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const authorId = req.params.id;

    const author = await Author.findById(authorId).session(session);
    if (!author) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        status: "failed",
        message: `Author with id ${authorId} not found`,
      });
    }

    await Book.deleteMany({ authorId }).session(session);

    await Author.findByIdAndDelete(authorId).session(session);
    logger.info("author deleted");

    await session.commitTransaction();
    session.endSession();

    res.status(204).json({
      status: "success",
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    logger.error(err.message);
    errorResponse(res, 500, "Failed to delete author");
  }
};
