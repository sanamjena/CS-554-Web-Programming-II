const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
require("mongoose-uuid2")(mongoose);

const articlesSchema = mongoose.Schema({
  _id: { type: mongoose.Schema.Types.UUID, default: uuidv4 },
  title: mongoose.Schema.Types.String,
  text: mongoose.Schema.Types.String,
  html: mongoose.Schema.Types.String,
  keywords: mongoose.Schema.Types.Mixed,
  ratings: mongoose.Schema.Types.Mixed,
  cost: mongoose.Schema.Types.Number,
  read: mongoose.Schema.Types.Number,
  rating: mongoose.Schema.Types.Number,
  author: { type: mongoose.Schema.Types.UUID, default: uuidv4 },
});

const Articles123 = mongoose.model("articles", articlesSchema);
module.exports = Articles123;
