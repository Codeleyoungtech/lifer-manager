const Attendance = require("./attendance.model");
const Settings = require("./settings.model");

// @desc    Get attendance for a class/term/year
// @route   GET /api/core/attendance?classLevel=X&term=Y&year=Z
// @access  Private
const getAttendance = async (req, res, next) => {
  try {
    const { classLevel, term, year } = req.query;

    // Get current year from settings if not provided
    let academicYear = year;
    if (!academicYear) {
      const settings = await Settings.findOne();
      academicYear = settings?.currentAcademicYear;
    }

    if (!classLevel || !term) {
      return res.status(400).json({
        message: "Class level and term are required",
      });
    }

    const attendanceRecords = await Attendance.find({
      classLevel,
      term,
      academicYear,
    }).populate("studentId", "firstName otherNames studentId");

    res.status(200).json(attendanceRecords);
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance for a specific student
// @route   GET /api/core/attendance/student/:studentId?term=X&year=Y
// @access  Private
const getStudentAttendance = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { term, year } = req.query;

    // Get current settings if not provided
    let academicYear = year;
    let termValue = term;

    if (!academicYear || !termValue) {
      const settings = await Settings.findOne();
      if (!academicYear) academicYear = settings?.currentAcademicYear;
      if (!termValue) termValue = settings?.currentTerm;
    }

    const attendance = await Attendance.findOne({
      studentId,
      term: termValue,
      academicYear,
    });

    res.status(200).json(attendance || {});
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk save/update attendance
// @route   POST /api/core/attendance/bulk
// @access  Private
const bulkSaveAttendance = async (req, res, next) => {
  try {
    const { attendanceRecords, classLevel, term, year, maxAttendance } =
      req.body;

    if (!attendanceRecords || !Array.isArray(attendanceRecords)) {
      return res.status(400).json({
        message: "Attendance records array is required",
      });
    }

    // Get current year from settings if not provided
    let academicYear = year;
    if (!academicYear) {
      const settings = await Settings.findOne();
      academicYear = settings?.currentAcademicYear;
    }

    const bulkOps = attendanceRecords.map((record) => ({
      updateOne: {
        filter: {
          studentId: record.studentId,
          term,
          academicYear,
        },
        update: {
          $set: {
            classLevel,
            timePresent: record.timePresent || 0,
            timeAbsent: record.timeAbsent || 0,
            maxAttendance: maxAttendance || 0,
          },
        },
        upsert: true,
      },
    }));

    const result = await Attendance.bulkWrite(bulkOps);

    res.status(200).json({
      message: "Attendance records saved successfully",
      result: {
        modified: result.modifiedCount,
        inserted: result.upsertedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendance,
  getStudentAttendance,
  bulkSaveAttendance,
};
