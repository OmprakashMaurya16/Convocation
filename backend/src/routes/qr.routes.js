const express = require("express");
const { generateQRCode } = require("../controllers/qr.controller.js");

const router = express.Router();

router.get("/generate/:qrToken", generateQRCode);

module.exports = router;
