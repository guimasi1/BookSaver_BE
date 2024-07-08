const { validationResult } = require("express-validator");

module.exports = (req, res, next) => {
  const errors = validationResult(req).formatWith(({ msg, path, value }) => ({
    msg,
    path,
    value,
  }));

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};
