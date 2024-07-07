const Review = require("../models/reviewModel");
const Book = require("../models/bookModel");
const User = require("../models/userModel");
const errorResponse = require("../utils/errorResponse");

exports.createReview = async (req, res, next) => {
  try {
    const { authorId, bookId, rating, content } = req.body;
    const newReview = await Review.create({
      authorId,
      bookId,
      rating,
      content,
    });

    await Book.findByIdAndUpdate(bookId, {
      $push: { reviews: newReview },
    });

    await User.findByIdAndUpdate(authorId, {
      $push: { reviews: newReview },
    });

    res.status(201).json({
      newReview: newReview._id,
    });
  } catch (err) {
    errorResponse(res, 500, "Failed to create the review");
  }
};

exports.getReviewsByBook = async (req, res, next) => {
  try {
    const reviews = await Review.find({ bookId: req.params.bookId });

    res.status(200).json({
      status: "success",
      data: { reviews },
    });
  } catch (err) {
    errorResponse(res, 500, "Failed to get the reviews");
  }
};
