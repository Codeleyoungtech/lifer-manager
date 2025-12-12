const express = require("express");
const router = express.Router();
const {
  getResults,
  saveResult,
  batchSaveResults,
  calculatePositions,
} = require("./result.controller");
const {
  getResultMetadata,
  saveResultMetadata,
} = require("./result-metadata.controller");
const { protect } = require("../../shared/middleware/auth.middleware");

router.route("/").get(protect, getResults).post(protect, saveResult);

router.post("/batch", protect, batchSaveResults);
router.post("/calculate-positions", protect, calculatePositions);

// Metadata routes (conventional performance + comments)
router.get("/metadata/:studentId", protect, getResultMetadata);
router.put("/metadata/:studentId", protect, saveResultMetadata);

module.exports = router;
