import {
  getSettings,
  getStudentsByClass,
  getSubjectsByClass,
  saveResult,
  getResultsByClass,
  calculatePositions,
  getSubjectsForStudent,
  getStudentResults,
} from "./storage.js";
import { showLoading, hideLoading, showNotification } from "./utils/ui.js";

let currentClass = "";
let currentYear = "";
let currentTerm = "";
let currentSubject = "";
let currentStudent = "";
let currentMode = "subject"; // 'subject' or 'student'

// Helper for subject ordering
const validClassPatterns = {
  prenursery: /^(NURSERY\s*1|KG)/i,
  primary: /^(NURSERY\s*2|PRIMARY|BASIC)/i,
  jss: /^JSS/i,
  ss: /^SS/i,
};

function getSubjectCategory(className) {
  for (const [category, pattern] of Object.entries(validClassPatterns)) {
    if (pattern.test(className)) {
      return category;
    }
  }
  return null;
}

async function getOrderedSubjects(subjects, className) {
  try {
    const settings = await getSettings();
    const category = getSubjectCategory(className);

    if (
      !category ||
      !settings.subjectOrders ||
      !settings.subjectOrders[category]
    ) {
      // Default alpha sort if no order defined
      return subjects.sort((a, b) => a.name.localeCompare(b.name));
    }

    const order = settings.subjectOrders[category];
    const orderedSubjects = [];
    const remainingSubjects = [...subjects];

    // Pick subjects in order
    order.forEach((code) => {
      const idx = remainingSubjects.findIndex((s) => s.code === code);
      if (idx !== -1) {
        orderedSubjects.push(remainingSubjects[idx]);
        remainingSubjects.splice(idx, 1);
      }
    });

    // Append remaining subjects sorted alphabetically
    remainingSubjects.sort((a, b) => a.name.localeCompare(b.name));
    return [...orderedSubjects, ...remainingSubjects];
  } catch (err) {
    console.error("Error sorting subjects:", err);
    return subjects.sort((a, b) => a.name.localeCompare(b.name));
  }
}

window.addEventListener("DOMContentLoaded", async function () {
  await loadYearOptions();
  await loadClassOptions();
  await loadTermOptions();

  // Default mode UI setup
  updateModeUI();

  setupChangeListeners();
});

window.switchMode = function (mode) {
  currentMode = mode;
  updateModeUI();

  // Reset specific selections but keep Class/Year/Term
  currentSubject = "";
  currentStudent = "";
  document.getElementById("resultSubject").value = "";
  document.getElementById("resultStudent").value = "";

  // Clear table
  document.getElementById("spreadsheetBody").innerHTML = "";
  document.getElementById("subjectTitle").textContent = "No Selection";

  // Reload options if class is already selected
  if (currentClass) {
    if (mode === "subject") {
      loadSubjectOptions();
    } else {
      loadStudentOptions();
    }
  }
};

function updateModeUI() {
  const subjectBtn = document.getElementById("modeSubject");
  const studentBtn = document.getElementById("modeStudent");
  const subjectContainer = document.getElementById("subjectSelectContainer");
  const studentContainer = document.getElementById("studentSelectContainer");

  if (currentMode === "subject") {
    subjectBtn.classList.add("active");
    studentBtn.classList.remove("active");
    subjectContainer.style.display = "block";
    studentContainer.style.display = "none";
  } else {
    subjectBtn.classList.remove("active");
    studentBtn.classList.add("active");
    subjectContainer.style.display = "none";
    studentContainer.style.display = "block";
  }
}

async function loadYearOptions() {
  try {
    const settings = await getSettings();
    const yearSelect = document.getElementById("resultYear");
    yearSelect.innerHTML = `<option value="${settings.currentAcademicYear}">${settings.currentAcademicYear}</option>`;
    currentYear = settings.currentAcademicYear;
  } catch (error) {
    console.error("Error loading year options:", error);
  }
}

