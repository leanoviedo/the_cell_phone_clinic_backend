require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB Atlas conectado correctamente");

    app.listen(PORT, () => {
      console.log(`✅ Server local en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error.message);
  }
})();
