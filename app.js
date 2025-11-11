const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

const phoneRoutes = require("./routes/phones");
const accessoryRoutes = require("./routes/accesories");

const app = express();

console.log("1️⃣ Iniciando app.js...");

app.use(express.json());
app.use(cors());
console.log("2️⃣ Middlewares cargados.");

// Rutas
try {
  app.use("/api/phones", phoneRoutes);
  app.use("/api/accessories", accessoryRoutes);
  console.log("3️⃣ Rutas cargadas correctamente.");
} catch (err) {
  console.error("⚠️ Error al cargar rutas:", err.message);
}

app.get("/", (_req, res) => {
  console.log("4️⃣ GET / solicitado");
  res.send("🚀 API funcionando");
});

const PORT = process.env.PORT || 3000;

console.log("5️⃣ Leyendo URI...");
console.log("🧩 MONGODB_URI:", process.env.MONGODB_URI);

connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`✅ Server en http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("❌ Error general:", err));
