const mongoose = require("mongoose");

const AccessorySchema = new mongoose.Schema(
  {
    id: String,
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    alt: String,
    link: String,
    price: { type: Number, required: true },
    category: { type: String, required: true },
    promotion: { type: Boolean, default: false },
    stock: { type: Boolean, default: true },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Accessory", AccessorySchema, "accesories");
