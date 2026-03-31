const jwt = require("jsonwebtoken");
const User = require("./user.model");

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Admin only
const registerUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, assignedClasses } = req.body;

    if (!firstName || !lastName || !email || !password) {
      res.status(400);
      throw new Error("Please add all fields");
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: "teacher",
      assignedClasses: Array.isArray(assignedClasses) ? assignedClasses : [],
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        assignedClasses: user.assignedClasses,
        isActive: user.isActive,
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select("+password");

    if (user && !user.isActive) {
      res.status(403);
      throw new Error("Account has been deactivated");
    }

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        assignedClasses: user.assignedClasses || [],
        isActive: user.isActive,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      assignedClasses: user.assignedClasses || [],
      isActive: user.isActive,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List users
// @route   GET /api/auth/users
// @access  Admin only
const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user access details
// @route   PATCH /api/auth/users/:id/access
// @access  Admin only
const updateUserAccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      password,
      isActive,
      assignedClasses,
      forceLogoutNow,
    } = req.body;

    const user = await User.findById(id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    if (user.role === "admin" && req.user.id !== user.id) {
      res.status(403);
      throw new Error("Cannot modify another admin account");
    }

    if (typeof firstName === "string" && firstName.trim()) {
      user.firstName = firstName.trim();
    }
    if (typeof lastName === "string" && lastName.trim()) {
      user.lastName = lastName.trim();
    }
    if (typeof email === "string" && email.trim()) {
      const normalizedEmail = email.trim().toLowerCase();
      const emailOwner = await User.findOne({ email: normalizedEmail });
      if (emailOwner && emailOwner.id !== user.id) {
        res.status(400);
        throw new Error("Email already in use");
      }
      user.email = normalizedEmail;
    }
    if (typeof password === "string" && password.trim()) {
      user.password = password.trim();
    }
    if (typeof isActive === "boolean") {
      user.isActive = isActive;
    }
    if (Array.isArray(assignedClasses)) {
      user.assignedClasses = assignedClasses;
    }
    if (forceLogoutNow === true) {
      user.forceLogoutAt = new Date();
    }

    await user.save();
    const updated = await User.findById(id).select("-password");

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Admin only
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    if (user.role === "admin") {
      res.status(403);
      throw new Error("Admin users cannot be deleted");
    }

    await user.deleteOne();
    res.status(200).json({ id, message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  listUsers,
  updateUserAccess,
  deleteUser,
};
