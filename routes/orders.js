console.log("Cargando dependencia: express...");
const express = require("express");

console.log("Cargando configuración de base de datos: connectDB...");
const connectDB = require("../config/db");

console.log("Cargando controlador: createOrder...");
const { createOrder } = require("../controllers/controllersOrders");

console.log("Inicializando el router de Express...");
const router = express.Router();

console.log("Configurando ruta POST '/' para órdenes...");
router.post("/", async (req, res) => {
  console.log("--- Nueva petición POST recibida en /api/orders ---");
  
  try {
    console.log("Intentando conectar a la base de datos antes de procesar...");
    await connectDB();
    console.log("Conexión a la base de datos confirmada para esta petición.");

    console.log("Derivando la petición al controlador createOrder...");
    return createOrder(req, res);
    
  } catch (error) {
    console.error("ERROR en la ruta de órdenes:", error.message);
    return res.status(500).json({ error: "Error interno en la ruta de órdenes" });
  }
});

console.log("Exportando el router de órdenes...");
module.exports = router;