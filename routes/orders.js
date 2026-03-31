const express = require("express");
const router = express.Router();
const Order = require("../models/modelOrder");
const Counter = require("../models/Counter");
const sendOrderEmail = require("../services/mailer");

// ==============================
// CREAR ORDEN
// ==============================

router.post("/", async (req, res) => {
  const requestId = Date.now();

  console.log("================================");
  console.log("📦 POST /api/orders");
  console.log("RequestID:", requestId);
  console.log("Body:", JSON.stringify(req.body, null, 2));

  try {
    const { customer, delivery, items } = req.body;

    // ========================
    // VALIDACION
    // ========================
    if (
      !customer?.firstName ||
      !customer?.lastName ||
      !customer?.dni ||
      !customer?.email ||
      !customer?.phone
    ) {
      return res.status(400).json({
        error: "Datos de cliente incompletos",
      });
    }

    if (!delivery?.method) {
      return res.status(400).json({
        error: "Método de entrega requerido",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Items inválidos",
      });
    }

    // ========================
    // CALCULOS
    // ========================
    const subtotal = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    const shippingCost =
      delivery.method === "domicilio" ? (subtotal >= 1000 ? 0 : 25000) : 0;

    const totalAmount = subtotal + shippingCost;

    console.log("Subtotal:", subtotal);
    console.log("Envío:", shippingCost);
    console.log("Total:", totalAmount);

    // ========================
    // NUMERO DE ORDEN
    // ========================
    const year = new Date().getFullYear();

    const counter = await Counter.findOneAndUpdate(
      { name: `order-${year}` },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );

    const orderNumber = `ORD-${year}-${String(counter.seq).padStart(5, "0")}`;

    console.log("OrderNumber:", orderNumber);

    // ========================
    // GUARDAR
    // ========================
    const newOrder = new Order({
      orderNumber,
      customer,
      delivery: {
        ...delivery,
        shippingCost,
      },
      items,
      subtotal,
      totalAmount,
      emailSent: false,
    });

    const savedOrder = await newOrder.save();

    console.log("✅ Orden guardada:", savedOrder._id);

    // ========================
    // EMAIL (aislado para no romper)
    // ========================
    try {
      console.log("📨 Enviando email a:", savedOrder.customer.email);

      await sendOrderEmail(savedOrder);

      savedOrder.emailSent = true;
      await savedOrder.save();

      console.log("✅ Email enviado");
    } catch (emailError) {
      console.log("❌ Error enviando email:");
      console.log(emailError.message);
    }

    // ========================
    // RESPUESTA
    // ========================
    return res.status(201).json({
      success: true,
      orderNumber,
      orderId: savedOrder._id,
    });
  } catch (error) {
    console.log("================================");
    console.log("❌ ERROR CREANDO ORDEN");
    console.log("RequestID:", requestId);
    console.log("Mensaje:", error.message);
    console.log("Stack:", error.stack);

    console.log("📦 Datos que rompieron:");
    console.log(JSON.stringify(req.body, null, 2));

    return res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;
