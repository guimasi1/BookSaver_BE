const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");

router
  .route("/")
  .get(bookController.getAllBooks)
  .post(bookController.createBook);

router
  .route("/add/:bookId/user/:userId")
  .post(bookController.addBookToFavourites);

router
  .route("/remove/:bookId/user/:userId")
  .post(bookController.removeBookFromFavourites);

module.exports = router;
