const ResultMetadata = require("./result-metadata.model");
const Student = require("../students/student.model");
const Settings = require("../core/settings.model");

const isTeacher = (req) => req.user?.role === "teacher";
const hasClassAccess = (req, classLevel) =>
  !isTeacher(req) || (req.user?.assignedClasses || []).includes(classLevel);

const isTermLocked = async (academicYear, term) => {
  const settings = await Settings.findOne().select("lockedTerms");
  const key = `${academicYear}:${term}`;
  return (settings?.lockedTerms || []).includes(key);
};

// @desc    Get result metadata (conventional performance + comments)
// @route   GET /api/results/metadata/:studentId?term=X&year=Y
// @access  Private
const getResultMetadata = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { term, year } = req.query;

    if (!term || !year) {
      return res.status(400).json({
        message: "Term and academic year are required",
      });
    }
    const student = await Student.findById(studentId).select("currentClass");
    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }
    if (!hasClassAccess(req, student.currentClass)) {
      return res.status(403).json({
        message: "Forbidden: class not assigned",
      });
    }

    const metadata = await ResultMetadata.findOne({
      studentId,
      term,
      academicYear: year,
    });

    const responseData = metadata || {};

    res.status(200).json(responseData);
  } catch (error) {
    next(error);
  }
};

// @desc    Save or update result metadata
// @route   PUT /api/results/metadata/:studentId
// @access  Private
const saveResultMetadata = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const {
      term,
      year,
      conventionalPerformance,
      classTeacherComment,
      principalComment,
      intuitiveFeats,
    } = req.body;

    if (!term || !year) {
      return res.status(400).json({
        message: "Term and academic year are required",
      });
    }
    const student = await Student.findById(studentId).select("currentClass");
    if (!student) {
      return res.status(404).json({
        message: "Student not found",
      });
    }
    if (!hasClassAccess(req, student.currentClass)) {
      return res.status(403).json({
        message: "Forbidden: class not assigned",
      });
    }
    if (isTeacher(req) && (await isTermLocked(year, term))) {
      return res.status(403).json({
        message: "Term is locked for teacher edits",
      });
    }
    if (
      isTeacher(req) &&
      (principalComment !== undefined ||
        intuitiveFeats !== undefined ||
        conventionalPerformance !== undefined)
    ) {
      return res.status(403).json({
        message: "Teachers can only update class teacher comments",
      });
    }

    const updateFields = {};
    if (conventionalPerformance !== undefined) {
      updateFields.conventionalPerformance = conventionalPerformance;
    }
    if (classTeacherComment !== undefined) {
      updateFields.classTeacherComment = classTeacherComment;
    }
    if (principalComment !== undefined) {
      updateFields.principalComment = principalComment;
    }
    if (intuitiveFeats !== undefined) {
      updateFields.intuitiveFeats = intuitiveFeats;
    }
    updateFields.updatedBy = req.user._id;

    const metadata = await ResultMetadata.findOneAndUpdate(
      {
        studentId,
        term,
        academicYear: year,
      },
      {
        $set: updateFields,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: "Result metadata saved successfully",
      metadata,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResultMetadata,
  saveResultMetadata,
};
