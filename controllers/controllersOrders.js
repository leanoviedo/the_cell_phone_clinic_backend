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
      0,
    );

    const shippingCost =
      deliveryMethod === "domicilio" && subtotal <= 1000 ? 15 : 0;

    const totalAmount = subtotal + shippingCost;

    // Generar número de orden
    const year = new Date().getFullYear();

    const counter = await Counter.findOneAndUpdate(
      { name: `order-${year}` },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
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

    // ✅ Responder inmediatamente
    res.status(201).json({
      success: true,
      orderNumber,
      orderId: savedOrder._id,
    });

    // ✅ Enviar email en segundo plano
    setImmediate(async () => {
      try {
        await sendOrderEmail(savedOrder);
        await Order.updateOne({ _id: savedOrder._id }, { emailSent: true });
        console.log("📧 Email enviado correctamente");
      } catch (err) {
        console.error("Email error:", err.message);
      }
    });
  } catch (err) {
    console.error("Order creation error:", err.message);
    res.status(500).json({ error: "Error al crear la orden" });
  }
};

module.exports = { createOrder };
