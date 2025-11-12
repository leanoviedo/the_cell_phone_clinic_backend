const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

const phoneRoutes = require("./routes/phones");
const accessoryRoutes = require("./routes/accesories");

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Conexión a la base de datos
connectDB()
  .then(() => console.log("✅ MongoDB Atlas conectado correctamente"))
  .catch((err) => console.error("❌ Error al conectar MongoDB:", err.message));

// Rutas
app.use("/api/phones", phoneRoutes);
app.use("/api/accessories", accessoryRoutes);

app.get("/", (_req, res) => {
  res.send("🚀 API funcionando correctamente en Vercel");
});

// Solo iniciar el servidor local si no está en producción
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () =>
    console.log(`✅ Server local en http://localhost:${PORT}`)
  );
}

// Exportar la app para Vercel
module.exports = app;
