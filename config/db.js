const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("❌ Error al conectar con MongoDB Atlas:", error.message);
    throw error; // nunca usar process.exit en Vercel
  }
};

module.exports = connectDB;
