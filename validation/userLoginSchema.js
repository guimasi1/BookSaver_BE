const { checkSchema } = require("express-validator");

const userLoginSchema = checkSchema({
  email: {
    isEmail: {
      errorMessage: "Must be a valid email address",
    },
    normalizeEmail: true,
  },
  password: {
    isLength: {
      options: { min: 8 },
      errorMessage: "Password must be at least 8 characters long",
    },
    matches: {
      options: [/^(?=.*[A-Z])(?=.*\d)/],
      errorMessage:
        "Password must include at least one uppercase letter and one number",
    },
  },
});

module.exports = userLoginSchema;
