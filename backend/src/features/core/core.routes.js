const express = require("express");
const router = require("express").Router();
const dashboardController = require("./dashboard.controller");
const settingsController = require("./settings.controller");
const attendanceController = require("./attendance.controller");
const { protect } = require("../../shared/middleware/auth.middleware");

// Dashboard routes
router.get("/dashboard", protect, dashboardController.getDashboardStats);

// Settings routes
router.get("/settings", protect, settingsController.getSettings);
router.put("/settings", protect, settingsController.updateSettings);

// Attendance routes
router.get("/attendance", protect, attendanceController.getAttendance);
router.get(
  "/attendance/student/:studentId",
  protect,
  attendanceController.getStudentAttendance
);
router.post(
  "/attendance/bulk",
  protect,
  attendanceController.bulkSaveAttendance
);

module.exports = router;
