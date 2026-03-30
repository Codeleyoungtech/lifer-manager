const express = require("express");
const router = require("express").Router();
const dashboardController = require("./dashboard.controller");
const settingsController = require("./settings.controller");
const attendanceController = require("./attendance.controller");
const exportController = require("./export.controller");
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

// Export routes
router.get(
  "/export/students",
  protect,
  authorize("admin", "principal"),
  exportController.exportStudents
);
router.get(
  "/export/attendance",
  protect,
  authorize("admin", "principal"),
  exportController.exportAttendance
);
router.get(
  "/export/results",
  protect,
  authorize("admin", "principal"),
  exportController.exportResults
);
router.get(
  "/export/comments",
  protect,
  authorize("admin", "principal"),
  exportController.exportComments
);

module.exports = router;
