const express = require("express");
const connectDB = require("../config/db");
const { createOrder } = require("../controllers/controllersOrders");

const router = express.Router();

router.post("/", async (req, res) => {
  await connectDB();
  return createOrder(req, res);
});

module.exports = router;