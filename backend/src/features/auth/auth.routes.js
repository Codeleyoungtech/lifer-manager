const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  listUsers,
  updateUserAccess,
} = require("./auth.controller");
const { protect, authorize } = require("../../shared/middleware/auth.middleware");

router.post("/register", protect, authorize("admin"), registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.get("/users", protect, authorize("admin"), listUsers);
router.patch("/users/:id/access", protect, authorize("admin"), updateUserAccess);

module.exports = router;
