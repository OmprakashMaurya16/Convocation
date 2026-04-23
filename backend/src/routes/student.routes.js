const express = require("express");
const { getStudentByQR, updateStudentProfile } = require("../controllers/student.controller.js");

const router = express.Router();

router.get("/:qrToken", getStudentByQR);
router.patch("/:qrToken/profile", updateStudentProfile);

module.exports = router;
