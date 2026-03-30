const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const mongoose = require("mongoose");
const User = require("../features/auth/user.model");
const connectDB = require("../shared/database");

const seedUser = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminFirstName = process.env.ADMIN_FIRST_NAME || "Admin";
    const adminLastName = process.env.ADMIN_LAST_NAME || "User";

    if (!adminEmail || !adminPassword) {
      console.error("Please set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env");
      process.exit(1);
    }

    await connectDB();

    const userExists = await User.findOne({ email: adminEmail });

    if (userExists) {
      console.log("Admin user already exists");
      process.exit();
    }

    await User.create({
      firstName: adminFirstName,
      lastName: adminLastName,
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    });

    console.log("Admin user created successfully");
    console.log(`Email: ${adminEmail}`);
    console.log("Password: [provided from ADMIN_PASSWORD]");
    process.exit();
  } catch (error) {
    console.error("Error seeding user:", error);
    process.exit(1);
  }
};

seedUser();
