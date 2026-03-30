const express = require("express");
const router = express.Router();
const {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
} = require("./subject.controller");
const { protect, authorize } = require("../../shared/middleware/auth.middleware");

router
  .route("/")
  .get(protect, authorize("admin", "principal", "teacher"), getSubjects)
  .post(protect, authorize("admin", "principal"), createSubject);

router
  .route("/:code")
  .get(protect, authorize("admin", "principal", "teacher"), getSubject)
  .put(protect, authorize("admin", "principal"), updateSubject)
  .delete(protect, authorize("admin"), deleteSubject);

module.exports = router;
