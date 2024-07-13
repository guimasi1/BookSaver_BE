require("dotenv").config({ path: "./config.env" });

const DB = process.env.DATABASE;
const port = process.env.PORT || 3000;

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cors = require("./utils/cors");
const configureRoutes = require("./routes/allRouters");

const app = express();

app.use(cors);
app.use(helmet());
app.use(bodyParser.json());

configureRoutes(app);

mongoose
  .connect(DB)
  .then(() => {
    console.log("successful connection");
    const server = app.listen(port, () => {
      console.log("listening on port " + port);
    });
  })
  .catch((err) => console.log(err));
