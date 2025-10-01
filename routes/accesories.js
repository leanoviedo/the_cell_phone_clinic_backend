const express = require("express");
const {
  createAccessory,
  getAccessories,
  deleteAccessory,
} = require("../controllers/controllersAccessories.js");

const router = express.Router();

router.get("/", getAccessories);
router.post("/", createAccessory);
router.delete("/:id", deleteAccessory);

module.exports = router;