async function loadClassOptions() {
  try {
    const settings = await getSettings();
    const classSelect = document.getElementById("resultClass");

    classSelect.innerHTML = '<option value="">Select Class</option>';

    settings.classes.forEach((className) => {
      const option = document.createElement("option");
      option.value = className;
      option.textContent = className;
      classSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading class options:", error);
  }
}

async function loadTermOptions() {
  try {
    const settings = await getSettings();
    const termSelect = document.getElementById("resultTerm");

    // Set default term from settings if available
    if (settings.currentTerm) {
      termSelect.value = settings.currentTerm;
    }
    currentTerm = termSelect.value;
  } catch (error) {
    console.error("Error loading term options:", error);
  }
}

async function loadSubjectOptions() {
  const subjectSelect = document.getElementById("resultSubject");
  subjectSelect.innerHTML = '<option value="">Select Subject</option>';

  if (!currentClass) return;

  try {
    const subjects = await getSubjectsByClass(currentClass);
    const sortedSubjects = await getOrderedSubjects(subjects, currentClass);

    const isSSClass = currentClass.startsWith("SS");

    const generalSubjects = [];
    const scienceSubjects = [];
    const artsSubjects = [];
    const commercialSubjects = [];

    sortedSubjects.forEach((subject) => {
      if (subject.department === "GENERAL") {
        generalSubjects.push(subject);
      } else if (subject.department === "SCIENCE") {
        scienceSubjects.push(subject);
      } else if (subject.department === "ARTS") {
        artsSubjects.push(subject);
      } else if (subject.department === "COMMERCIAL") {
        commercialSubjects.push(subject);
      }
    });

    if (generalSubjects.length > 0) {
      const optgroup = document.createElement("optgroup");
      optgroup.label = "General Subjects (All Students)";
      generalSubjects.forEach((subject) => {
        const option = document.createElement("option");
        option.value = subject.code;
        option.textContent = subject.name;
        optgroup.appendChild(option);
      });
      subjectSelect.appendChild(optgroup);
    }

    if (isSSClass) {
      if (scienceSubjects.length > 0) {
        const optgroup = document.createElement("optgroup");
        optgroup.label = "Science Department";
        scienceSubjects.forEach((subject) => {
          const option = document.createElement("option");
          option.value = subject.code;
          option.textContent = subject.name;
          optgroup.appendChild(option);
        });
        subjectSelect.appendChild(optgroup);
      }

      if (artsSubjects.length > 0) {
        const optgroup = document.createElement("optgroup");
        optgroup.label = "Arts Department";
        artsSubjects.forEach((subject) => {
          const option = document.createElement("option");
          option.value = subject.code;
          option.textContent = subject.name;
          optgroup.appendChild(option);
        });
        subjectSelect.appendChild(optgroup);
      }

      if (commercialSubjects.length > 0) {
        const optgroup = document.createElement("optgroup");
        optgroup.label = "Commercial Department";
        commercialSubjects.forEach((subject) => {
          const option = document.createElement("option");
          option.value = subject.code;
          option.textContent = subject.name;
          optgroup.appendChild(option);
        });
        subjectSelect.appendChild(optgroup);
      }
    }
  } catch (error) {
    console.error("Error loading subjects:", error);
    showNotification("Failed to load subjects", "error");
  }
}

function setupChangeListeners() {
  document
    .getElementById("resultClass")
    .addEventListener("change", async function () {
      currentClass = this.value;
      if (currentMode === "subject") {
        await loadSubjectOptions();
      } else {
        await loadStudentOptions();
      }
      // Cannot load sheet yet until subject or student is selected
      document.getElementById("spreadsheetBody").innerHTML = "";
    });

  document
    .getElementById("resultStudent")
    .addEventListener("change", async function () {
      currentStudent = this.value;
      await loadStudentGradeSheet();
    });

  document
    .getElementById("resultSubject")
    .addEventListener("change", async function () {
      currentSubject = this.value;
      await loadGradeSheet();
    });

  document
    .getElementById("resultTerm")
    .addEventListener("change", async function () {
      currentTerm = this.value;
      await loadGradeSheet();
    });

  document
    .getElementById("resultYear")
    .addEventListener("change", async function () {
      currentYear = this.value;
      await loadGradeSheet();
    });
}

async function loadGradeSheet() {
  if (!currentClass || !currentSubject) {
    showEmptyMessage();
    return;
  }

  const container =
    document.querySelector(".spreadsheet-container") || document.body;
  showLoading(container, "Loading grade sheet...");

  try {
    const students = await getStudentsByClass(currentClass);

    if (students.length === 0) {
      showNoStudentsMessage();
      return;
    }

    const subjects = await getSubjectsByClass(currentClass);
    const subject = subjects.find((s) => s.code === currentSubject);

    if (!subject) {
      console.error("Subject not found");
      return;
    }

    document.getElementById("subjectTitle").textContent = subject.name;
    document.getElementById("termInfo").textContent = currentTerm
      .replace("Term", " TERM")
      .toUpperCase();
    document.getElementById("classInfo").textContent = currentClass;

    const resultsMap = await getResultsByClass(
      currentClass,
      currentSubject,
      currentYear,
      currentTerm
    );

    buildGradeTable(students, subject, resultsMap);
  } catch (error) {
    console.error("Error loading grade sheet:", error);
    showNotification("Failed to load grade sheet. Please try again.", "error");
  } finally {
    hideLoading(container);
  }
}

async function loadStudentOptions() {
  const studentSelect = document.getElementById("resultStudent");
  studentSelect.innerHTML = '<option value="">Select Student</option>';

  if (!currentClass) return;

  try {
    const students = await getStudentsByClass(currentClass);
    students.sort((a, b) => a.firstName.localeCompare(b.firstName));

    students.forEach((student) => {
      const option = document.createElement("option");
      // Use _id for value as we need it for saving
      option.value = student._id;
      option.textContent = `${student.firstName} ${student.otherNames}`;
      studentSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading students:", error);
    showNotification("Failed to load students", "error");
  }
}

async function loadStudentGradeSheet() {
  if (!currentClass || !currentStudent) {
    // showEmptyMessage(); // Can reuse or adapt
    return;
  }

  const container =
    document.querySelector(".spreadsheet-container") || document.body;
  showLoading(container, "Loading student subjects...");

  try {
    // 1. Get Student Details (we might have them in the list, but let's assume we need to fetch or just use what we have if we stored it properly)
    // For now we just use the ID.

    // 2. Get Subjects for this student
    let subjects = await getSubjectsForStudent(currentStudent);

    // Sort subjects based on settings
    subjects = await getOrderedSubjects(subjects, currentClass);

    // 3. Get Existing Results for this student across all subjects
    const resultsData = await getStudentResults(
      currentStudent,
      currentYear,
      currentTerm
    );
    const resultsMap = resultsData.subjects || {}; // Keyed by subjectCode

    // Update Header Info
    const studentSelect = document.getElementById("resultStudent");
    const studentName = studentSelect.options[studentSelect.selectedIndex].text;

    document.getElementById("subjectTitle").textContent = studentName; // Reusing this ID for Student Name
    document.getElementById("termInfo").textContent = currentTerm
      .replace("Term", " TERM")
      .toUpperCase();
    document.getElementById("classInfo").textContent = currentClass;

    // Build Table
    buildStudentGradeTable(subjects, resultsMap);
  } catch (error) {
    console.error("Error loading student grade sheet:", error);
    showNotification("Failed to load student data. Please try again.", "error");
  } finally {
    hideLoading(container);
  }
}

function buildStudentGradeTable(subjects, resultsMap) {
  const tableBody = document.getElementById("spreadsheetBody");
  tableBody.innerHTML = "";

  // Change Header "Student Information" to "Subject"
  // Note: We are hacking the table header by changing the TH content if needed,
  // or we can just accept that the second column is "Information"
  // Let's modify the header text dynamically
  const headerRow = document.querySelector("#gradesTable thead tr");
  if (headerRow) {
    headerRow.children[1].textContent = "Subject Information";
  }

  if (subjects.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: #666;">
          <h3>No Subjects Found</h3>
          <p>This student does not seem to have any subjects registered.</p>
        </td>
      </tr>
    `;
    return;
  }

  subjects.forEach((subject, index) => {
    const existingResult = resultsMap[subject.code];

    const row = document.createElement("tr");
    row.dataset.subjectCode = subject.code; // Key for saving

    // Determine max scores based on class level
    // Prenursery: 20 20 60
    // Others: 10 20 70
    const isPrenursery = /^(NURSERY\s*1|KG)/i.test(currentClass);
    const maxWeekly = isPrenursery ? 20 : 10;
    const maxExam = isPrenursery ? 60 : 70;

    row.innerHTML = `
      <td style="padding: 10px; text-align: center;">${index + 1}</td>
      <td style="padding: 10px;">
        <div><strong>${subject.name}</strong></div>
        <div style="font-size: 11px; color: #999;">Code: ${subject.code}</div>
      </td>
      <td style="padding: 10px; text-align: center;">
        <input 
          type="number" 
          class="score-input weekly-test"
          min="0" 
          max="${maxWeekly}" 
          value="${existingResult?.weeklyTest || ""}"
          placeholder="0-${maxWeekly}"
          style="width: 80px; padding: 5px; text-align: center; border: 1px solid #ddd; border-radius: 4px;"
        />
      </td>
      <td style="padding: 10px; text-align: center;">
        <input 
          type="number" 
          class="score-input mid-term"
          min="0" 
          max="20" 
          value="${existingResult?.midTerm || ""}"
          placeholder="0-20"
          style="width: 80px; padding: 5px; text-align: center; border: 1px solid #ddd; border-radius: 4px;"
        />
      </td>
      <td style="padding: 10px; text-align: center;">
        <input 
          type="number" 
          class="score-input exam"
          min="0" 
          max="${maxExam}" 
          value="${existingResult?.exam || ""}"
          placeholder="0-${maxExam}"
          style="width: 80px; padding: 5px; text-align: center; border: 1px solid #ddd; border-radius: 4px;"
        />
      </td>
      <td style="padding: 10px; text-align: center;">
        <strong class="total-display">${existingResult?.total || "-"}</strong>
      </td>
      <td style="padding: 10px; text-align: center;">
        <span class="position-display">${
          existingResult?.total ? existingResult.position || "-" : "-"
        }</span>
      </td>
      <td style="padding: 10px; text-align: center;">
        <span class="remarks-display">${existingResult?.remarks || "-"}</span>
      </td>
    `;

    tableBody.appendChild(row);

    const inputs = row.querySelectorAll(".score-input");
    inputs.forEach((input) => {
      input.addEventListener("input", function () {
        calculateRowTotal(row);
      });
    });
  });
}

function buildGradeTable(students, subject, resultsMap) {
  const tableBody = document.getElementById("spreadsheetBody");
  tableBody.innerHTML = "";

  // Restore Header "Subject Information" to "Student Information"
  const headerRow = document.querySelector("#gradesTable thead tr");
  if (headerRow) {
    headerRow.children[1].textContent = "Student Information";
  }

  let eligibleStudents = students;

  if (subject.department !== "GENERAL") {
    eligibleStudents = students.filter(
      (student) => student.department === subject.department
    );

    if (eligibleStudents.length < students.length) {
      const infoRow = document.createElement("tr");
      infoRow.innerHTML = `
        <td colspan="7" style="background: #fff3cd; padding: 10px; text-align: center; border: 1px solid #ffc107;">
          ℹ️ Showing only <strong>${subject.department}</strong> department students for this subject.
          (${eligibleStudents.length} of ${students.length} students in ${currentClass})
        </td>
      `;
      tableBody.appendChild(infoRow);
    }
  }

  if (eligibleStudents.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 40px; color: #666;">
          <h3>No students in ${subject.department} department</h3>
          <p>There are no students in ${currentClass} registered for ${subject.department} department.</p>
        </td>
      </tr>
    `;
    return;
  }

  eligibleStudents.forEach((student, index) => {
    // student._id is the MongoDB ID
    // resultsMap is keyed by _id
    const existingResults = resultsMap[student._id];

    const row = document.createElement("tr");
    row.dataset.studentId = student._id;

    // Determine max scores based on class level
    // Prenursery: 20 20 60
    // Others: 10 20 70
    const isPrenursery = /^(NURSERY\s*1|KG)/i.test(currentClass);
    const maxWeekly = isPrenursery ? 20 : 10;
    const maxExam = isPrenursery ? 60 : 70;

    row.innerHTML = `
      <td style="padding: 10px; text-align: center;">${index + 1}</td>
      <td style="padding: 10px;">
        <div><strong>${student.firstName} ${student.otherNames}</strong></div>
        <div style="font-size: 12px; color: #666;">${
          student.studentId || student._id
        }</div>
        <div style="font-size: 11px; color: #999;">Dept: ${
          student.department
        }</div>
      </td>
      <td style="padding: 10px; text-align: center;">
        <input 
          type="number" 
          class="score-input weekly-test"
          min="0" 
          max="${maxWeekly}" 
          value="${existingResults?.weeklyTest || ""}"
          placeholder="0-${maxWeekly}"
          style="width: 80px; padding: 5px; text-align: center; border: 1px solid #ddd; border-radius: 4px;"
        />
      </td>
      <td style="padding: 10px; text-align: center;">
        <input 
          type="number" 
          class="score-input mid-term"
          min="0" 
          max="20" 
          value="${existingResults?.midTerm || ""}"
          placeholder="0-20"
          style="width: 80px; padding: 5px; text-align: center; border: 1px solid #ddd; border-radius: 4px;"
        />
      </td>
      <td style="padding: 10px; text-align: center;">
        <input 
          type="number" 
          class="score-input exam"
          min="0" 
          max="${maxExam}" 
          value="${existingResults?.exam || ""}"
          placeholder="0-${maxExam}"
          style="width: 80px; padding: 5px; text-align: center; border: 1px solid #ddd; border-radius: 4px;"
        />
      </td>
      <td style="padding: 10px; text-align: center;">
        <strong class="total-display">${existingResults?.total || "-"}</strong>
      </td>
      <td style="padding: 10px; text-align: center;">
        <span class="position-display">${
          existingResults?.total ? existingResults.position || "-" : "-"
        }</span>
      </td>
      <td style="padding: 10px; text-align: center;">
        <span class="remarks-display">${existingResults?.remarks || "-"}</span>
      </td>
    `;

    tableBody.appendChild(row);

    const inputs = row.querySelectorAll(".score-input");
    inputs.forEach((input) => {
      input.addEventListener("input", function () {
        calculateRowTotal(row);
      });
    });
  });
}

function calculateRowTotal(row) {
  const weeklyTest = parseFloat(row.querySelector(".weekly-test").value) || 0;
  const midTerm = parseFloat(row.querySelector(".mid-term").value) || 0;
  const exam = parseFloat(row.querySelector(".exam").value) || 0;

  const total = weeklyTest + midTerm + exam;

  let grade = "F";
  let remarks = "Fail";

  if (total >= 80) {
    grade = "A";
    remarks = "Excellent";
  } else if (total >= 70) {
    grade = "B";
    remarks = "Very Good";
  } else if (total >= 60) {
    grade = "C";
    remarks = "Good";
  } else if (total >= 50) {
    grade = "D";
    remarks = "Pass";
  } else if (total >= 40) {
    grade = "E";
    remarks = "Weak Pass";
  }

  row.querySelector(".total-display").textContent = total;
  row.querySelector(".remarks-display").textContent = remarks;
}

window.saveAllResults = async function () {
  if (currentMode === "subject" && (!currentClass || !currentSubject)) {
    showNotification("Please select a class and subject first!", "error");
    return;
  }
  if (currentMode === "student" && (!currentClass || !currentStudent)) {
    showNotification("Please select a class and a student first!", "error");
    return;
  }

  showLoading(document.body, "Saving results...");

  const rows = document.querySelectorAll("#spreadsheetBody tr");
  let savedCount = 0;
  const promises = [];
  const affectedSubjects = new Set();

  rows.forEach((row) => {
    let studentId, subjectCode;

    if (currentMode === "subject") {
      studentId = row.dataset.studentId;
      subjectCode = currentSubject;
      if (!studentId) return; // Skip info rows
    } else {
      studentId = currentStudent;
      subjectCode = row.dataset.subjectCode;
      if (!subjectCode) return; // Skip info rows or headers if any
    }

    affectedSubjects.add(subjectCode);

    const wInput = row.querySelector(".weekly-test");
    const mInput = row.querySelector(".mid-term");
    const eInput = row.querySelector(".exam");

    // Skip saving if all inputs are empty (user didn't touch this row)
    if (wInput.value === "" && mInput.value === "" && eInput.value === "") {
      return;
    }

    const weeklyTest = parseFloat(wInput.value) || 0;
    const midTerm = parseFloat(mInput.value) || 0;
    const exam = parseFloat(eInput.value) || 0;

    // Only save if there's at least one score or if we want to clear it (but backend handles upsert)
    // If all are 0, we still save it as 0.

    promises.push(
      saveResult(
        studentId,
        subjectCode,
        {
          weeklyTest: weeklyTest,
          midTerm: midTerm,
          exam: exam,
        },
        currentYear,
        currentTerm
      )
    );
    savedCount++;
  });

  try {
    await Promise.all(promises);

    // Calculate positions after saving all
    // Calculate positions after saving all
    // Iterate over all affected subjects (one in subject mode, many in student mode)
    const positionPromises = Array.from(affectedSubjects).map((subjectCode) =>
      calculatePositions(currentClass, subjectCode, currentYear, currentTerm)
    );
    await Promise.all(positionPromises);

    showNotification(
      `✅ Successfully saved results for ${savedCount} entries!`,
      "success"
    );
    if (currentMode === "subject") {
      await loadGradeSheet();
    } else {
      await loadStudentGradeSheet();
    }
  } catch (error) {
    console.error("Error saving results:", error);
    showNotification("Failed to save results. Please try again.", "error");
  } finally {
    hideLoading(document.body);
  }
};

function showEmptyMessage() {
  const tableBody = document.getElementById("spreadsheetBody");
  tableBody.innerHTML = `
    <tr>
      <td colspan="7" style="text-align: center; padding: 40px; color: #666;">
        <h3>📋 Select a Class and Subject</h3>
        <p>Choose a class and subject from the dropdowns above to start entering grades.</p>
      </td>
    </tr>
  `;

  document.getElementById("subjectTitle").textContent = "No Subject Selected";
  document.getElementById("termInfo").textContent = "";
  document.getElementById("classInfo").textContent = "";
}

function showNoStudentsMessage() {
  const tableBody = document.getElementById("spreadsheetBody");
  tableBody.innerHTML = `
    <tr>
      <td colspan="7" style="text-align: center; padding: 40px; color: #666;">
        <h3>👥 No Students Found</h3>
        <p>There are no students registered in ${currentClass} yet.</p>
        <p><a href="../pages/student.html">Register students first</a></p>
      </td>
    </tr>
  `;
}

window.exportToCSV = async function () {
  if (currentMode === "subject" && (!currentClass || !currentSubject)) {
    showNotification("Please select a class and subject first!", "error");
    return;
  }
  if (currentMode === "student" && (!currentClass || !currentStudent)) {
    showNotification("Please select a class and a student first!", "error");
    return;
  }

  try {
    let csvContent = "";
    let filename = "";

    if (currentMode === "subject") {
      const students = await getStudentsByClass(currentClass);
      // Sort students by name
      students.sort((a, b) => a.firstName.localeCompare(b.firstName));

      const subjects = await getSubjectsByClass(currentClass);
      const subject = subjects.find((s) => s.code === currentSubject);
      const resultsMap = await getResultsByClass(
        currentClass,
        currentSubject,
        currentYear,
        currentTerm
      );

      csvContent =
        "Student Name,Student ID,Weekly Test,Mid-Term,Exam,Total,Grade,Position\n";

      students.forEach((student) => {
        const result = resultsMap[student._id] || {};
        csvContent += `"${student.firstName} ${student.otherNames}",${
          student.studentId || student._id
        },${result.weeklyTest || 0},${result.midTerm || 0},${
          result.exam || 0
        },${result.total || 0},${result.grade || "-"},${
          result.position || "-"
        }\n`;
      });

      filename = `${currentClass}_${subject.name}_${currentTerm}_${currentYear}.csv`;
    } else {
      // Student Mode
      const studentSelect = document.getElementById("resultStudent");
      const studentName =
        studentSelect.options[studentSelect.selectedIndex].text;

      let subjects = await getSubjectsForStudent(currentStudent);
      subjects = await getOrderedSubjects(subjects, currentClass);

      const resultsData = await getStudentResults(
        currentStudent,
        currentYear,
        currentTerm
      );
      const resultsMap = resultsData.subjects || {};

      csvContent =
        "Subject,Code,Weekly Test,Mid-Term,Exam,Total,Grade,Position\n";

      subjects.forEach((subject) => {
        const result = resultsMap[subject.code] || {};
        csvContent += `"${subject.name}",${subject.code},${
          result.weeklyTest || 0
        },${result.midTerm || 0},${result.exam || 0},${result.total || 0},${
          result.grade || "-"
        },${result.position || "-"}\n`;
      });

      filename = `${studentName}_${currentClass}_${currentTerm}_${currentYear}.csv`;
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    showNotification("✅ Results exported to CSV!", "success");
  } catch (error) {
    console.error("Error exporting to CSV:", error);
    showNotification("Failed to export results.", "error");
  }
};
