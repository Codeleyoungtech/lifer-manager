const express = require("express");
const router = require("express").Router();
const dashboardController = require("./dashboard.controller");
const settingsController = require("./settings.controller");
const attendanceController = require("./attendance.controller");
const { protect, authorize } = require("../../shared/middleware/auth.middleware");

// Dashboard routes
router.get(
  "/dashboard",
  protect,
  authorize("admin", "principal"),
  dashboardController.getDashboardStats
);

// Settings routes
router.get(
  "/settings",
  protect,
  authorize("admin", "principal", "teacher"),
  settingsController.getSettings
);
router.put(
  "/settings",
  protect,
  authorize("admin", "principal"),
  settingsController.updateSettings
);

// Attendance routes
router.get(
  "/attendance",
  protect,
  authorize("admin", "principal", "teacher"),
  attendanceController.getAttendance
);
router.get(
  "/attendance/student/:studentId",
  protect,
  authorize("admin", "principal", "teacher"),
  attendanceController.getStudentAttendance
);
router.post(
  "/attendance/bulk",
  protect,
  authorize("admin", "principal", "teacher"),
  attendanceController.bulkSaveAttendance
);

module.exports = router;
