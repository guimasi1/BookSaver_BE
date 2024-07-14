const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const router = express.Router();

router.route("/").get(authController.protect, userController.getAllUsers);

router.route("/me").get(authController.protect, userController.getCurrentUser);

router
  .route("/:userId")
  .get(authController.protect, userController.getUser)
  .delete(
    authController.protect,
    authController.restrictTo("ADMIN"),
    userController.deleteUser
  );

module.exports = router;
