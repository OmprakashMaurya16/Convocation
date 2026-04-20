const express = require("express");
const { protect } = require("../middlewares/auth.middleware.js");
const { getStats } = require("../controllers/admin.controller.js");
const { allowRoles } = require("../middlewares/role.middleware.js");

const router = express.Router();

router.get("/stats", protect, allowRoles("ADMIN"), getStats);

module.exports = router;
