const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const router = express.Router();

router.route("/").get(userController.getAllUsers);

router
  .route("/:userId")
  .delete(authController.protect, userController.deleteUser);

module.exports = router;
