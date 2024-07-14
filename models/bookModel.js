const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookSchema = new Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: String,
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  category: {
    type: String,
    enum: ["fantasy", "thriller", "self-help"],
  },
});

module.exports = mongoose.model("Book", bookSchema);
