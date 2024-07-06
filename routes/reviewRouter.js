const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

router
  .route("/")
  .get(reviewController.getReviewsByBook)
  .post(reviewController.createReview);

module.exports = router;
