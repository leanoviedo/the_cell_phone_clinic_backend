const Phone = require("../models/Phone");

// ✅ GET - obtener todos los teléfonos
const getPhones = async (req, res) => {
  try {
    const phones = await Phone.find();
    res.json(phones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ POST - crear uno o varios teléfonos
const createPhones = async (req, res) => {
  try {
    console.log("📥 Datos recibidos en POST /api/phones:", req.body);
    const data = req.body;

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.status(400).json({ error: "No se enviaron datos" });
    }

    let result;
    if (Array.isArray(data)) {
      console.log("🧩 Insertando múltiples teléfonos...");
      result = await Phone.insertMany(data);
    } else {
      console.log("📱 Insertando un solo teléfono...");
      const nuevo = new Phone(data);
      result = await nuevo.save();
    }

    console.log("✅ Inserción correcta:", result);
    res.status(201).json(result);
  } catch (error) {
    console.error("❌ Error en createPhones:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ PUT - actualizar teléfono
const updatePhone = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Phone.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated)
      return res.status(404).json({ error: "Teléfono no encontrado" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ DELETE - eliminar teléfono
const deletePhone = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Phone.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ error: "Teléfono no encontrado" });
    res.json({ mensaje: "Teléfono eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 👇 exportar correctamente
module.exports = {
  getPhones,
  createPhones,
  updatePhone,
  deletePhone,
};
