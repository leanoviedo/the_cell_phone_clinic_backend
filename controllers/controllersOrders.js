const Order = require("../models/modelOrder");
const connectDB = require("../config/db");

const createOrder = async (req, res) => {
  try {
    await connectDB(); 

    const { customerName, customerPhone, items } = req.body;

    if (!customerName || !customerPhone || !items || items.length === 0) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const totalAmount = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    const newOrder = new Order({
      customerName,
      customerPhone,
      items,
      totalAmount,
    });

    const savedOrder = await newOrder.save();

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("❌ Error al crear orden:", error);
    res.status(500).json({ error: error.message });
  }
};

const getOrders = async (_req, res) => {
  try {
    await connectDB(); 

    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
};
