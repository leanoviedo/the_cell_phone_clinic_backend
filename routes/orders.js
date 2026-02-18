const express = require("express");
const { createOrder, getOrders } = require("../controllers/controllersOrders");

const router = express.Router();
router.post("/", createOrder);
router.get("/", getOrders);

module.exports = router;
