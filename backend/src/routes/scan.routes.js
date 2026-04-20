const express = require("express");
const { protect } = require("../middlewares/auth.middleware.js");
const { scanQR } = require("../controllers/scan.controller.js");
const { allowRoles } = require("../middlewares/role.middleware.js");

const router = express.Router();

router.post(
  "/",
  protect,
  allowRoles("ENTRY", "SEATING", "GOWN", "RETURN"),
  scanQR,
);

module.exports = router;
