const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");
const authController = require("../controllers/authController");
const validate = require("../validation/validate");
const bookRegistrationSchema = require("../validation/bookCreationSchema");

router
  .route("/")
  .get(bookController.getAllBooks)
  .post(
    authController.protect,
    authController.restrictTo("ADMIN"),
    bookRegistrationSchema,
    validate,
    bookController.createBook
  );

router
  .route("/:id")
  .get(bookController.getSingleBook)
  .put(
    authController.protect,
    authController.restrictTo("ADMIN"),
    bookController.updateBook
  )
  .delete(
    authController.protect,
    authController.restrictTo("ADMIN"),
    bookController.deleteBook
  );

router
  .route("/add/:bookId")
  .post(authController.protect, bookController.addBookToFavourites);

router
  .route("/remove/:bookId")
  .post(authController.protect, bookController.removeBookFromFavourites);

router
  .route("/read/:bookId")
  .post(authController.protect, bookController.setBookAsRead);
router
  .route("/not-read/:bookId")
  .post(authController.protect, bookController.setBookAsNotRead);

router
  .route("/:bookId/:authorId")
  .post(authController.protect, bookController.addBookToAuthor);

router
  .route("/:bookId/remove/:authorId")
  .post(authController.protect, bookController.removeBookFromAuthor);

module.exports = router;
