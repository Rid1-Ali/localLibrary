const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let smartphone = new Schema({
  name: String,
  price: Number,
  inStock: Boolean
});

const model = mongoose.model("smartphones", smartphone)

module.exports = model;