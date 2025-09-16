const express = require("express");
const router = express.Router();

const {
  getPhones,
  createPhones,  // <-- debe coincidir con el controlador
  updatePhone,
  deletePhone
} = require("../controllers/controllerPhones");

router.get("/", getPhones);
router.post("/", createPhones);   // <-- aquí también coincide
router.put("/:id", updatePhone);
router.delete("/:id", deletePhone);

module.exports = router;
