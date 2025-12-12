const express = require("express");
const router = express.Router();
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
} = require("./student.controller");
const { protect } = require("../../shared/middleware/auth.middleware");

router.route("/").get(protect, getStudents).post(protect, createStudent);

router
  .route("/:id")
  .get(protect, getStudent)
  .put(protect, updateStudent)
  .delete(protect, deleteStudent);

module.exports = router;
