const express = require("express");
const {
  getStudentByQR,
  updateStudentProfile,
  eventLogin,
} = require("../controllers/student.controller.js");

const router = express.Router();

router.get("/:qrToken", getStudentByQR);
router.patch("/:qrToken/profile", updateStudentProfile);
router.post("/:qrToken/event-login", eventLogin);

module.exports = router;
