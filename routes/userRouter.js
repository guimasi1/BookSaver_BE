const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const { protect, restrictTo } = require("../controllers/authController");
const router = express.Router();

router.route("/").get(protect, userController.getAllUsers);

router.route("/me").get(protect, userController.getCurrentUser);

router
  .route("/:userId")
  .get(protect, userController.getUser)
  .delete(protect, restrictTo("ADMIN"), userController.deleteUser);
router
  .route("/username/:username")
  .delete(protect, restrictTo("ADMIN"), userController.deleteUserByUsername);

module.exports = router;
