console.log("Cargando modelos: Order y Counter...");

const Order = require("../models/modelOrder");
const Counter = require("../models/Counter");
const sendOrderEmail = require("../services/mailer");

const createOrder = async (req, res) => {
  const requestId = Math.random().toString(36).substring(2, 10);
  const startTime = Date.now();

  console.log("=================================================");
  console.log("📦 CREATE ORDER REQUEST");
  console.log("RequestID:", requestId);
  console.log("Hora servidor:", new Date().toISOString());

  try {
    console.log("-------------------------------------------------");
    console.log("📥 BODY RECIBIDO");
    console.log(JSON.stringify(req.body, null, 2));

    // ⚠️ IMPORTANTE: el frontend ya manda customer y delivery
    const { customer, delivery, items } = req.body;

    /*
    ========================
    VALIDACION
    ========================
    */
    console.log("-------------------------------------------------");
    console.log("🔎 Validando datos...");

    if (
      !customer?.firstName ||
      !customer?.lastName ||
      !customer?.dni ||
      !customer?.email ||
      !customer?.phone
    ) {
      return res.status(400).json({ error: "Datos de cliente incompletos" });
    }

    if (!delivery?.method) {
      return res.status(400).json({ error: "Método de entrega requerido" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items inválidos" });
    }

    console.log("✅ Validación correcta");

    /*
    ========================
    CALCULO DE TOTALES
    ========================
    */
    console.log("-------------------------------------------------");
    console.log("💰 Calculando totales...");

    const subtotal = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const shippingCost =
      delivery.method === "domicilio"
        ? subtotal >= 1000
          ? 0
          : 25000
        : 0;

    const totalAmount = subtotal + shippingCost;

    console.log("Subtotal:", subtotal);
    console.log("Envío:", shippingCost);
    console.log("Total:", totalAmount);

    /*
    ========================
    NUMERO DE ORDEN (SECUENCIAL)
    ========================
    */
    console.log("-------------------------------------------------");
    console.log("🔢 Generando número de orden...");

    const year = new Date().getFullYear();

    const counter = await Counter.findOneAndUpdate(
      { name: `order-${year}` },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const orderNumber = `ORD-${year}-${String(counter.seq).padStart(5, "0")}`;

    console.log("Número generado:", orderNumber);

    /*
    ========================
    CREAR ORDEN
    ========================
    */
    console.log("-------------------------------------------------");
    console.log("💾 Guardando orden...");

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

    /*
    ========================
    EMAIL
    ========================
    */
    console.log("-------------------------------------------------");
    console.log("📨 Enviando email...");

    try {
      await sendOrderEmail(savedOrder);

      savedOrder.emailSent = true;
      await savedOrder.save();

      console.log("✅ Email enviado");
    } catch (emailError) {
      console.log("❌ Error enviando email:", emailError.message);
    }

    /*
    ========================
    RESPUESTA
    ========================
    */
    console.log("-------------------------------------------------");
    console.log("🚀 RESPUESTA");

    console.log("OrderNumber:", orderNumber);
    console.log("Tiempo:", Date.now() - startTime, "ms");

    return res.status(201).json({
      success: true,
      orderNumber,
      orderId: savedOrder._id,
    });
  } catch (err) {
    console.log("=================================================");
    console.log("❌ ERROR CRÍTICO");

    console.log("Mensaje:", err.message);
    console.log("Stack:", err.stack);

    return res.status(500).json({
      error: err.message, // 👈 importante para debug
    });
  }
};

module.exports = { createOrder };