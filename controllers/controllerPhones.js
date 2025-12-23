const Phone = require("../models/Phone");

/**
 * busqueda con filtros
 *  Todos o Filtra por title y/o brand
 * GET /api/phones
 * Ej:
 * /api/phones?title=iphone
 * /api/phones?brand=samsung
 */
const getPhones = async (req, res) => {
  try {
    const { title, brand } = req.query;

    const filter = {};

    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    if (brand) {
      filter.brand = { $regex: brand, $options: "i" };
    }

    const phones = await Phone.find(filter);
    res.json(phones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * busqueda por id de Mongo o personalizado
 * GET /api/phones/:id
 */
const getPhoneById = async (req, res) => {
  try {
    const { id } = req.params;

    const phone = await Phone.findById(id);

    if (!phone) {
      return res.status(404).json({ error: "Teléfono no encontrado" });
    }

    res.json(phone);
  } catch (error) {
    res.status(400).json({ error: "ID inválido" });
  }
};

/**
 * crear uno o varios teléfonos
 * POST /api/phones
 */
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

    res.status(201).json(result);
  } catch (error) {
    console.error("❌ Error en createPhones:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * actualizar por ID de Mongo o id personalizado
 * PUT /api/phones/:id
 */
const updatePhone = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Phone.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "Teléfono no encontrado" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * eliminar por ID de Mongo o id personalizado
 * DELETE /api/phones/:id
 */
const deletePhone = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Phone.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Teléfono no encontrado" });
    }

    res.json({ mensaje: "Teléfono eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getPhones,
  getPhoneById,
  createPhones,
  updatePhone,
  deletePhone,
};
