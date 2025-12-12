const mongoose = require("mongoose");

const resultSchema = mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    term: {
      type: String,
      enum: ["firstTerm", "secondTerm", "thirdTerm"],
      required: true,
    },
    subjectCode: {
      type: String,
      ref: "Subject",
      required: true,
    },
    weeklyTest: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    midTerm: {
      type: Number,
      default: 0,
      min: 0,
      max: 20,
    },
    exam: {
      type: Number,
      default: 0,
      min: 0,
      max: 70,
    },
    total: {
      type: Number,
      default: 0,
    },
    grade: {
      type: String,
      default: "F",
    },
    remarks: {
      type: String,
      default: "Fail",
    },
    position: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique result per student per subject per term
resultSchema.index(
  { studentId: 1, academicYear: 1, term: 1, subjectCode: 1 },
  { unique: true }
);

module.exports = mongoose.model("Result", resultSchema);
