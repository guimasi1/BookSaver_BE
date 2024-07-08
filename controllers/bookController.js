const Book = require("../models/bookModel");
const Author = require("../models/authorModel");
const User = require("../models/userModel");
const errorResponse = require("../utils/errorResponse");
const logger = require("../utils/logger");

exports.createBook = async (req, res, next) => {
  try {
    const { authorId, title, description } = req.body;

    const bookWithSameTitleAndAuthor = await Book.findOne({ authorId, title });
    if (bookWithSameTitleAndAuthor) {
      logger.error(
        `Book with title: ${title} and authorId: ${authorId} already exists.`
      );
      throw new Error("the book already exists");
    }

    const newBook = await Book.create({
      authorId,
      title,
      description,
    });
    logger.info("Book created");

    await Author.findByIdAndUpdate(req.body.authorId, {
      $push: { books: newBook },
    });
    logger.info("Author updated");

    res.status(201).json({
      status: "success",
      newBook,
    });
  } catch (err) {
    logger.error(err.message);
    errorResponse(res, 500, "Failed to create book: " + err.message);
  }
};

exports.getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.find();
    logger.info("DB Read");

    res.status(200).json({
      status: "success",
      data: { books },
    });
  } catch (err) {
    logger.error(err.message);
    errorResponse(res, 500, "Failed to get books");
  }
};

exports.addBookToFavourites = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      res.status(404).json({
        status: "failed",
        message: "Book not found",
      });
    }

    const user = await User.findById(req.params.userId);
    logger.info("User found");

    const bookIds = user.favouriteBooks.map((book) => book._id.toString());
    if (bookIds.includes(req.params.bookId)) {
      logger.error("The book is already in the favourite books array");
      return res.status(409).json({
        status: "failed",
        message: "The book is already in the favourite books array",
      });
    }

    await User.findByIdAndUpdate(req.params.userId, {
      $push: { favouriteBooks: book._id },
    });
    logger.info("Book added to favourite books");

    res.status(200).json({
      status: "book added successfully",
    });
  } catch (err) {
    logger.error(err.message);
    errorResponse(res, 500, "Failed to add book to favourites");
  }
};

exports.removeBookFromFavourites = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.bookId);
    logger.info("book found");

    await User.findByIdAndUpdate(req.params.userId, {
      $pull: { favouriteBooks: req.params.bookId },
    });
    logger.info("book removed");

    res.status(200).json({
      status: "success",
      message: "Book removed successfully",
    });
  } catch (err) {
    logger.error(err.message);
    errorResponse(res, 500, "Failed to remove book from favourites");
  }
};

exports.setBookAsRead = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, {
      $push: { readBooks: req.params.bookId },
    });
    logger.info("book added to read books");

    res.status(200).json({
      status: "success",
      message: "Book set successfully as read",
    });
  } catch (err) {
    logger.error(err.message);
    errorResponse(res, 500, "Failed to set book as read");
  }
};

exports.setBookAsNotRead = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, {
      $pull: { readBooks: req.params.bookId },
    });
    logger.info("book removed from read books");

    res.status(200).json({
      status: "success",
      message: "Book set successfully as not read",
    });
  } catch (err) {
    logger.error(err.message);
    errorResponse(res, 500, "Failed to set book as not read");
  }
};
