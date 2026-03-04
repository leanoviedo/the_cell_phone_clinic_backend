const express = require("express");
const Order = require("../models/modelOrder");
const { sendOrderEmail } = require("../services/mailer");
const connectDB = require("../config/db");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    await connectDB();

    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "OrderId requerido" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    if (order.emailSent) {
      return res.status(200).json({ message: "Email ya enviado" });
    }

    await sendOrderEmail(order);

    await Order.updateOne({ _id: orderId }, { emailSent: true });

    res.json({ success: true });
  } catch (err) {
    console.error("Send email error:", err.message);
    res.status(500).json({ error: "Error enviando email" });
  }
});

module.exports = router;
