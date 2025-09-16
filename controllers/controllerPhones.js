const Phone = require("../models/modelPhones"); // Solo una importación

// GET todos los teléfonos
const getPhones = async (req, res) => {
  try {
    const phones = await Phone.find();
    res.json(phones);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los teléfonos" });
  }
};

// POST nuevo teléfono
const createPhones = async (req, res) => {
  try {
    const data = req.body;

    if (Array.isArray(data)) {
      // Si es un array, inserta todos
      const phones = await Phone.insertMany(data);
      res.status(201).json(phones);
    } else {
      // Si es un solo objeto, guarda uno
      const nuevo = new Phone(data);
      await nuevo.save();
      res.status(201).json(nuevo);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear teléfono" });
  }
};

// PUT actualizar teléfono
const updatePhone = async (req, res) => {
  try {
    const actualizado = await Phone.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar teléfono" });
  }
};

// DELETE eliminar teléfono
const deletePhone = async (req, res) => {
  try {
    await Phone.findByIdAndDelete(req.params.id);
    res.json({ msg: "Teléfono eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar teléfono" });
  }
};

module.exports = { getPhones, createPhones, updatePhone, deletePhone };
