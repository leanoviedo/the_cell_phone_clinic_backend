const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
  type: String,
  unique: true,
},
    customer: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      dni: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },

    delivery: {
      method: {
        type: String,
        enum: ["local", "domicilio"],
        required: true,
      },
      address: { type: String },
      city: { type: String },
      shippingCost: { type: Number, default: 0 }, // ✅ agregado
    },

    items: [
      {
        productId: { type: String, required: true },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        type: {
          type: String,
          enum: ["phone", "accessory"],
          required: true,
        },
      },
    ],

    subtotal: { type: Number, required: true }, // ✅ agregado
    totalAmount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "paid", "delivered", "cancelled"], // agregué cancelled
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema, "orders");
