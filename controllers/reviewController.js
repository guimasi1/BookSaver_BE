const Review = require("../models/reviewModel");
const Book = require("../models/bookModel");
const User = require("../models/userModel");
const cache = require("../utils/cache");
const errorResponse = require("../utils/errorResponse");
const logger = require("../utils/logger");
const AppError = require("../utils/appError");

exports.createReview = async (req, res, next) => {
  try {
    const { authorId, bookId, rating, content } = req.body;
    const newReview = await Review.create({
      authorId,
      bookId,
      rating,
      content,
    });
    logger.info("Review created");

    await Book.findByIdAndUpdate(bookId, {
      $push: { reviews: newReview },
    });
    logger.info("book updated");

    const books = await Book.find();
    cache.set("books", books);

    await User.findByIdAndUpdate(authorId, {
      $push: { reviews: newReview },
    });
    logger.info("user updated");

    res.status(201).json({
      newReview: newReview._id,
    });
  } catch (err) {
    logger.error(err.message);

    errorResponse(res, 500, "Failed to create the review");
  }
};

exports.getReviewsByBook = async (req, res, next) => {
  try {
    const bookId = req.params.bookId;
    const book = await Book.findById(bookId);
    if (!book) {
      throw new AppError("Book not found");
    }
    const reviews = await Review.find({ bookId: bookId }).select("-bookId");

    logger.info("DB read");

    res.status(200).json({
      status: "success",
      data: { reviews },
    });
  } catch (err) {
    logger.error(err.message);
    errorResponse(res, 500, "Failed to get the reviews. " + err.message);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const reviewId = req.params.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      throw new AppError("Review not found", 404);
    }

    if (
      review.authorId !== req.user.id.toString() &&
      req.user.role !== "ADMIN"
    ) {
      throw new AppError("You have not the authorization", 401);
    }

    await Review.deleteOne({ _id: reviewId });

    logger.info("Review deleted");

    res.status(202).json({
      status: "success",
    });
  } catch (err) {
    errorResponse(res, 500, "Failed to delete review. " + err.message);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const { rating, content } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      throw new AppError("Review not found", 404);
    }

    if (review.authorId.toString() !== req.user.id) {
      throw new AppError("You have not the authorization", 401);
    }

    await Review.findByIdAndUpdate(req.params.id, {
      rating,
      content,
    });
    logger.info("Review updated");

    res.status(204).json({
      status: "success",
    });
  } catch (err) {
    errorResponse(res, 501, "Failed to update. " + err.message);
  }
};
