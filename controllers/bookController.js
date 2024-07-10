const Book = require("../models/bookModel");
const Author = require("../models/authorModel");
const User = require("../models/userModel");
const errorResponse = require("../utils/errorResponse");
const logger = require("../utils/logger");
const cache = require("../utils/cache");
const AppError = require("../utils/appError");

exports.createBook = async (req, res, next) => {
  try {
    if (!req.body) {
      logger.warn("received bad request: invalid body");
      res.status(400).json({
        status: "failed",
        message: "invalid body",
      });
    }
    const { authorId, title, description } = req.body;

    const bookWithSameTitleAndAuthor = await Book.findOne({ authorId, title });
    if (bookWithSameTitleAndAuthor) {
      logger.error(
        `Book with title: ${title} and authorId: ${authorId} already exists.`
      );
      throw new Error(`the book with the title '${title}' already exists`);
    }

    const newBook = await Book.create({
      authorId,
      title,
      description,
    });
    logger.info("Book created");

    const books = await Book.find();
    cache.set("books", books);
    logger.info("book added to cache");

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

exports.deleteBook = async (req, res, next) => {
  try {
    const result = await Book.deleteOne({ _id: req.params.id });

    if (result.deletedCount === 0) {
      logger.warn("book not found");
      throw new AppError(`Book with id ${req.params.id} not found`);
    }

    logger.info("book deleted");

    let books = cache.get("books");
    if (books) {
      books = books.filter((book) => book._id !== req.params.id);
      cache.set("books", books);
    }
    logger.info("book removed from cache");

    res.status(202).json({ status: "success" });
  } catch (err) {
    logger.error(err.message);
    errorResponse(res, 500, "Failed to delete book: " + err.message);
  }
};

exports.getSingleBook = async (req, res, next) => {
  try {
    cache.del("books");
    const book = await Book.findById(req.params.id);
    if (!book) {
      logger.warn("Book not found");
      throw new AppError(`Book with id ${req.params.id} not found`, 404);
    }
    logger.info("DB read");

    res.status(200).json({
      status: "success",
      data: { book },
    });
  } catch (err) {
    logger.error(err.message);
    errorResponse(res, 500, "Failed to retrieve book: " + err.message);
  }
};

exports.getAllBooks = async (req, res, next) => {
  try {
    if (cache.has("books")) {
      const cachedBooks = cache.get("books");
      logger.info("books retrieved from the cache");

      return res.status(200).json({
        status: "success",
        data: { books: cachedBooks },
      });
    }

    const books = await Book.find();
    cache.set("books", books);
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

exports.updateBook = async (req, res, next) => {
  try {
    const { title, description, authorId } = req.body;

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true, runValidators: true }
    );

    if (!updatedBook) {
      logger.warn("Book not found");
      throw new AppError(`Book with id ${req.params.id} not found`, 404);
    }

    logger.info("book updated");

    const books = await Book.find();
    cache.set("books", books);
    logger.info("cached books updated");

    res.status(200).json({
      status: "success",
    });
  } catch (err) {
    logger.error(err.message);
    errorResponse(res, 500, "failed to update book. " + err.message);
  }
};

exports.addBookToFavourites = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      throw new AppError(`Book with id ${req.params.bookId} not found`, 404);
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      logger.warn("user not found");
      throw new AppError("User not found", 404);
    }
    logger.info("User found");

    const bookIds = user.favouriteBooks.map((book) => book._id.toString());
    if (bookIds.includes(req.params.bookId)) {
      logger.warn("The book is already in the favourite books array");
      return res.status(409).json({
        status: "failed",
        message: "The book is already in the favourite books array",
      });
    }

    await User.findByIdAndUpdate(req.user.id, {
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
    if (!book) {
      logger.warn("Book not found");
      throw new AppError(`Book with id ${req.params.bookId} not found`);
    }

    const user = await User.findByIdAndUpdate(req.user.id, {
      $pull: { favouriteBooks: req.params.bookId },
    });

    if (!user) {
      logger.warn("User not found");
      throw new AppError("User not found", 404);
    }

    logger.info("book removed");

    res.status(200).json({
      status: "success",
      message: "Book removed successfully",
    });
  } catch (err) {
    logger.error(err.message);
    errorResponse(
      res,
      500,
      "Failed to remove book from favourites. " + err.message
    );
  }
};

exports.setBookAsRead = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) {
      throw new AppError(`Book with id ${req.params.bookId} not found`, 404);
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      logger.warn("user not found");
      throw new AppError("User not found", 404);
    }
    logger.info("User found");

    const bookIds = user.readBooks.map((book) => book._id.toString());
    if (bookIds.includes(req.params.bookId)) {
      logger.warn("The book is already in the read books array");
      return res.status(409).json({
        status: "failed",
        message: "The book is already in the read books array",
      });
    }

    user.readBooks.push(book._id);
    await user.save();
    logger.info("book added to read books");

    res.status(200).json({
      status: "success",
      message: "Book set successfully as read",
    });
  } catch (err) {
    logger.error(err.message);
    errorResponse(res, 500, "Failed to set book as read. " + err.message);
  }
};

exports.setBookAsNotRead = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      logger.warn("User not found");
      throw new AppError("User not found");
    }
    let books;
    if (user.readBooks.includes(req.params.bookId)) {
      books = user.readBooks.filter((book) => book._id !== req.params.bookId);
    } else {
      throw new AppError("The book is not a read book", 404);
    }

    user.readBooks = books;
    await user.save();
    logger.info("book removed from read books");

    res.status(200).json({
      status: "success",
      message: "Book set successfully as not read",
    });
  } catch (err) {
    logger.error(err.message);
    errorResponse(res, 500, "Failed to set book as not read. " + err.message);
  }
};
