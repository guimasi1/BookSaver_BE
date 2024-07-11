const bookRouter = require("./bookRouter");
const userRouter = require("./userRouter");
const authRouter = require("./authRouter");
const authorRouter = require("./authorRouter");
const reviewRouter = require("./reviewRouter");
const passwordResetRouter = require("./passwordResetRouter");

const configureRoutes = (app) => {
  app.use("/auth", authRouter);
  app.use("/books", bookRouter);
  app.use("/users", userRouter);
  app.use("/authors", authorRouter);
  app.use("/reviews", reviewRouter);
  app.use("/reset-password", passwordResetRouter);
};
module.exports = configureRoutes;
