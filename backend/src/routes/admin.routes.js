const express = require("express");
const { protect } = require("../middlewares/auth.middleware.js");
const {
  getStats,
  getRecentScans,
  getCandidates,
} = require("../controllers/admin.controller.js");
const { allowRoles } = require("../middlewares/role.middleware.js");

const router = express.Router();

router.get("/stats", protect, allowRoles("ADMIN"), getStats);
router.get("/live-scans", protect, allowRoles("ADMIN"), getRecentScans);
router.get("/candidates", protect, allowRoles("ADMIN"), getCandidates);

module.exports = router;
