const express = require("express");
const router = express.Router();
const modelOrder = require("../models/modelOrder");
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

    const order = new modelOrder(req.body);

    console.log("Guardando orden en MongoDB...");

    await order.save();

    console.log("✅ Orden guardada:", order.orderNumber);
    console.log("ID Mongo:", order._id);

    console.log("Intentando enviar email al cliente:", order.customer?.email);

    try {

      await sendOrderEmail(order);

      console.log("✅ Email enviado correctamente");

    } catch (emailError) {

      console.log("❌ Error enviando email:");
      console.log(emailError);

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
      error: "Error creando orden",
    });

  }

});

// ==============================
// VER TODAS LAS ORDENES
// ==============================

router.get("/", async (_req, res) => {

  console.log("================================");
  console.log("📦 GET /api/orders solicitado");

  try {

    console.log("Buscando órdenes en MongoDB...");

    const orders = await modelOrder.find().sort({ createdAt: -1 });

    console.log("Cantidad de órdenes encontradas:", orders.length);

    res.json(orders);

  } catch (error) {

    console.log("❌ ERROR OBTENIENDO ORDENES");
    console.log(error);

    res.status(500).json({
      error: "Error obteniendo órdenes",
    });

  }

});

// ==============================
// VER UNA ORDEN POR ID
// ==============================

router.get("/:id", async (req, res) => {

  console.log("================================");
  console.log("📦 GET /api/orders/:id solicitado");
  console.log("ID recibido:", req.params.id);

  try {

    const order = await modelOrder.findById(req.params.id);

    if (!order) {

      console.log("⚠️ Orden no encontrada");

      return res.status(404).json({
        error: "Orden no encontrada",
      });

    }

    console.log("✅ Orden encontrada:", order.orderNumber);

    res.json(order);

  } catch (error) {

    console.log("❌ ERROR BUSCANDO ORDEN");
    console.log(error);

    res.status(500).json({
      error: "Error obteniendo orden",
    });

  }

});

// ==============================
// REENVIAR EMAIL DE ORDEN
// ==============================

router.post("/:id/resend-email", async (req, res) => {

  console.log("================================");
  console.log("📨 POST /api/orders/:id/resend-email");
  console.log("ID recibido:", req.params.id);

  try {

    const order = await modelOrder.findById(req.params.id);

    if (!order) {

      console.log("⚠️ Orden no encontrada");

      return res.status(404).json({
        error: "Orden no encontrada",
      });

    }

    console.log("Reenviando email a:", order.customer?.email);

    await sendOrderEmail(order);

    console.log("✅ Email reenviado correctamente");

    res.json({
      message: "Email reenviado correctamente",
    });

  } catch (error) {

    console.log("❌ ERROR REENVIANDO EMAIL");
    console.log(error);

    res.status(500).json({
      error: "Error reenviando email",
    });

  }

});

module.exports = router;