const { checkSchema } = require("express-validator");

const bookRegistrationSchema = checkSchema({
  title: {
    notEmpty: {
      value: true,
      errorMessage: "Title must not be empty",
    },
  },
  description: {
    notEmpty: {
      value: true,
      errorMessage: "Description cannot be empty",
    },
    isLength: {
      options: {
        max: 200,
        errorMessage: "Description cannot be more than 200 characters.",
      },
    },
  },
  authorId: {
    notEmpty: true,
    errorMessage: "Insert a valid author id",
  },
});

module.exports = bookRegistrationSchema;
