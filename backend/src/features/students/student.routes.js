const express = require("express");
const router = express.Router();
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
} = require("./student.controller");
const { protect, authorize } = require("../../shared/middleware/auth.middleware");

router
  .route("/")
  .get(protect, authorize("admin", "principal", "teacher"), getStudents)
  .post(protect, authorize("admin", "principal"), createStudent);

router
  .route("/:id")
  .get(protect, authorize("admin", "principal", "teacher"), getStudent)
  .put(protect, authorize("admin", "principal"), updateStudent)
  .delete(protect, authorize("admin"), deleteStudent);

module.exports = router;
