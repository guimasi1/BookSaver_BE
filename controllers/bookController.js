const Book = require("../models/bookModel");
const Author = require("../models/authorModel");
const User = require("../models/userModel");
const errorResponse = require("../utils/errorResponse");

exports.createBook = async (req, res, next) => {
  try {
    const newBook = await Book.create({
      authorId: req.body.authorId,
      title: req.body.title,
      description: req.body.description,
    });

    const author = await Author.findByIdAndUpdate(req.body.authorId, {
      $push: { books: newBook },
    });

    res.status(201).json({
      status: "success",
      newBook,
    });
  } catch (err) {
    errorResponse(res, 500, "Failed to create book");
  }
};

exports.getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.find();
    res.status(200).json({
      status: "success",
      data: { books },
    });
  } catch (err) {
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

    const bookIds = user.favouriteBooks.map((book) => book._id.toString());
    if (bookIds.includes(req.params.bookId)) {
      return res.status(409).json({
        status: "failed",
        message: "The book is already in the favourite books array",
      });
    }

    await User.findByIdAndUpdate(req.params.userId, {
      $push: { favouriteBooks: book._id },
    });

    res.status(200).json({
      status: "book added successfully",
    });
  } catch (err) {
    errorResponse(res, 500, "Failed to add book to favourites");
  }
};

exports.removeBookFromFavourites = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.bookId);

    await User.findByIdAndUpdate(req.params.userId, {
      $pull: { favouriteBooks: req.params.bookId },
    });

    res.status(200).json({
      status: "success",
      message: "Book removed successfully",
    });
  } catch (err) {
    errorResponse(res, 500, "Failed to remove book from favourites");
  }
};
