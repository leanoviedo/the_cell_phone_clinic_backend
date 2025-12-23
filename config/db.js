const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

const connectDB = async () => {
  // Si ya hay conexión, reutilizarla
  if (cached.conn) {
    return cached.conn;
  }

  // Logs útiles para Vercel / producción
  console.log("🔄 Intentando conectar con MongoDB Atlas...");
  console.log("🌍 MONGODB_URI detectada:", !!process.env.MONGODB_URI);

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000, // evita cuelgues
      })
      .then((mongoose) => {
        console.log("✅ MongoDB conectado");
        console.log(`📦 DB: ${mongoose.connection.name}`);
        console.log(`🌐 Host: ${mongoose.connection.host}`);
        return mongoose;
      })
      .catch((error) => {
        console.error("❌ Error al conectar con MongoDB:", error.message);
        cached.promise = null; // permite reintento
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    throw error; // nunca process.exit en Vercel
  }
};

module.exports = connectDB;
