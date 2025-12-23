const express = require("express");
const cors = require("cors");

const phoneRoutes = require("./routes/phones");
const accessoryRoutes = require("./routes/accesories");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/phones", phoneRoutes);
app.use("/api/accessories", accessoryRoutes);

app.get("/", (_req, res) => {
  res.send("🚀 API funcionando correctamente");
});

module.exports = app;
