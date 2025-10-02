const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

const phoneRoutes = require("./routes/phones");
const accessoryRoutes = require("./routes/accesories");


const app = express();
  console.log(1)
app.use(express.json());
app.use(cors());
  console.log("2");

// Rutas
app.use("/api/phones", phoneRoutes);
app.use("/api/accessories", accessoryRoutes);
  console.log(".3");
app.get("/", (_req, res) => {
  console.log("4");
  res.send("🚀 API funcionando");
});

const PORT = process.env.PORT || 3000;
console.log(6)
connectDB().then(() => {
  app.listen(PORT, () => console.log(`✅ Server en http://localhost:${PORT}`));
});
