const Order = require("../models/modelOrder");
const Counter = require("../models/Counter");
const { sendOrderEmail } = require("../services/mailer");

const createOrder = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dni,
      email,
      phone,
      deliveryMethod,
      address,
      city,
      items,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !dni ||
      !email ||
      !phone ||
      !deliveryMethod ||
      !items ||
      !Array.isArray(items) ||
      !items.length
    ) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const subtotal = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const shippingCost =
      deliveryMethod === "domicilio" && subtotal <= 1000 ? 15 : 0;

    const totalAmount = subtotal + shippingCost;

    const year = new Date().getFullYear();

    const counter = await Counter.findOneAndUpdate(
      { name: `order-${year}` },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const orderNumber = `ORD-${year}-${String(counter.seq).padStart(4, "0")}`;

    const newOrder = new Order({
      orderNumber,
      customer: { firstName, lastName, dni, email, phone },
      delivery: {
        method: deliveryMethod,
        address,
        city,
        shippingCost,
      },
      items,
      subtotal,
      totalAmount,
      emailSent: false,
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
      success: true,
      orderNumber,
      orderId: savedOrder._id,
    });

    try {
      await sendOrderEmail(savedOrder);
      savedOrder.emailSent = true;
      await savedOrder.save();
    } catch (err) {
      console.error("Email error:", err.message);
    }

  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createOrder };