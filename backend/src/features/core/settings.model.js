const mongoose = require("mongoose");

const settingsSchema = mongoose.Schema(
  {
    currentAcademicYear: {
      type: String,
      default: "2024-2025",
    },
    currentTerm: {
      type: String,
      enum: ["firstTerm", "secondTerm", "thirdTerm"],
      default: "firstTerm",
    },
    schoolName: {
      type: String,
      default: "Lifer's Academy",
    },
    classes: {
      type: [String],
      default: [
        "Nursery1",
        "KG1",
        "KG2",
        "Nursery2",
        "Primary1",
        "Primary2",
        "Primary3",
        "Primary4",
        "Primary5",
        "Primary6",
        "JSS1",
        "JSS2",
        "JSS3",
        "SS1",
        "SS2",
        "SS3",
      ],
    },
    departments: {
      type: [String],
      default: ["GENERAL", "SCIENCE", "ARTS", "COMMERCIAL"],
    },
    dateOfVacation: {
      type: String,
      default: "",
    },
    dateOfResumption: {
      type: String,
      default: "",
    },
<<<<<<< HEAD
    maxAttendance: {
      type: Number,
      default: 0,
    },
    subjectOrders: {
      prenursery: { type: [String], default: [] },
      primary: { type: [String], default: [] },
      jss: { type: [String], default: [] },
      ss: { type: [String], default: [] },
    },
=======
>>>>>>> 60453a0d9805bd7b2738c2206efa3acb379fe04f
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Settings", settingsSchema);
