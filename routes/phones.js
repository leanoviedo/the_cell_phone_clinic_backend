const express = require("express");
const router = express.Router();
const {
  getPhones,
  getPhoneById,
  createPhones,
  updatePhone,
  deletePhone,
} = require("../controllers/controllerPhones");

router.get("/", getPhones);        // filtros
router.get("/:id", getPhoneById);  // por ID
router.post("/", createPhones);
router.put("/:id", updatePhone);
router.delete("/:id", deletePhone);

module.exports = router;
