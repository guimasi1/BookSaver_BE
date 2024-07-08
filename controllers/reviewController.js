const Review = require("../models/reviewModel");
const Book = require("../models/bookModel");
const User = require("../models/userModel");
const errorResponse = require("../utils/errorResponse");
const logger = require("../utils/logger");

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
    const reviews = await Review.find({ bookId: req.params.bookId });
    logger.info("DB read");

    res.status(200).json({
      status: "success",
      data: { reviews },
    });
  } catch (err) {
    logger.error(err.message);

    errorResponse(res, 500, "Failed to get the reviews");
  }
};
