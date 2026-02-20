const express = require("express");
const {
  createOrder,
  getOrders,
  deleteOrder,
  updateOrderStatus,
} = require("../controllers/controllersOrders");


const router = express.Router();

router.post("/", createOrder);
router.get("/", getOrders);
router.delete("/:id", deleteOrder);
router.patch("/:id/status", updateOrderStatus);


module.exports = router;
