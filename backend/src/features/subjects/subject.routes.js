const express = require("express");
const router = express.Router();
const {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
} = require("./subject.controller");
const { protect } = require("../../shared/middleware/auth.middleware");

router.route("/").get(protect, getSubjects).post(protect, createSubject);

router
  .route("/:code")
  .get(protect, getSubject)
  .put(protect, updateSubject)
  .delete(protect, deleteSubject);

module.exports = router;
