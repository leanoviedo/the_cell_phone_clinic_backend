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

    const subtotal = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    let shippingCost = 0;
    if (deliveryMethod === "domicilio") {
      shippingCost = subtotal > 1000 ? 0 : 15;
    }

    const totalAmount = subtotal + shippingCost;

    const year = new Date().getFullYear();

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

    sendOrderEmail(savedOrder)
      .then(async () => {
        savedOrder.emailSent = true;
        await savedOrder.save();
      })
      .catch(async (mailError) => {
        console.error("📧 Error enviando email:", mailError.message);
        savedOrder.emailSent = false;
        await savedOrder.save();
      });

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

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    if (action === "paid") {
      if (order.isCancelled) {
        return res.status(400).json({
          error: "No se puede pagar una orden cancelada",
        });
      }

      order.isPaid = true;
      order.paidAt = new Date();
    }

    if (action === "preparing") {
      if (!order.isPaid) {
        return res.status(400).json({
          error: "No se puede preparar una orden no pagada",
        });
      }

      order.isPreparing = true;
    }

    if (action === "shipped") {
      if (!order.isPaid) {
        return res.status(400).json({
          error: "No se puede enviar una orden no pagada",
        });
      }

      order.isShipped = true;
      order.shippedAt = new Date();
    }

    if (action === "cancelled") {
      if (order.isShipped) {
        return res.status(400).json({
          error: "No se puede cancelar una orden enviada",
        });
      }

      order.isCancelled = true;
      order.cancelledAt = new Date();
    }

    await order.save();

    res.status(200).json({
      message: "Estado actualizado correctamente",
      order,
    });
  } catch (error) {
    console.error("❌ Error actualizando estado:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  deleteOrder,
  updateOrderStatus,
};
