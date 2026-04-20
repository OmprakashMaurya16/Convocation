const express = require("express");
const { getStudentByQR } = require("../controllers/student.controller.js");

const router = express.Router();

router.get("/:qrToken", getStudentByQR);

module.exports = router;
