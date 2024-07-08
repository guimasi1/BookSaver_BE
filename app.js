require("dotenv").config({ path: "./config.env" });

const DB = process.env.DATABASE;
const port = process.env.PORT;

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("./utils/cors");
const bookRouter = require("./routes/bookRouter");
const userRouter = require("./routes/userRouter");
const authRouter = require("./routes/authRouter");
const authorRouter = require("./routes/authorRouter");
const reviewRouter = require("./routes/reviewRouter");

const app = express();

app.use(cors);
app.use(helmet());
app.use(bodyParser.json());
app.use("/auth", authRouter);
app.use("/books", bookRouter);
app.use("/users", userRouter);
app.use("/authors", authorRouter);
app.use("/reviews", reviewRouter);

mongoose
  .connect(DB)
  .then(() => {
    console.log("successful connection");
    const server = app.listen(port, () => {
      console.log("listening on port " + port);
    });
  })
  .catch((err) => console.log(err));
