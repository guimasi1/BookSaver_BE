const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

router
  .route("/")
  .get(reviewController.getReviewsByBook)
  .post(authController.protect, reviewController.createReview);

router
  .route("/:id")
  .put(authController.protect, reviewController.updateReview)
  .delete(authController.protect, reviewController.deleteReview);

router.route("/book/:bookId").get(reviewController.getReviewsByBook);

module.exports = router;
