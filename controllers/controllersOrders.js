const { sendOrderEmail } = require("../services/mailer");
const Order = require("../models/modelOrder");

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
      items.length === 0
    ) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    /* ======================
       CALCULOS
    ====================== */

    const subtotal = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    let shippingCost = 0;
    if (deliveryMethod === "domicilio") {
      shippingCost = subtotal > 1000 ? 0 : 15;
    }

    const totalAmount = subtotal + shippingCost;

    /* ======================
       NUMERO ORDEN
    ====================== */

    const year = new Date().getFullYear();

    const countThisYear = await Order.countDocuments({
      orderNumber: { $regex: `ORD-${year}-` },
    });

    const formattedNumber = String(countThisYear + 1).padStart(4, "0");
    const orderNumber = `ORD-${year}-${formattedNumber}`;

    /* ======================
       CREAR ORDEN
    ====================== */

    const newOrder = new Order({
      orderNumber,
      customer: { firstName, lastName, dni, email, phone },
      delivery: {
        method: deliveryMethod,
        address: deliveryMethod === "domicilio" ? address : undefined,
        city: deliveryMethod === "domicilio" ? city : undefined,
        shippingCost,
      },
      items,
      subtotal,
      totalAmount,
    });

    const savedOrder = await newOrder.save();

    /* ======================
       ENVIAR EMAIL ✅
    ====================== */

    try {
      console.log("📧 Enviando email...");

      await sendOrderEmail(savedOrder);

      savedOrder.emailSent = true;
      await savedOrder.save();

      console.log("✅ Email enviado");
    } catch (mailError) {
      console.error("📧 Error enviando email:", mailError);

      savedOrder.emailSent = false;
      await savedOrder.save();
    }

    /* ======================
       RESPUESTA FINAL
    ====================== */

    res.status(201).json({
      message: "Orden creada correctamente",
      orderNumber: savedOrder.orderNumber,
      orderId: savedOrder._id,
    });

  } catch (error) {
    console.error("❌ Error al crear orden:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createOrder,
};