require("dotenv").config();
const app = require("../app");
const connectDB = require("../config/db");

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
    console.log("✅ MongoDB conectado (Vercel)");
  }

  return app(req, res);
};
