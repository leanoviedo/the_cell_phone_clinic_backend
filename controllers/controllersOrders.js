// controllers/controllersOrders.js
const Order = require("../models/modelOrder");

/* =======================
   Crear orden
======================= */
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

    // Validación básica
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
    // Calcular subtotal
    const subtotal = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    // Calcular costo de envío
    let shippingCost = 0;
    if (deliveryMethod === "domicilio") {
      shippingCost = subtotal > 1000 ? 0 : 15;
    }
    const totalAmount = subtotal + shippingCost;

    const year = new Date().getFullYear();

    // Contar órdenes existentes de este año
    const countThisYear = await Order.countDocuments({
      orderNumber: { $regex: `ORD-${year}-` },
    });

    const formattedNumber = String(countThisYear + 1).padStart(4, "0");
    const orderNumber = `ORD-${year}-${formattedNumber}`;

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
const getOrders = async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: 1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Error al obtener órdenes:", error);
    res.status(500).json({ error: error.message });
  }
};
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Order.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }
    await reorderOrders();

    res.status(200).json({ message: "Orden eliminada y números reordenados" });
  } catch (error) {
    console.error("❌ Error al eliminar orden:", error);
    res.status(500).json({ error: error.message });
  }
};

const reorderOrders = async () => {
  const year = new Date().getFullYear();

  const orders = await Order.find({
    orderNumber: { $regex: `ORD-${year}-` },
  }).sort({ createdAt: 1 });

  for (let i = 0; i < orders.length; i++) {
    const formattedNumber = String(i + 1).padStart(4, "0");
    orders[i].orderNumber = `ORD-${year}-${formattedNumber}`;
    await orders[i].save();
  }
};

module.exports = { createOrder, getOrders, deleteOrder, reorderOrders };
