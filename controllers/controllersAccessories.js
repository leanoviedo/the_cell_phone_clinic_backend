const Accessory = require("../models/modelAccesories");

// GET todos los accesorios
const getAccessories = async (req, res) => {
  try {
    const accessories = await Accessory.find();
    res.json(accessories);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los accesorios" });
  }
};

// POST crear accesorio
const createAccessory = async (req, res) => {
  try {
    const data = req.body;

    if (Array.isArray(data)) {
      // Si es un array, inserta todos
      const nuevo = await Accessory.insertMany(data);
      res.status(201).json(nuevo);
    } else {
      // Si es un solo objeto, guarda uno
      const nuevo = new Accessory(data);
      await nuevo.save();
      res.status(201).json(nuevo);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear accesorios" });
  }
};
// PUT actualizar accesorio
const updateAccessory = async (req, res) => {
  try {
    const actualizado = await Accessory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar accesorio" });
  }
};

// DELETE eliminar accesorio
const deleteAccessory = async (req, res) => {
  try {
    await Accessory.findByIdAndDelete(req.params.id);
    res.json({ msg: "Accesorio eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar accesorio" });
  }
};

module.exports = { getAccessories, createAccessory, updateAccessory, deleteAccessory };
