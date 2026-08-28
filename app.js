const express = require("express");
const cors = require("cors");

const phoneRoutes = require("./routes/phones");
const accessoryRoutes = require("./routes/accessories");
const orderRoutes = require("./routes/orders");
const serviceRoutes = require("./routes/services");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/phones", phoneRoutes);
app.use("/api/accessories", accessoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/services", serviceRoutes);

app.get("/test", (_req, res) => {
  res.json({
    message: "Vercel está ejecutando app.js",
  });
});

app.get("/", (_req, res) => {
  res.send("🚀 API funcionando correctamente");
});

module.exports = app;