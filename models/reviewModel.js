const mongoose = require("mongoose");

const { Schema } = mongoose;

const reviewSchema = new Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  rating: {
    type: Number,
    max: 5,
    min: 1,
    required: true,
  },
  content: {
    type: String,
    maxLength: 300,
  },
});

module.exports = mongoose.model("Review", reviewSchema);
