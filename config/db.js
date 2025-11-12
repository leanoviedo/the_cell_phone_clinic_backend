const mongoose = require("mongoose");

const connectDB = async () => {
  console.log("🔄 Intentando conectar con MongoDB Atlas...");
  console.log("🌍 MONGODB_URI detectada:", !!process.env.MONGODB_URI);

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // evita que quede colgado más de 10s
    });
    console.log(`✅ MongoDB conectado a: ${conn.connection.host}`);
    console.log(`📦 Base de datos: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error("❌ Error al conectar con MongoDB Atlas:", error.message);
    throw error; // nunca usar process.exit en Vercel
  }
};

module.exports = connectDB;
