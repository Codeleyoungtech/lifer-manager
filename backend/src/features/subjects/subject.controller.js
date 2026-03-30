const Subject = require("./subject.model");

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
const getSubjects = async (req, res, next) => {
  try {
    const { classLevel, department } = req.query;
    const query = {};
    const teacherClasses = req.user.role === "teacher" ? req.user.assignedClasses || [] : null;

    if (classLevel) {
      if (
        req.user.role === "teacher" &&
        !teacherClasses.includes(classLevel)
      ) {
        return res.status(200).json([]);
      }
      query.classes = classLevel;
    } else if (req.user.role === "teacher") {
      query.classes = { $in: teacherClasses };
    }
    if (department) query.department = department;

    const subjects = await Subject.find(query).sort({ name: 1 });
    res.status(200).json(subjects);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single subject
// @route   GET /api/subjects/:code
// @access  Private
const getSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ code: req.params.code });

    if (!subject) {
      res.status(404);
      throw new Error("Subject not found");
    }
    if (req.user.role === "teacher") {
      const classes = subject.classes || [];
      const teacherClasses = req.user.assignedClasses || [];
      const canAccess = classes.some((className) =>
        teacherClasses.includes(className)
      );
      if (!canAccess) {
        res.status(403);
        throw new Error("Forbidden: subject not in assigned classes");
      }
    }

    res.status(200).json(subject);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private
const createSubject = async (req, res, next) => {
  try {
    const { code, name, department, classes } = req.body;

    const subjectExists = await Subject.findOne({ code });

    if (subjectExists) {
      res.status(400);
      throw new Error("Subject already exists");
    }

    const subject = await Subject.create({
      code,
      name,
      department,
      classes,
    });

    res.status(201).json(subject);
  } catch (error) {
    next(error);
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:code
// @access  Private
const updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ code: req.params.code });

    if (!subject) {
      res.status(404);
      throw new Error("Subject not found");
    }

    const updatedSubject = await Subject.findOneAndUpdate(
      { code: req.params.code },
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedSubject);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:code
// @access  Private
const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({ code: req.params.code });

    if (!subject) {
      res.status(404);
      throw new Error("Subject not found");
    }

    await subject.deleteOne();

    res.status(200).json({ code: req.params.code });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
};
