const Result = require("./result.model");
const Student = require("../students/student.model");
<<<<<<< HEAD
const {
  calculateGrade,
  calculateRemarks,
  calculatePrimaryRemarks,
} = require("./result.utils");
=======
const { calculateGrade, calculateRemarks } = require("./result.utils");
>>>>>>> 60453a0d9805bd7b2738c2206efa3acb379fe04f

// @desc    Get results (filter by student, year, term, class)
// @route   GET /api/results
// @access  Private
const getResults = async (req, res, next) => {
  try {
    const { studentId, academicYear, term, subjectCode, classLevel } =
      req.query;
    const query = {};

    if (studentId) query.studentId = studentId;
    if (academicYear) query.academicYear = academicYear;
    if (term) query.term = term;
    if (subjectCode) query.subjectCode = subjectCode;

    // If classLevel is provided, find students in that class first
    if (classLevel) {
      const students = await Student.find({ currentClass: classLevel }).select(
        "_id"
      );
      const studentIds = students.map((s) => s._id);

      // If studentId was also provided, we need to intersect (though unlikely use case)
      if (query.studentId) {
        // If the provided studentId is not in the class, return empty
        if (!studentIds.some((id) => id.toString() === query.studentId)) {
          return res.status(200).json([]);
        }
        // query.studentId is already set
      } else {
        query.studentId = { $in: studentIds };
      }
    }

    const results = await Result.find(query)
      .populate("studentId", "firstName otherNames studentId currentClass")
      .sort({ subjectCode: 1 });

    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};

// @desc    Save single result
// @route   POST /api/results
// @access  Private
const saveResult = async (req, res, next) => {
  try {
    const {
      studentId,
      academicYear,
      term,
      subjectCode,
      weeklyTest,
      midTerm,
      exam,
    } = req.body;

    // Calculate total, grade, remarks
<<<<<<< HEAD
    // Calculate total, grade, remarks
    const total = (weeklyTest || 0) + (midTerm || 0) + (exam || 0);
    const grade = calculateGrade(total);

    // Determine remarks based on class
    let remarks;
    const student = await Student.findById(studentId);
    if (
      student &&
      (student.currentClass.startsWith("JSS") ||
        student.currentClass.startsWith("SS"))
    ) {
      remarks = calculateRemarks(total);
    } else {
      remarks = calculatePrimaryRemarks(total);
    }
=======
    const total = (weeklyTest || 0) + (midTerm || 0) + (exam || 0);
    const grade = calculateGrade(total);
    const remarks = calculateRemarks(total);
>>>>>>> 60453a0d9805bd7b2738c2206efa3acb379fe04f

    // Upsert result
    const result = await Result.findOneAndUpdate(
      { studentId, academicYear, term, subjectCode },
      {
        weeklyTest,
        midTerm,
        exam,
        total,
        grade,
        remarks,
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Batch save results
// @route   POST /api/results/batch
// @access  Private
const batchSaveResults = async (req, res, next) => {
  try {
    const { results, academicYear, term, subjectCode } = req.body;

    if (!results || !Array.isArray(results)) {
      res.status(400);
      throw new Error("Invalid results data");
    }

<<<<<<< HEAD
    // Fetch all students involved to check their class
    const studentIds = results.map((r) => r.studentId);
    const students = await Student.find({ _id: { $in: studentIds } });
    const studentMap = {};
    students.forEach((s) => {
      studentMap[s._id.toString()] = s;
    });

=======
>>>>>>> 60453a0d9805bd7b2738c2206efa3acb379fe04f
    const operations = results.map((item) => {
      const total =
        (item.weeklyTest || 0) + (item.midTerm || 0) + (item.exam || 0);
      const grade = calculateGrade(total);
<<<<<<< HEAD

      let remarks;
      const student = studentMap[item.studentId];
      if (
        student &&
        (student.currentClass.startsWith("JSS") ||
          student.currentClass.startsWith("SS"))
      ) {
        remarks = calculateRemarks(total);
      } else {
        remarks = calculatePrimaryRemarks(total);
      }
=======
      const remarks = calculateRemarks(total);
>>>>>>> 60453a0d9805bd7b2738c2206efa3acb379fe04f

      return {
        updateOne: {
          filter: {
            studentId: item.studentId,
            academicYear,
            term,
            subjectCode,
          },
          update: {
            weeklyTest: item.weeklyTest,
            midTerm: item.midTerm,
            exam: item.exam,
            total,
            grade,
            remarks,
          },
          upsert: true,
        },
      };
    });

    await Result.bulkWrite(operations);

    res.status(200).json({ message: "Results saved successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate positions for a subject in a class
// @route   POST /api/results/calculate-positions
// @access  Private
const calculatePositions = async (req, res, next) => {
  try {
    const { academicYear, term, subjectCode, classLevel } = req.body;

    // Get all students in the class
    const students = await Student.find({ currentClass: classLevel }).select(
      "_id"
    );
    const studentIds = students.map((s) => s._id);

    // Get results for these students in this subject
    const results = await Result.find({
      studentId: { $in: studentIds },
      academicYear,
      term,
      subjectCode,
    }).sort({ total: -1 });

<<<<<<< HEAD
    // Update positions AND Grades/Remarks (to enforce new grading system)
    const isSecondary =
      classLevel.startsWith("JSS") || classLevel.startsWith("SS");

    const operations = results.map((result, index) => {
      // Recalculate based on total
      const grade = calculateGrade(result.total);
      const remarks = isSecondary
        ? calculateRemarks(result.total)
        : calculatePrimaryRemarks(result.total);

      return {
        updateOne: {
          filter: { _id: result._id },
          update: {
            position: index + 1,
            grade: grade,
            remarks: remarks,
          },
        },
      };
    });
=======
    // Update positions
    const operations = results.map((result, index) => ({
      updateOne: {
        filter: { _id: result._id },
        update: { position: index + 1 },
      },
    }));
>>>>>>> 60453a0d9805bd7b2738c2206efa3acb379fe04f

    if (operations.length > 0) {
      await Result.bulkWrite(operations);
    }

    res.status(200).json({ message: "Positions calculated successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getResults,
  saveResult,
  batchSaveResults,
  calculatePositions,
};
