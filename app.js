const express = require("express");
const cors = require("cors");

const phoneRoutes = require("./routes/phones");
const accessoryRoutes = require("./routes/accessories");
const orderRoutes = require("./routes/orders");
const sendEmailRoutes = require("./routes/sendEmail");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/phones", phoneRoutes);
app.use("/api/accessories", accessoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/send-email", sendEmailRoutes);

app.get("/", (_req, res) => {
  res.send("🚀 API funcionando correctamente");
});

module.exports = app;
