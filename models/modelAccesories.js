const mongoose = require("mongoose");

const AccessorySchema = new mongoose.Schema(
  {
    id: String,
    title: String,
    description: String,
    image: String,
    alt: String,
    link: String,
    price: Number,
    category: String,
    stock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Accessory", AccessorySchema);