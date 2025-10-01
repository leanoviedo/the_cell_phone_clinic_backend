const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
require("dotenv").config();

const phoneRoutes = require("./routes/phones");
const accessoryRoutes = require("./routes/accesories");
const { searchPhones } = require("./controllers/controllerSearch");

const app = express();
app.use(express.json());
app.use(cors());

// Rutas
app.use("/api/phones", phoneRoutes);
app.use("/api/accessories", accessoryRoutes);
app.use("/api/search", searchPhones);

app.get("/", (_req, res) => {
  res.send("🚀 API funcionando");
});

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`✅ Server en http://localhost:${PORT}`));
});
