const express = require("express");
const router = express.Router();
const authorController = require("../controllers/authorController");
router
  .route("/")
  .get(authorController.getAuthors)
  .post(authorController.createAuthor);

module.exports = router;
