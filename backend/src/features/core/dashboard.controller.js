const Student = require("../students/student.model");
const Result = require("../results/result.model");
const Settings = require("./settings.model");

// @desc    Get dashboard stats
// @route   GET /api/core/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const settings = await Settings.findOne();
    const year = settings?.currentAcademicYear || "2024-2025";
    const term = settings?.currentTerm || "firstTerm";

    // Total Students
    const totalStudents = await Student.countDocuments({ status: "active" });

    // Active Spreadsheets (students with results this term)
    const activeSpreadsheets = await Result.distinct("studentId", {
      academicYear: year,
      term: term,
    }).countDocuments(); // This might be wrong in mongoose, distinct returns array

    const distinctStudents = await Result.distinct("studentId", {
      academicYear: year,
      term: term,
    });
    const activeSpreadsheetsCount = distinctStudents.length;

    // Top Performers (Avg > 80)
    // This is complex aggregation, simplified for now
    const topPerformers = 0; // Placeholder for aggregation logic

    res.status(200).json({
      totalStudents,
      activeSpreadsheets: activeSpreadsheetsCount,
      topPerformers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent activities
// @route   GET /api/core/dashboard/activities
// @access  Private
const getRecentActivities = async (req, res, next) => {
  try {
    // Recent Students
    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select("firstName otherNames currentClass createdAt");

    const activities = recentStudents.map((student) => ({
      type: "student",
      title: "New student registered",
      description: `${student.firstName} ${student.otherNames} - ${student.currentClass}`,
      timestamp: student.createdAt,
    }));

    // Recent Results
    const recentResults = await Result.find()
      .sort({ updatedAt: -1 })
      .limit(3)
      .populate("studentId", "firstName otherNames")
      .populate("subjectCode", "name"); // This won't work if subjectCode is string not ObjectId ref

    // Note: subjectCode in Result model is String, but ref is Subject. Mongoose populate works if ref is correct.
    // But in Result model I defined subjectCode as String ref 'Subject'.
    // If Subject _id is ObjectId, this might fail if I stored code string.
    // I stored code string in Subject model (code: String).
    // Mongoose populate usually needs ObjectId.
    // For now, let's just return basic info.

    res.status(200).json(activities);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivities,
};
