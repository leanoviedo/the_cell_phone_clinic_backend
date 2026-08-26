const express = require("express");
const Service = require("../models/modelService.js");
const connectDB = require("../config/db.js");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    // Asegurar conexión con MongoDB Atlas
    await connectDB();

    console.log("=================================");
    console.log("📦 BASE:", Service.db.name);
    console.log("📁 COLECCIÓN:", Service.collection.name);

    const services = await Service.find().lean();

    console.log("📊 CANTIDAD DE SERVICIOS:", services.length);
    console.log("📋 SERVICIOS:", services);

    res.json(services);
  } catch (error) {
    console.error("❌ Error al obtener servicios:", error);

    res.status(500).json({
      message: "Error al obtener los servicios",
      error: error.message,
    });
  }
});

module.exports = router;