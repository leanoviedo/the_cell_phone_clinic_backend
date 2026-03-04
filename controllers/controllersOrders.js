const Order = require("../models/modelOrder");
const Counter = require("../models/Counter");

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

    // Validación
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

    // Cálculos
const subtotal = items.reduce(
  (acc, item) => acc + item.price * item.quantity,
  0
);

// 🔥 Envío fijo hardcodeado
const shippingCost =
  deliveryMethod === "domicilio" ? 15000 : 0;

const totalAmount = subtotal + shippingCost;
    // Generar número de orden
    const year = new Date().getFullYear();

    const counter = await Counter.findOneAndUpdate(
      { name: `order-${year}` },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const orderNumber = `ORD-${year}-${String(counter.seq).padStart(4, "0")}`;

    // Crear orden
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

    // Responder al frontend
    return res.status(201).json({
      success: true,
      orderNumber,
      orderId: savedOrder._id,
    });

  } catch (err) {
    console.error("Order creation error:", err.message);
    return res.status(500).json({ error: "Error al crear la orden" });
  }
};

module.exports = { createOrder };