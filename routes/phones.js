const express = require("express");
const router = express.Router();
const {
  getPhones,
  createPhones,
  updatePhone,
  deletePhone,
} = require("../controllers/controllerPhones");

router.get("/", getPhones);
router.post("/", createPhones);
router.put("/:id", updatePhone);
router.delete("/:id", deletePhone);

module.exports = router;
