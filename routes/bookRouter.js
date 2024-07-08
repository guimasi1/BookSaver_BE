const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");
const validate = require("../validation/validate");
const bookRegistrationSchema = require("../validation/bookCreationSchema");

router
  .route("/")
  .get(bookController.getAllBooks)
  .post(bookRegistrationSchema, validate, bookController.createBook);

router
  .route("/add/:bookId/user/:userId")
  .post(bookController.addBookToFavourites);

router
  .route("/remove/:bookId/user/:userId")
  .post(bookController.removeBookFromFavourites);

router.route("/read/:bookId/:userId").post(bookController.setBookAsRead);
router.route("/not-read/:bookId/:userId").post(bookController.setBookAsNotRead);

module.exports = router;
