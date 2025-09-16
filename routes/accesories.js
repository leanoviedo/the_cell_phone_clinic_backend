const express = require("express");
const router = express.Router();
const {
  getAccessories,
  createAccessory,
  updateAccessory,
  deleteAccessory
} = require("../controllers/controllersAccessories");

router.get("/", getAccessories);
router.post("/", createAccessory);
router.put("/:id", updateAccessory);
router.delete("/:id", deleteAccessory);

module.exports = router;
