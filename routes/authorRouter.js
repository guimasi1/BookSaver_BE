const express = require("express");
const router = express.Router();
const authorController = require("../controllers/authorController");
const authController = require("../controllers/authController");
router
  .route("/")
  .get(authorController.getAuthors)
  .post(authorController.createAuthor);

router
  .route("/:id")
  .delete(
    authController.protect,
    authController.restrictTo("ADMIN"),
    authorController.deleteAuthor
  );

module.exports = router;
