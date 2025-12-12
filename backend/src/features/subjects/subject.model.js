const mongoose = require("mongoose");

const subjectSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Please add a subject code"],
      unique: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, "Please add a subject name"],
    },
    department: {
      type: String,
      enum: ["GENERAL", "SCIENCE", "ARTS", "COMMERCIAL"],
      required: [true, "Please select a department"],
    },
    classes: {
      type: [String],
      required: [true, "Please select at least one class"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Subject", subjectSchema);
