const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const mongoose = require("mongoose");
const User = require("../features/auth/user.model");
const connectDB = require("../shared/database");

const seedUser = async () => {
  try {
    await connectDB();

    const userExists = await User.findOne({ email: "admin@lifer.com" });

    if (userExists) {
      console.log("Admin user already exists");
      process.exit();
    }

    await User.create({
      firstName: "Admin",
      lastName: "User",
      email: "admin@lifer.com",
      password: "password123",
      role: "admin",
    });

    console.log("Admin user created successfully");
    console.log("Email: admin@lifer.com");
    console.log("Password: password123");
    process.exit();
  } catch (error) {
    console.error("Error seeding user:", error);
    process.exit(1);
  }
};

seedUser();
