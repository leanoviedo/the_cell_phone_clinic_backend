const mongoose = require("mongoose");

const phoneSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    alt: { type: String, required: true },
    link: { type: String, required: true },
    price: { type: Number, required: true },
    brand: { type: String, required: true },
    ram: String,
    storage: { type: String, required: true },
    battery: String,
    color: String,
    stock: { type: Boolean, default: true, required: true },
    promotion: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Phone", phoneSchema);
