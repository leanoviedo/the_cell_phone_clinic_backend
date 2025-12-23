const mongoose = require("mongoose");
const Accessory = require("../models/modelAccessories");

/** busqueda con filtros
 * GET /api/accessories
 * - Todos
 * - Filtro por title y category
 * Ej:
 * /api/accessories?title=cable
 * /api/accessories?category=cargador
 */
const getAccessories = async (req, res) => {
  try {
    const { title, category } = req.query;
    const filter = {};

    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }

    const accessories = await Accessory.find(filter);
    res.status(200).json(accessories);
  } catch (error) {
    console.error("❌ Error al obtener accesorios:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * busqueda por id - Por _id de Mongo o id personalizado
 * GET /api/accessories/:id
 */
const getAccessoryById = async (req, res) => {
  try {
    const { id } = req.params;
    let accessory;

    if (mongoose.Types.ObjectId.isValid(id)) {
      accessory = await Accessory.findById(id);
    } else {
      accessory = await Accessory.findOne({ id });
    }

    if (!accessory) {
      return res.status(404).json({ error: "Accesorio no encontrado" });
    }

    res.status(200).json(accessory);
  } catch (error) {
    res.status(400).json({ error: "ID inválido" });
  }
};

/**
 * - Crear uno o varios accesorios
 * POST /api/accessories
 */
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
      console.log("🎧 Insertando un accesorio...");
      const nuevo = new Accessory(data);
      result = await nuevo.save();
    }

    res.status(201).json(result);
  } catch (error) {
    console.error("❌ Error al crear accesorios:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Actualizar por _id o id personalizado
 * PUT /api/accessories/:id
 */
const updateAccessory = async (req, res) => {
  try {
    const { id } = req.params;
    let updated;

    if (mongoose.Types.ObjectId.isValid(id)) {
      updated = await Accessory.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
    } else {
      updated = await Accessory.findOneAndUpdate({ id }, req.body, {
        new: true,
        runValidators: true,
      });
    }

    if (!updated) {
      return res.status(404).json({ error: "Accesorio no encontrado" });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("❌ Error al actualizar accesorio:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 *- Eliminar por _id o id personalizado
 * DELETE /api/accessories/:id
 */
const deleteAccessory = async (req, res) => {
  try {
    const { id } = req.params;
    let deleted;

    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Accessory.findByIdAndDelete(id);
    } else {
      deleted = await Accessory.findOneAndDelete({ id });
    }

    if (!deleted) {
      return res.status(404).json({ error: "Accesorio no encontrado" });
    }

    res.status(200).json({
      message: "Accesorio eliminado correctamente",
      deleted,
    });
  } catch (error) {
    console.error("❌ Error al eliminar accesorio:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAccessories,
  getAccessoryById,
  createAccessory,
  updateAccessory,
  deleteAccessory,
};
