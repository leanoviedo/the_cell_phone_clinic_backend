const express = require("express");
const router = express.Router();
const Order = require("../models/modelOrder");
const sendOrderEmail = require("../services/mailer");

// ==============================
// CREAR ORDEN
// ==============================

router.post("/", async (req, res) => {
  console.log("================================");
  console.log("📦 POST /api/orders recibido");
  console.log("Body recibido:", JSON.stringify(req.body, null, 2));

  try {
    console.log("Creando nueva orden...");

    const order = new Order(req.body);

    // 🔥 SOLUCIÓN CLAVE → generar orderNumber
    order.orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    console.log("Número de orden generado:", order.orderNumber);

    console.log("Guardando orden en MongoDB...");

    await order.save();

    console.log("✅ Orden guardada en producción");
    console.log("🧾 OrderNumber:", order.orderNumber);
    console.log("👤 Cliente:", order.customer.email);

    try {
      console.log("📨 Intentando enviar email a:", order.customer.email);

      await sendOrderEmail(order);

      console.log("✅ Email enviado correctamente a:", order.customer.email);
    } catch (emailError) {
      console.log("❌ Error enviando email:");
      console.log(emailError.message);
    }

    console.log("Enviando respuesta al frontend");

    res.status(201).json({
      message: "Orden creada correctamente",
      order,
    });
  } catch (error) {
    console.log("❌ ERROR CREANDO ORDEN");
    console.log("Mensaje:", error.message);
    console.log("Stack:", error.stack);

    res.status(500).json({
      error: error.message, // 👈 importante para debug
    });
  }
});
module.exports = router;
