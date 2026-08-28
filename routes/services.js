const express = require("express");
const {
  getServices,
  getServiceById,
  createServices,
  updateService,
  deleteService,
} = require("../controllers/serviceController");

const router = express.Router();

router.get("/", getServices);
router.get("/:id", getServiceById);

router.post("/", createServices);
router.put("/:id", updateService);
router.delete("/:id", deleteService);

module.exports = router;
