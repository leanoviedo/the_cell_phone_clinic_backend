const express = require("express");
const {
  getAccessories,
  createAccessory,
  updateAccessory,
  deleteAccessory,
} = require("../controllers/controllersAccessories");

const router = express.Router();

// ✅ Rutas correctas
router.get("/", getAccessories); // GET todos
router.post("/", createAccessory); // POST crear uno o varios
router.put("/:id", updateAccessory); // PUT actualizar
router.delete("/:id", deleteAccessory); // DELETE eliminar

module.exports = router;
