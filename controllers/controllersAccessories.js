const mongoose = require("mongoose");
const Accessory = require("../models/modelAccesories");

// ✅ GET - obtener todos los accesorios
const getAccessories = async (req, res) => {
  try {
    const accessories = await Accessory.find();
    res.status(200).json(accessories);
  } catch (error) {
    console.error("❌ Error al obtener accesorios:", error);
    res.status(500).json({ error: "Error al obtener los accesorios" });
  }
};

// ✅ POST - crear uno o varios accesorios
const createAccessory = async (req, res) => {
  try {
    const data = req.body;

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.status(400).json({ error: "No se enviaron datos" });
    }

    let result;

    if (Array.isArray(data)) {
      console.log("🧩 Insertando múltiples accesorios...");
      result = await Accessory.insertMany(data);
    } else {
      console.log("🎧 Insertando un solo accesorio...");
      const nuevo = new Accessory(data);
      result = await nuevo.save();
    }

    console.log("✅ Inserción correcta:", result);
    res.status(201).json(result);
  } catch (error) {
    console.error("❌ Error al crear accesorios:", error);
    res.status(500).json({ error: "Error al crear accesorios" });
  }
};

// ✅ PUT - actualizar accesorio (por _id o por id personalizado)
const updateAccessory = async (req, res) => {
  try {
    const { id } = req.params;
    let actualizado;

    if (mongoose.Types.ObjectId.isValid(id)) {
      // Buscar por _id
      actualizado = await Accessory.findByIdAndUpdate(id, req.body, {
        new: true,
      });
    } else {
      // Buscar por el campo "id" personalizado
      actualizado = await Accessory.findOneAndUpdate({ id }, req.body, {
        new: true,
      });
    }

    if (!actualizado) {
      return res.status(404).json({ error: "Accesorio no encontrado" });
    }

    res.status(200).json(actualizado);
  } catch (error) {
    console.error("❌ Error al actualizar accesorio:", error);
    res.status(500).json({ error: "Error al actualizar accesorio" });
  }
};

// ✅ DELETE - eliminar accesorio (por _id o por id personalizado)
const deleteAccessory = async (req, res) => {
  try {
    const { id } = req.params;
    let eliminado;

    if (mongoose.Types.ObjectId.isValid(id)) {
      // Buscar por _id (ObjectId de Mongo)
      eliminado = await Accessory.findByIdAndDelete(id);
    } else {
      // Buscar por el campo "id" personalizado
      eliminado = await Accessory.findOneAndDelete({ id });
    }

    if (!eliminado) {
      return res.status(404).json({ error: "Accesorio no encontrado" });
    }

    console.log("🗑️ Accesorio eliminado:", eliminado.title || eliminado.id);
    res
      .status(200)
      .json({ msg: "Accesorio eliminado correctamente", eliminado });
  } catch (error) {
    console.error("❌ Error al eliminar accesorio:", error);
    res.status(500).json({ error: "Error al eliminar accesorio" });
  }
};

module.exports = {
  getAccessories,
  createAccessory,
  updateAccessory,
  deleteAccessory,
};
