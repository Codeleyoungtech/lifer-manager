const mongoose = require("mongoose");

const resultMetadataSchema = mongoose.Schema(
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
    // Conventional Performance for Pre-Nursery (Nursery1, KG1, KG2)
    conventionalPerformance: {
      fair: {
        letterRecognition: { type: String, default: "" },
        countingNumbers: { type: String, default: "" },
        speakingFluency: { type: String, default: "" },
      },
      good: {
        letterRecognition: { type: String, default: "" },
        countingNumbers: { type: String, default: "" },
        speakingFluency: { type: String, default: "" },
      },
      veryGood: {
        letterRecognition: { type: String, default: "" },
        countingNumbers: { type: String, default: "" },
        speakingFluency: { type: String, default: "" },
      },
      excellent: {
        letterRecognition: { type: String, default: "" },
        countingNumbers: { type: String, default: "" },
        speakingFluency: { type: String, default: "" },
      },
    },
    // Comments
    classTeacherComment: {
      type: String,
      default: "Keep up the good work!",
    },
    principalComment: {
      type: String,
      default: "Excellent performance.",
    },
    // Intuitive Feats (Secondary)
    intuitiveFeats: {
      punctuality: { type: String, default: "" },
      attentive: { type: String, default: "" },
      neatness: { type: String, default: "" },
      helping: { type: String, default: "" },
      speaking: { type: String, default: "" },
      politeness: { type: String, default: "" },
      perseverance: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one metadata per student per term
resultMetadataSchema.index(
  { studentId: 1, academicYear: 1, term: 1 },
  { unique: true }
);

module.exports = mongoose.model("ResultMetadata", resultMetadataSchema);
