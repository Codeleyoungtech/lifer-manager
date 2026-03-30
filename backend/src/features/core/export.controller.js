const Student = require("../students/student.model");
const Attendance = require("./attendance.model");
const Result = require("../results/result.model");
const ResultMetadata = require("../results/result-metadata.model");

const csvEscape = (value) => {
  const text = value === undefined || value === null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

const toCsv = (headers, rows) => {
  const headerLine = headers.map(csvEscape).join(",");
  const rowLines = rows.map((row) =>
    headers.map((header) => csvEscape(row[header])).join(",")
  );
  return [headerLine, ...rowLines].join("\n");
};

const exportStudents = async (req, res, next) => {
  try {
    const students = await Student.find().sort({ currentClass: 1, firstName: 1 });
    const headers = [
      "studentId",
      "firstName",
      "otherNames",
      "currentClass",
      "department",
      "status",
      "guardianName",
      "contactPhone",
      "createdAt",
    ];
    const csv = toCsv(headers, students);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="students-export.csv"`
    );
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

const exportAttendance = async (req, res, next) => {
  try {
    const { classLevel, term, year } = req.query;
    const query = {};
    if (classLevel) query.classLevel = classLevel;
    if (term) query.term = term;
    if (year) query.academicYear = year;

    const records = await Attendance.find(query)
      .populate("studentId", "studentId firstName otherNames")
      .sort({ classLevel: 1, academicYear: 1, term: 1 });
    const headers = [
      "studentId",
      "studentName",
      "classLevel",
      "academicYear",
      "term",
      "timePresent",
      "timeAbsent",
      "maxAttendance",
      "updatedAt",
    ];
    const rows = records.map((record) => ({
      studentId: record.studentId?.studentId || "",
      studentName: `${record.studentId?.firstName || ""} ${
        record.studentId?.otherNames || ""
      }`.trim(),
      classLevel: record.classLevel,
      academicYear: record.academicYear,
      term: record.term,
      timePresent: record.timePresent,
      timeAbsent: record.timeAbsent,
      maxAttendance: record.maxAttendance,
      updatedAt: record.updatedAt,
    }));
    const csv = toCsv(headers, rows);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="attendance-export.csv"`
    );
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

const exportResults = async (req, res, next) => {
  try {
    const { term, year, classLevel } = req.query;
    const query = {};
    if (term) query.term = term;
    if (year) query.academicYear = year;

    let classStudentIds = null;
    if (classLevel) {
      const students = await Student.find({ currentClass: classLevel }).select("_id");
      classStudentIds = students.map((student) => student._id);
      query.studentId = { $in: classStudentIds };
    }

    const results = await Result.find(query)
      .populate("studentId", "studentId firstName otherNames currentClass")
      .sort({ academicYear: 1, term: 1, subjectCode: 1 });

    const headers = [
      "studentId",
      "studentName",
      "classLevel",
      "academicYear",
      "term",
      "subjectCode",
      "weeklyTest",
      "midTerm",
      "exam",
      "total",
      "grade",
      "position",
      "updatedAt",
    ];
    const rows = results.map((record) => ({
      studentId: record.studentId?.studentId || "",
      studentName: `${record.studentId?.firstName || ""} ${
        record.studentId?.otherNames || ""
      }`.trim(),
      classLevel: record.studentId?.currentClass || "",
      academicYear: record.academicYear,
      term: record.term,
      subjectCode: record.subjectCode,
      weeklyTest: record.weeklyTest,
      midTerm: record.midTerm,
      exam: record.exam,
      total: record.total,
      grade: record.grade,
      position: record.position,
      updatedAt: record.updatedAt,
    }));
    const csv = toCsv(headers, rows);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="results-export.csv"`
    );
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

const exportComments = async (req, res, next) => {
  try {
    const { term, year, classLevel } = req.query;
    const query = {};
    if (term) query.term = term;
    if (year) query.academicYear = year;

    let allowedIds = null;
    if (classLevel) {
      const students = await Student.find({ currentClass: classLevel }).select("_id");
      allowedIds = students.map((student) => student._id);
      query.studentId = { $in: allowedIds };
    }

    const records = await ResultMetadata.find(query)
      .populate("studentId", "studentId firstName otherNames currentClass")
      .sort({ academicYear: 1, term: 1 });

    const headers = [
      "studentId",
      "studentName",
      "classLevel",
      "academicYear",
      "term",
      "classTeacherComment",
      "principalComment",
      "updatedAt",
    ];
    const rows = records.map((record) => ({
      studentId: record.studentId?.studentId || "",
      studentName: `${record.studentId?.firstName || ""} ${
        record.studentId?.otherNames || ""
      }`.trim(),
      classLevel: record.studentId?.currentClass || "",
      academicYear: record.academicYear,
      term: record.term,
      classTeacherComment: record.classTeacherComment || "",
      principalComment: record.principalComment || "",
      updatedAt: record.updatedAt,
    }));
    const csv = toCsv(headers, rows);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="comments-export.csv"`
    );
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportStudents,
  exportAttendance,
  exportResults,
  exportComments,
};
