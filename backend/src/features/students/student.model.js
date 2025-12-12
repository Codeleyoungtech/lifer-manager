const mongoose = require("mongoose");

const studentSchema = mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: [true, "Please add a first name"],
    },
    otherNames: {
      type: String,
      required: [true, "Please add other names"],
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Please add date of birth"],
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Please select gender"],
    },
    religion: {
      type: String,
      enum: ["ISLAM", "CHRISTIANITY"],
      required: [true, "Please select religion"],
    },
    currentClass: {
      type: String,
      required: [true, "Please select a class"],
    },
    department: {
      type: String,
      enum: ["GENERAL", "SCIENCE", "ARTS", "COMMERCIAL"],
      default: "GENERAL",
    },
    contactEmail: String,
    contactPhone: String,
    guardianName: {
      type: String,
      required: [true, "Please add guardian name"],
    },
    address: String,
    status: {
      type: String,
      enum: ["active", "graduated", "withdrawn"],
      default: "active",
    },
    currentAcademicYear: String,
    dateRegistered: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Student", studentSchema);
