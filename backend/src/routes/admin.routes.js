const express = require("express");
const { protect } = require("../middlewares/auth.middleware.js");
const {
  getStats,
  getRecentScans,
  getCandidates,
  getDepartmentStats,
  resetSeatAllocations,
  resetEventProgress,
  getSeatOccupancy,
  getSeatOverrides,
  setSeatOverride,
  getSeatingReport,
  getDepartmentConfigs,
  setDepartmentConfig,
  getAllSeats,
} = require("../controllers/admin.controller.js");
const { allowRoles } = require("../middlewares/role.middleware.js");

const router = express.Router();

router.get("/stats", protect, allowRoles("ADMIN"), getStats);
router.get("/live-scans", protect, allowRoles("ADMIN"), getRecentScans);
router.get("/candidates", protect, allowRoles("ADMIN"), getCandidates);
router.get(
  "/department-stats",
  protect,
  allowRoles("ADMIN"),
  getDepartmentStats,
);

router.post("/reset-seats", protect, allowRoles("ADMIN"), resetSeatAllocations);

router.post("/reset-event", protect, allowRoles("ADMIN"), resetEventProgress);

router.get("/seat-occupancy", protect, allowRoles("ADMIN"), getSeatOccupancy);

router.get("/seat-overrides", protect, allowRoles("ADMIN"), getSeatOverrides);
router.post("/seat-overrides", protect, allowRoles("ADMIN"), setSeatOverride);

router.get("/seating-report", protect, allowRoles("ADMIN"), getSeatingReport);

router.get("/department-configs", protect, allowRoles("ADMIN"), getDepartmentConfigs);
router.post("/department-configs", protect, allowRoles("ADMIN"), setDepartmentConfig);
router.get("/all-seats", protect, allowRoles("ADMIN"), getAllSeats);

module.exports = router;
