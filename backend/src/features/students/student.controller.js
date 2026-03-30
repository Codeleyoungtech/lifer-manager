const Student = require("./student.model");
const Settings = require("../core/settings.model");

// @desc    Get all students
// @route   GET /api/students
// @access  Private
const getStudents = async (req, res, next) => {
  try {
    const { classLevel, status } = req.query;
    const query = {};
    const teacherClasses = req.user.role === "teacher" ? req.user.assignedClasses || [] : null;

    if (classLevel) {
      if (
        req.user.role === "teacher" &&
        !teacherClasses.includes(classLevel)
      ) {
        return res.status(200).json([]);
      }
      query.currentClass = classLevel;
    } else if (req.user.role === "teacher") {
      query.currentClass = { $in: teacherClasses };
    }
    if (status) query.status = status;

    const students = await Student.find(query).sort({ firstName: 1 });
    res.status(200).json(students);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
const getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      res.status(404);
      throw new Error("Student not found");
    }
    if (
      req.user.role === "teacher" &&
      !(req.user.assignedClasses || []).includes(student.currentClass)
    ) {
      res.status(403);
      throw new Error("Forbidden: student not in assigned classes");
    }

    res.status(200).json(student);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private
const createStudent = async (req, res, next) => {
  try {
    const {
      firstName,
      otherNames,
      dateOfBirth,
      gender,
      religion,
      currentClass,
      department,
      contactEmail,
      contactPhone,
      guardianName,
      address,
    } = req.body;

    // Generate Student ID if not provided
    let studentId = req.body.studentId;

    if (!studentId) {
      studentId = await generateStudentId(currentClass);
    }

    const settings = await Settings.findOne().select("currentAcademicYear");
    const student = await Student.create({
      studentId,
      firstName,
      otherNames,
      dateOfBirth,
      gender,
      religion,
      currentClass,
      department: department || "GENERAL",
      contactEmail,
      contactPhone,
      guardianName,
      address,
      currentAcademicYear: settings?.currentAcademicYear || "",
    });

    res.status(201).json(student);
  } catch (error) {
    next(error);
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private
const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      res.status(404);
      throw new Error("Student not found");
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedStudent);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      res.status(404);
      throw new Error("Student not found");
    }

    await student.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    next(error);
  }
};

// Helper: Generate Student ID
const generateStudentId = async (classLevel) => {
  const year = new Date().getFullYear();

  let prefix = "PFBS"; // Default for Primary/Prenursery

  // Check if class is Secondary (JSS or SS)
  if (
    classLevel &&
    (classLevel.toUpperCase().includes("JSS") ||
      classLevel.toUpperCase().includes("SS"))
  ) {
    prefix = "MMLC";
  }

  // Fetch all existing student IDs for this year and prefix to accurately determine the next number
  // String sorting in MongoDB fails if formats are mixed (e.g. "9" comes after "0014")
  const students = await Student.find(
    { studentId: { $regex: `^${prefix}/${year}/` } },
    { studentId: 1 } // Only fetch the ID field
  );

  let maxNum = 0;

  students.forEach((s) => {
    if (s.studentId) {
      const parts = s.studentId.split("/");
      const numStr = parts[parts.length - 1];
      const num = parseInt(numStr, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });

  const nextNum = maxNum + 1;
  const numberStr = String(nextNum).padStart(5, "0");
  return `${prefix}/${year}/${numberStr}`;
};

module.exports = {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
};
