const Student = require("./student.model");

// @desc    Get all students
// @route   GET /api/students
// @access  Private
const getStudents = async (req, res, next) => {
  try {
    const { classLevel, status } = req.query;
    const query = {};

    if (classLevel) query.currentClass = classLevel;
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

    // Generate Student ID
    const studentId = await generateStudentId();

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
      currentAcademicYear: "2024-2025", // Should come from settings
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
const generateStudentId = async () => {
  const year = new Date().getFullYear();
  // Fetch all existing student IDs for this year to accurately determine the next number
  // String sorting in MongoDB fails if formats are mixed (e.g. "9" comes after "0014")
  const students = await Student.find(
    { studentId: { $regex: `^MLC/ADM/${year}/` } },
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
  const numberStr = String(nextNum).padStart(4, "0");
  return `MLC/ADM/${year}/${numberStr}`;
};

module.exports = {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
};
