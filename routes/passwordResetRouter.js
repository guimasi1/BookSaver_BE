const express = require("express");
const router = express.Router();

const passwordResetController = require("../controllers/passwordResetController");

router.route("/").post(passwordResetController.passwordReset);
router.route("/:userId/:token").post(passwordResetController.confirmPassword);

module.exports = router;
