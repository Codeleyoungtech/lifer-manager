import { getSettings } from "./storage.js";
import { getStudentsByClass } from "./storage.js";
import attendanceService from "./api/attendance.service.js";

let currentClass = "";
let currentTerm = "firstTerm";
let currentYear = "";
let students = [];
let settings = {};

window.addEventListener("DOMContentLoaded", async function () {
  await loadSettings();
  setupEventListeners();
});

async function loadSettings() {
  try {
    settings = await getSettings();

    // Populate academic year
    currentYear = settings.currentAcademicYear || "";
    document.getElementById("academicYear").value = currentYear;

    // Populate class dropdown
    const classSelect = document.getElementById("classSelect");
    classSelect.innerHTML = '<option value="">Select Class</option>';

    settings.classes.forEach((className) => {
      const option = document.createElement("option");
      option.value = className;
      option.textContent = className;
      classSelect.appendChild(option);
    });

    // Set current term as default
    document.getElementById("termSelect").value =
      settings.currentTerm || "firstTerm";
    currentTerm = settings.currentTerm || "firstTerm";

    // Display max attendance
    const maxAttendanceDisplay = document.getElementById(
      "maxAttendanceDisplay"
    );
    if (maxAttendanceDisplay) {
      const maxAtt = settings.maxAttendance || 0;
      maxAttendanceDisplay.value = maxAtt ? `${maxAtt} days` : "Not configured";
    }
  } catch (error) {
    console.error("Error loading settings:", error);
    showNotification("Failed to load settings", "error");
  }
}

function setupEventListeners() {
  // Load students button
  document
    .getElementById("loadStudentsBtn")
    .addEventListener("click", loadStudents);

  // Save attendance button
  document
    .getElementById("saveAttendanceBtn")
    .addEventListener("click", saveAttendance);

  // Class/Term change
  document.getElementById("classSelect").addEventListener("change", (e) => {
    currentClass = e.target.value;
  });

  document.getElementById("termSelect").addEventListener("change", (e) => {
    currentTerm = e.target.value;
  });
}

// Handle input mode switching
function setupInputModeListeners() {
  const inputPresentRadio = document.getElementById("inputPresent");
  const inputAbsentRadio = document.getElementById("inputAbsent");

  if (!inputPresentRadio || !inputAbsentRadio) return;

  inputPresentRadio.addEventListener("change", () => {
    updateInputMode("present");
  });

  inputAbsentRadio.addEventListener("change", () => {
    updateInputMode("absent");
  });
}

function updateInputMode(mode) {
  const maxAttendance = parseInt(settings.maxAttendance) || 0;
  const presentInputs = document.querySelectorAll(".time-present");
  const absentInputs = document.querySelectorAll(".time-absent");

  if (mode === "present") {
    // Enable present inputs, disable and calculate absent
    presentInputs.forEach((input) => {
      input.disabled = false;
      input.style.backgroundColor = "white";
      input.style.cursor = "text";
    });
    absentInputs.forEach((input) => {
      input.disabled = true;
      input.style.backgroundColor = "#f5f5f5";
      input.style.cursor = "not-allowed";
      // Calculate absent from present
      const presentInput = document.querySelector(
        `.time-present[data-student-id="${input.dataset.studentId}"]`
      );
      const present = parseInt(presentInput.value) || 0;
      input.value = Math.max(0, maxAttendance - present);
    });
  } else {
    // Enable absent inputs, disable and calculate present
    absentInputs.forEach((input) => {
      input.disabled = false;
      input.style.backgroundColor = "white";
      input.style.cursor = "text";
    });
    presentInputs.forEach((input) => {
      input.disabled = true;
      input.style.backgroundColor = "#f5f5f5";
      input.style.cursor = "not-allowed";
      // Calculate present from absent
      const absentInput = document.querySelector(
        `.time-absent[data-student-id="${input.dataset.studentId}"]`
      );
      const absent = parseInt(absentInput.value) || 0;
      input.value = Math.max(0, maxAttendance - absent);
    });
  }
}

