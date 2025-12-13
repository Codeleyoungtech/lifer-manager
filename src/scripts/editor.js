import {
  getSettings,
  getStudentsByClass,
  getSubjectsByClass,
  saveResult,
  getResultsByClass,
  calculatePositions,
} from "./storage.js";
import { showLoading, hideLoading, showNotification } from "./utils/ui.js";

let currentClass = "";
let currentYear = "";
let currentTerm = "";
let currentSubject = "";

window.addEventListener("DOMContentLoaded", async function () {
  await loadYearOptions();
  await loadClassOptions();
  await loadTermOptions();

  setupChangeListeners();
});

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
    const isSSClass = currentClass.startsWith("SS");

    const generalSubjects = [];
    const scienceSubjects = [];
    const artsSubjects = [];
    const commercialSubjects = [];

    subjects.forEach((subject) => {
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
      await loadSubjectOptions();
      await loadGradeSheet();
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

function buildGradeTable(students, subject, resultsMap) {
  const tableBody = document.getElementById("spreadsheetBody");
  tableBody.innerHTML = "";

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
          max="10" 
          value="${existingResults?.weeklyTest || ""}"
          placeholder="0-10"
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
          max="70" 
          value="${existingResults?.exam || ""}"
          placeholder="0-70"
          style="width: 80px; padding: 5px; text-align: center; border: 1px solid #ddd; border-radius: 4px;"
        />
      </td>
      <td style="padding: 10px; text-align: center;">
        <strong class="total-display">${existingResults?.total || "-"}</strong>
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
  if (!currentClass || !currentSubject) {
    showNotification("Please select a class and subject first!", "error");
    return;
  }

  showLoading(document.body, "Saving results...");

  const rows = document.querySelectorAll("#spreadsheetBody tr");
  let savedCount = 0;
  const promises = [];

  rows.forEach((row) => {
    const studentId = row.dataset.studentId;

    // Skip info rows
    if (!studentId) return;

    const weeklyTest = parseFloat(row.querySelector(".weekly-test").value) || 0;
    const midTerm = parseFloat(row.querySelector(".mid-term").value) || 0;
    const exam = parseFloat(row.querySelector(".exam").value) || 0;

    // Only save if there's at least one score or if we want to clear it (but backend handles upsert)
    // If all are 0, we still save it as 0.

    promises.push(
      saveResult(
        studentId,
        currentSubject,
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
    await calculatePositions(
      currentClass,
      currentSubject,
      currentYear,
      currentTerm
    );

    showNotification(
      `✅ Successfully saved results for ${savedCount} students!`,
      "success"
    );
    await loadGradeSheet();
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
  if (!currentClass || !currentSubject) {
    showNotification("Please select a class and subject first!", "error");
    return;
  }

  try {
    const students = await getStudentsByClass(currentClass);
    const subjects = await getSubjectsByClass(currentClass);
    const subject = subjects.find((s) => s.code === currentSubject);
    const resultsMap = await getResultsByClass(
      currentClass,
      currentSubject,
      currentYear,
      currentTerm
    );

    let csv =
      "Student Name,Student ID,Weekly Test,Mid-Term,Exam,Total,Grade,Position\n";

    students.forEach((student) => {
      const result = resultsMap[student.id];

      if (result) {
        csv += `"${student.firstName} ${student.otherNames}",${
          student.studentId || student.id
        },${result.weeklyTest},${result.midTerm},${result.exam},${
          result.total
        },${result.grade},${result.position || "-"}\n`;
      }
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${currentClass}_${subject.name}_${currentTerm}_${currentYear}.csv`;
    link.click();

    alert("✅ Results exported to CSV!");
  } catch (error) {
    console.error("Error exporting to CSV:", error);
    showNotification("Failed to export results.", "error");
  }
};
