const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    classLevel: {
      type: String,
      required: true,
    },
    term: {
      type: String,
      enum: ["firstTerm", "secondTerm", "thirdTerm"],
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    timePresent: {
      type: Number,
      default: 0,
      min: 0,
    },
    timeAbsent: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxAttendance: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one attendance record per student per term per year
attendanceSchema.index(
  { studentId: 1, term: 1, academicYear: 1 },
  { unique: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
