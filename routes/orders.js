const express = require("express");
const router = express.Router();

const { createOrder } = require("../controllers/controllersOrders");

router.post("/", createOrder);

module.exports = router;