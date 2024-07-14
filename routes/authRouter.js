const express = require("express");
const authController = require("../controllers/authController");
const validate = require("../validation/validate");
const userRegistrationSchema = require("../validation/userRegistrationSchema");
const userLoginSchema = require("../validation/userLoginSchema");
const router = express.Router();

router
  .route("/signup")
  // .post(userRegistrationSchema, validate, authController.signUp);
  .post(authController.signUp);

router.route("/create-admin").post(authController.createAdmin);
// router.route("/login").post(userLoginSchema, validate, authController.login);
router.route("/login").post(authController.login);

module.exports = router;
