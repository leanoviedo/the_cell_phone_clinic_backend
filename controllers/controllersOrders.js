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
  console.log("IP:", req.headers["x-forwarded-for"] || req.socket.remoteAddress);
  console.log("UserAgent:", req.headers["user-agent"]);

  try {

    console.log("-------------------------------------------------");
    console.log("📥 BODY RECIBIDO");

    console.log(JSON.stringify(req.body, null, 2));

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

    /*
    ========================
    VALIDACION
    ========================
    */

    console.log("-------------------------------------------------");
    console.log("🔎 Validando datos obligatorios...");

    if (!firstName) console.log("❌ Falta firstName");
    if (!lastName) console.log("❌ Falta lastName");
    if (!dni) console.log("❌ Falta dni");
    if (!email) console.log("❌ Falta email");
    if (!phone) console.log("❌ Falta phone");
    if (!deliveryMethod) console.log("❌ Falta deliveryMethod");

    if (!items) console.log("❌ items es undefined");
    if (!Array.isArray(items)) console.log("❌ items no es array");
    if (Array.isArray(items) && items.length === 0) console.log("❌ items vacío");

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

      console.log("❌ VALIDACION FALLIDA");

      return res.status(400).json({
        error: "Datos incompletos",
      });

    }

    console.log("✅ Validación correcta");

    /*
    ========================
    CALCULO DE TOTALES
    ========================
    */

    console.log("-------------------------------------------------");
    console.log("💰 Calculando subtotal...");

    const subtotal = items.reduce((acc, item, index) => {

      if (!item.price || !item.quantity) {
        console.log("⚠️ Item inválido:", item);
      }

      const lineTotal = item.price * item.quantity;

      console.log(
        `Item ${index + 1} -> ${item.title} | Precio: ${item.price} | Cantidad: ${item.quantity} | Total: ${lineTotal}`
      );

      return acc + lineTotal;

    }, 0);

    console.log("Subtotal:", subtotal);

    const shippingCost = deliveryMethod === "domicilio" ? 15000 : 0;

    console.log("Costo envío:", shippingCost);

    const totalAmount = subtotal + shippingCost;

    console.log("Total final:", totalAmount);

    /*
    ========================
    NUMERO DE ORDEN
    ========================
    */

    console.log("-------------------------------------------------");
    console.log("🔢 Generando número de orden");

    const year = new Date().getFullYear();

    console.log("Año actual:", year);

    const counter = await Counter.findOneAndUpdate(
      { name: `order-${year}` },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    console.log("Contador actual:", counter.seq);

    const orderNumber = `ORD-${year}-${String(counter.seq).padStart(4, "0")}`;

    console.log("Número de orden:", orderNumber);

    /*
    ========================
    GUARDAR ORDEN
    ========================
    */

    console.log("-------------------------------------------------");
    console.log("💾 Guardando orden en MongoDB");

    const newOrder = new Order({
      orderNumber,

      customer: {
        firstName,
        lastName,
        dni,
        email,
        phone,
      },

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

    console.log("✅ Orden guardada en MongoDB");
    console.log("MongoID:", savedOrder._id);

    /*
    ========================
    ENVIO EMAIL
    ========================
    */

    console.log("-------------------------------------------------");
    console.log("📨 Iniciando envío de email");

    try {

      console.log("Llamando sendOrderEmail()");

      await sendOrderEmail(savedOrder);

      console.log("✅ Email enviado");

      savedOrder.emailSent = true;

      await savedOrder.save();

      console.log("Estado emailSent actualizado");

    } catch (emailError) {

      console.log("❌ ERROR EMAIL");

      console.log("Mensaje:", emailError.message);

      console.log("Stack:", emailError.stack);

    }

    /*
    ========================
    RESPUESTA
    ========================
    */

    const endTime = Date.now();

    console.log("-------------------------------------------------");
    console.log("🚀 RESPUESTA AL FRONTEND");

    console.log("OrderNumber:", orderNumber);
    console.log("Tiempo ejecución:", endTime - startTime, "ms");
    console.log("RequestID:", requestId);

    return res.status(201).json({
      success: true,
      orderNumber,
      orderId: savedOrder._id,
    });

  } catch (err) {

    console.log("=================================================");
    console.log("❌ ERROR CRÍTICO EN CREATE ORDER");

    console.log("RequestID:", requestId);

    console.log("Mensaje:", err.message);

    console.log("Stack:", err.stack);

    return res.status(500).json({
      error: "Error al crear la orden",
    });

  }

};

module.exports = { createOrder };