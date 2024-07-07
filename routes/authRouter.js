const express = require("express");
const authController = require("../controllers/authController");
const validate = require("../validation/validate");
const router = express.Router();

router.route("/signup").post(validate, authController.signUp);
router.route("/login").post(authController.login);

module.exports = router;
