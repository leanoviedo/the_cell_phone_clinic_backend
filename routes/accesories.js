const express = require("express");
const {
  createAccessory,
  getAccessories,
  deleteAccessory,
} = require("../controllers/controllersAccessories.js");

const router = express.Router();
router.get("/", getAccessories);          // GET todos los accesorios
router.post("/", createAccessory);        // POST crear uno o varios
router.put("/:id", createAccessory);      // PUT actualizar accesorio
router.delete("/:id", deleteAccessory);   // DELETE eliminar accesorio

module.exports = router;
