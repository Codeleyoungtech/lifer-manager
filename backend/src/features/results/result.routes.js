const express = require("express");
const router = express.Router();
const {
  getResults,
  saveResult,
  batchSaveResults,
  calculatePositions,
} = require("./result.controller");
<<<<<<< HEAD
const {
  getResultMetadata,
  saveResultMetadata,
} = require("./result-metadata.controller");
=======
>>>>>>> 60453a0d9805bd7b2738c2206efa3acb379fe04f
const { protect } = require("../../shared/middleware/auth.middleware");

router.route("/").get(protect, getResults).post(protect, saveResult);

router.post("/batch", protect, batchSaveResults);
router.post("/calculate-positions", protect, calculatePositions);

<<<<<<< HEAD
// Metadata routes (conventional performance + comments)
router.get("/metadata/:studentId", protect, getResultMetadata);
router.put("/metadata/:studentId", protect, saveResultMetadata);

=======
>>>>>>> 60453a0d9805bd7b2738c2206efa3acb379fe04f
module.exports = router;