async function loadStudents() {
  const classSelect = document.getElementById("classSelect");
  const termSelect = document.getElementById("termSelect");

  currentClass = classSelect.value;
  currentTerm = termSelect.value;

  if (!currentClass) {
    showNotification("Please select a class", "error");
    return;
  }

  try {
    // Fetch students in the class
    students = await getStudentsByClass(currentClass);

    if (students.length === 0) {
      document.getElementById("attendanceTableCard").style.display = "block";
      document.getElementById("emptyState").style.display = "block";
      document.getElementById("attendanceTableBody").innerHTML = "";
      return;
    }

    // Fetch existing attendance records
    const attendanceRecords = await attendanceService.getAttendance(
      currentClass,
      currentTerm,
      currentYear
    );

    // Create a map for quick lookup
    const attendanceMap = {};
    attendanceRecords.forEach((record) => {
      attendanceMap[record.studentId._id || record.studentId] = record;
    });

    // Populate table
    renderAttendanceTable(students, attendanceMap);

    // Check if max attendance is configured
    const maxAttendance = parseInt(settings.maxAttendance) || 0;
    if (maxAttendance === 0) {
      showNotification(
        "⚠️ Max Attendance is not set in Settings. Auto-calculation will not work properly.",
        "error"
      );
      // Show table without setting up input modes
      document.getElementById("attendanceTableCard").style.display = "block";
      document.getElementById("emptyState").style.display = "none";
      return;
    }

    // Setup input mode listeners after table is rendered
    setupInputModeListeners();

    // Apply initial input mode (default is "present")
    updateInputMode("present");

    // Show table card and info banner
    document.getElementById("attendanceTableCard").style.display = "block";
    document.getElementById("emptyState").style.display = "none";
    const infoBanner = document.getElementById("infoBanner");
    if (infoBanner) {
      infoBanner.style.display = "flex";
    }

    showNotification(`Loaded ${students.length} students`, "success");
  } catch (error) {
    console.error("Error loading students:", error);
    showNotification("Failed to load students", "error");
  }
}

function renderAttendanceTable(students, attendanceMap) {
  const tbody = document.getElementById("attendanceTableBody");
  tbody.innerHTML = "";
  const maxAttendance = parseInt(settings.maxAttendance) || 0;

  students.forEach((student) => {
    const attendance = attendanceMap[student._id] || {};

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${student.studentId}</td>
      <td>${student.firstName} ${student.otherNames}</td>
      <td>
        <input
          type="number"
          class="time-present"
          data-student-id="${student._id}"
          value="${attendance.timePresent || 0}"
          min="0"
          max="${maxAttendance}"
        />
      </td>
      <td>
        <input
          type="number"
          class="time-absent"
          data-student-id="${student._id}"
          value="${attendance.timeAbsent || 0}"
          min="0"
          max="${maxAttendance}"
        />
      </td>
    `;

    tbody.appendChild(row);
  });

  // Add input event listeners for auto-calculation
  const presentInputs = document.querySelectorAll(".time-present");
  const absentInputs = document.querySelectorAll(".time-absent");

  presentInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
      const inputMode = document.querySelector(
        'input[name="inputMode"]:checked'
      )?.value;
      if (inputMode === "present") {
        const studentId = e.target.dataset.studentId;
        const present = parseInt(e.target.value) || 0;
        const absentInput = document.querySelector(
          `.time-absent[data-student-id="${studentId}"]`
        );
        absentInput.value = Math.max(0, maxAttendance - present);
      }
    });
  });

  absentInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
      const inputMode = document.querySelector(
        'input[name="inputMode"]:checked'
      )?.value;
      if (inputMode === "absent") {
        const studentId = e.target.dataset.studentId;
        const absent = parseInt(e.target.value) || 0;
        const presentInput = document.querySelector(
          `.time-present[data-student-id="${studentId}"]`
        );
        presentInput.value = Math.max(0, maxAttendance - absent);
      }
    });
  });
}

async function saveAttendance() {
  if (!currentClass || !currentTerm) {
    showNotification("Please select class and term first", "error");
    return;
  }

  const maxAttendance = parseInt(settings.maxAttendance) || 0;

  // Collect all attendance data from inputs
  const attendanceRecords = [];
  const rows = document.querySelectorAll("#attendanceTableBody tr");

  rows.forEach((row) => {
    const presentInput = row.querySelector(".time-present");
    const absentInput = row.querySelector(".time-absent");

    attendanceRecords.push({
      studentId: presentInput.dataset.studentId,
      timePresent: parseInt(presentInput.value) || 0,
      timeAbsent: parseInt(absentInput.value) || 0,
    });
  });

  try {
    await attendanceService.bulkSaveAttendance({
      classLevel: currentClass,
      term: currentTerm,
      year: currentYear,
      maxAttendance,
      attendanceRecords,
    });

    showNotification("✅ Attendance saved successfully!", "success");
  } catch (error) {
    console.error("Error saving attendance:", error);
    showNotification("❌ Failed to save attendance", "error");
  }
}

function showNotification(message, type = "success") {
  const existing = document.querySelector(".notification");
  if (existing) {
    existing.remove();
  }

  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  const styles = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 8px;
    font-weight: bold;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease-out;
  `;

  notification.style.cssText = styles;

  if (type === "success") {
    notification.style.backgroundColor = "#4CAF50";
    notification.style.color = "white";
  } else {
    notification.style.backgroundColor = "#f44336";
    notification.style.color = "white";
  }

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-in";
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}
