console.log("Cargando modelos: Order y Counter...");

const Order = require("../models/modelOrder");
const Counter = require("../models/Counter");
const sendOrderEmail = require("../services/mailer");

const createOrder = async (req, res) => {

  console.log("====================================");
  console.log("INICIO createOrder");
  console.log("Hora servidor:", new Date().toISOString());

  try {

    console.log("Body recibido:", JSON.stringify(req.body, null, 2));

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

    console.log("Validando datos obligatorios...");

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

      console.log("❌ Validación fallida");
      return res.status(400).json({ error: "Datos incompletos" });

    }

    console.log("✅ Validación correcta");

    /*
    ========================
    CALCULO DE TOTALES
    ========================
    */

    console.log("Calculando subtotal...");

    const subtotal = items.reduce((acc, item) => {

      const lineTotal = item.price * item.quantity;

      console.log(
        `Producto: ${item.title} | Precio: ${item.price} | Cantidad: ${item.quantity} | Total: ${lineTotal}`
      );

      return acc + lineTotal;

    }, 0);

    console.log("Subtotal calculado:", subtotal);

    const shippingCost = deliveryMethod === "domicilio" ? 15000 : 0;

    console.log("Costo envío:", shippingCost);

    const totalAmount = subtotal + shippingCost;

    console.log("Total final:", totalAmount);

    /*
    ========================
    NUMERO DE ORDEN
    ========================
    */

    console.log("Generando número de orden...");

    const year = new Date().getFullYear();

    console.log("Año actual:", year);

    const counter = await Counter.findOneAndUpdate(
      { name: `order-${year}` },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    console.log("Contador obtenido:", counter.seq);

    const orderNumber = `ORD-${year}-${String(counter.seq).padStart(4, "0")}`;

    console.log("Número de orden generado:", orderNumber);

    /*
    ========================
    GUARDAR ORDEN
    ========================
    */

    console.log("Guardando orden en MongoDB...");

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

    console.log("✅ Orden guardada correctamente");
    console.log("ID Mongo:", savedOrder._id);

    /*
    ========================
    ENVIO EMAIL
    ========================
    */

    console.log("Preparando envío de email...");

    try {

      console.log("Llamando a sendOrderEmail()");

      await sendOrderEmail(savedOrder);

      console.log("✅ Email enviado correctamente");

      savedOrder.emailSent = true;

      await savedOrder.save();

      console.log("Estado emailSent actualizado en DB");

    } catch (emailError) {

      console.log("❌ ERROR enviando email");

      console.log("Mensaje:", emailError.message);

      console.log("Stack:", emailError.stack);

    }

    console.log("Enviando respuesta al frontend");

    return res.status(201).json({
      success: true,
      orderNumber,
      orderId: savedOrder._id,
    });

  } catch (err) {

    console.log("❌ ERROR CRÍTICO EN CREATE ORDER");

    console.log("Mensaje:", err.message);

    console.log("Stack:", err.stack);

    return res.status(500).json({
      error: "Error al crear la orden",
    });

  }

};
module.exports = { createOrder };