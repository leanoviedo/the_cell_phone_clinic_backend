const { sendOrderEmail } = require("../services/mailer");
const Order = require("../models/modelOrder");

/* ============================
   CREAR ORDEN
============================ */

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
      return res.status(400).json({
        error: "Datos incompletos",
      });
    }

    /* ============================
       CALCULOS
    ============================ */

    const subtotal = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const shippingCost =
      deliveryMethod === "domicilio" && subtotal <= 1000 ? 15 : 0;

    const totalAmount = subtotal + shippingCost;

    const year = new Date().getFullYear();

    const count = await Order.countDocuments({
      orderNumber: { $regex: `ORD-${year}-` },
    });

    const orderNumber = `ORD-${year}-${String(
      count + 1
    ).padStart(4, "0")}`;

    /* ============================
       GUARDAR ORDEN
    ============================ */

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

    /* ============================
       EMAIL ASYNC SEGURO
    ============================ */

    sendOrderEmail(savedOrder)
      .then(async () => {
        savedOrder.emailSent = true;
        await savedOrder.save();
        console.log("✅ Email marcado como enviado");
      })
      .catch(async (err) => {
        console.error("📧 Falló email:", err.message);
      });

    /* ============================
       RESPUESTA API
    ============================ */

    res.status(201).json({
      message: "Orden creada correctamente",
      orderNumber,
      orderId: savedOrder._id,
    });
  } catch (error) {
    console.error("❌ CREATE ORDER ERROR:", error);
    res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
};