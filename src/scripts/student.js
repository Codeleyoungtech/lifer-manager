import {
  getSettings,
  addStudent,
  generateStudentId,
  getAllStudents,
  updateStudent,
  deleteStudent,
} from "./storage.js";
import {
  showLoading,
  hideLoading,
  setBtnLoading,
  showNotification,
} from "./utils/ui.js";

let allStudents = [];
let selectedClass = null;
let currentView = "grid"; // grid or table
let isEditing = false;
let editingStudentId = null;

// Expose global functions immediately
window.openModal = openModal;
window.closeModal = closeModal;
window.closeModalOnOverlay = closeModalOnOverlay;
window.saveStudent = saveStudent;
window.toggleView = toggleView;
window.filterStudents = filterStudents;
window.selectClass = selectClass;
window.editStudentClick = editStudentClick;
window.deleteStudentClick = deleteStudentClick;

window.addEventListener("DOMContentLoaded", async function () {
  const container = document.querySelector(".dashboard-page") || document.body;
  showLoading(container, "Loading students...");

  try {
    await loadClassLevels();
    await loadClassSidebar();
    await loadStudents();
    setupEventListeners();
  } catch (error) {
    console.error("Initialization error:", error);
    showNotification("Failed to load initial data", "error");
  } finally {
    hideLoading(container);
  }
});

// ==================== LOAD DATA ====================

async function loadClassLevels() {
  try {
    const settings = await getSettings();

    // Load in modal form
    const classSelect = document.getElementById("classLevel");
    classSelect.innerHTML = '<option value="">Select class level</option>';
    settings.classes.forEach((className) => {
      const option = document.createElement("option");
      option.value = className;
      option.textContent = className;
      classSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading class levels:", error);
  }
}

async function loadClassSidebar() {
  try {
    const settings = await getSettings();
    const sidebar = document.getElementById("classSidebar");

    sidebar.innerHTML = "";

    settings.classes.forEach((className) => {
      const button = document.createElement("button");
      button.className = "class-sidebar-btn";
      button.onclick = () => selectClass(className);

      button.innerHTML = `
        <span>${className}</span>
        <span class="material-symbols-outlined" style="font-size: 1.25rem;">chevron_right</span>
      `;

      sidebar.appendChild(button);
    });
  } catch (error) {
    console.error("Error loading class sidebar:", error);
  }
}

async function loadStudents() {
  try {
    allStudents = await getAllStudents();
  } catch (error) {
    console.error("Error loading students:", error);
  }
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
  // Class level change - show/hide department
  document.getElementById("classLevel").addEventListener("change", function () {
    const deptField = document.getElementById("departmentField");
    if (this.value && this.value.startsWith("SS")) {
      deptField.style.display = "block";
    } else {
      deptField.style.display = "none";
    }
  });
}

// ==================== SELECT CLASS ====================

function selectClass(className) {
  selectedClass = className;

  // Update sidebar button states
  document.querySelectorAll(".class-sidebar-btn").forEach((btn) => {
    if (btn.textContent.trim().startsWith(className)) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Hide select message
  document.getElementById("selectClassMessage").style.display = "none";

  // Show student sections
  document.getElementById("activeStudentsSection").style.display = "block";
  document.getElementById("leftStudentsSection").style.display = "block";

  // Render students
  renderStudents();
}

// ==================== MODAL FUNCTIONS ====================

function openModal(studentId = null) {
  const modal = document.getElementById("studentModal");
  const title = document.getElementById("modalTitle");
  const saveBtn = document.getElementById("saveButton");

  if (studentId) {
    // Edit mode
    isEditing = true;
    editingStudentId = studentId;
    title.textContent = "Edit Student";
    saveBtn.textContent = "Update Student";
    populateFormForEdit(studentId);
  } else {
    // Add mode
    isEditing = false;
    editingStudentId = null;
    title.textContent = "Add New Student";
    saveBtn.textContent = "Save Student";
    resetForm();
    // Generate new student ID
    document.getElementById("studentId").value = generateStudentId();
  }

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("studentModal");
  modal.classList.remove("active");
  document.body.style.overflow = "auto";
  resetForm();
}

function closeModalOnOverlay(event) {
  if (event.target.id === "studentModal") {
    closeModal();
  }
}

// ==================== FORM FUNCTIONS ====================

async function saveStudent() {
  const firstName = document.getElementById("firstName").value.trim();
  const otherNames = document.getElementById("otherNames").value.trim();
  const dob = document.getElementById("dob").value;
  const gender = document.getElementById("gender").value;
  const religion = document.getElementById("religion").value;
  const classLevel = document.getElementById("classLevel").value;
  const guardianName = document.getElementById("guardianName").value.trim();
  const contactEmail = document.getElementById("contactEmail").value.trim();
  const contactPhone = document.getElementById("contactPhone").value.trim();
  const address = document.getElementById("address").value.trim();
  const status = document.getElementById("studentStatus").value;

  // Validation
  if (
    !firstName ||
    !otherNames ||
    !dob ||
    !gender ||
    !religion ||
    !classLevel ||
    !guardianName ||
    !status
  ) {
    alert("Please fill in all required fields");
    return;
  }

  let department = "GENERAL";
  if (classLevel.startsWith("SS")) {
    department = document.getElementById("department").value;
    if (!department) {
      alert("Please select a department for SS students");
      return;
    }
  }

  const studentData = {
    firstName,
    otherNames,
    dateOfBirth: dob,
    gender,
    religion,
    currentClass: classLevel,
    department,
    guardianName,
    contactEmail,
    contactPhone,
    address,
    status,
  };

  const saveBtn = document.getElementById("saveButton");

  try {
    setBtnLoading(saveBtn, true, isEditing ? "Updating..." : "Saving...");

    if (isEditing) {
      // Update existing student
      await updateStudent(editingStudentId, studentData);
      showNotification("✅ Student updated successfully!", "success");
    } else {
      // Add new student
      const newStudentId = await addStudent(studentData);
      showNotification(
        `✅ Student registered successfully! ID: ${newStudentId}`,
        "success"
      );
    }

    closeModal();
    await loadStudents();

    // Refresh current view if a class is selected
    if (selectedClass) {
      renderStudents();
    }
  } catch (error) {
    console.error("Error saving student:", error);
    showNotification(
      `❌ ${error.message || "Failed to save student."}`,
      "error"
    );
  } finally {
    setBtnLoading(saveBtn, false);
  }
}

function populateFormForEdit(studentId) {
  const student = allStudents.find((s) => s._id === studentId);
  if (!student) return;

  document.getElementById("studentId").value = student.studentId || "";
  document.getElementById("firstName").value = student.firstName;
  document.getElementById("otherNames").value = student.otherNames;
  document.getElementById("dob").value = student.dateOfBirth
    ? student.dateOfBirth.split("T")[0]
    : "";
  document.getElementById("gender").value = student.gender;
  document.getElementById("religion").value = student.religion;
  document.getElementById("classLevel").value = student.currentClass;
  document.getElementById("guardianName").value = student.guardianName || "";
  document.getElementById("contactEmail").value = student.contactEmail || "";
  document.getElementById("contactPhone").value = student.contactPhone || "";
  document.getElementById("address").value = student.address || "";
  document.getElementById("studentStatus").value = student.status || "active";

  // Handle department
  const deptField = document.getElementById("departmentField");
  if (student.currentClass && student.currentClass.startsWith("SS")) {
    deptField.style.display = "block";
    document.getElementById("department").value = student.department || "";
  } else {
    deptField.style.display = "none";
  }
}

function resetForm() {
  document.getElementById("studentForm").reset();
  document.getElementById("departmentField").style.display = "none";
  isEditing = false;
  editingStudentId = null;
}

// ==================== VIEW TOGGLE ====================

function toggleView(view) {
  currentView = view;

  // Update button states
  document.querySelectorAll(".view-btn").forEach((btn) => {
    if (btn.dataset.view === view) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  renderStudents();
}

// ==================== FILTER STUDENTS ====================

function filterStudents() {
  if (!selectedClass) return;
  renderStudents();
}

// ==================== RENDER STUDENTS ====================

function renderStudents() {
  if (!selectedClass) {
    // Show select class message
    document.getElementById("selectClassMessage").style.display = "block";
    document.getElementById("activeStudentsSection").style.display = "none";
    document.getElementById("leftStudentsSection").style.display = "none";
    return;
  }

  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const genderFilter = document.getElementById("filterGender").value;

  // Filter students for selected class
  const classStudents = allStudents.filter(
    (s) => s.currentClass === selectedClass
  );

  // Apply search and gender filters
  const filteredStudents = classStudents.filter((student) => {
    // Search filter
    const name = `${student.firstName} ${student.otherNames}`.toLowerCase();
    const id = (student.studentId || "").toLowerCase();
    const matchesSearch =
      !searchTerm || name.includes(searchTerm) || id.includes(searchTerm);

    // Gender filter
    const matchesGender =
      !genderFilter || student.gender.toLowerCase() === genderFilter;

    return matchesSearch && matchesGender;
  });

  // Separate active and left students
  const activeStudents = filteredStudents.filter(
    (s) => (s.status || "active") === "active"
  );
  const leftStudents = filteredStudents.filter((s) => s.status === "left");

  // Render active students
  renderStudentSection(activeStudents, "active");

  // Render left students
  renderStudentSection(leftStudents, "left");
}

function renderStudentSection(students, section) {
  const prefix = section === "active" ? "active" : "left";

  // Update count
  document.getElementById(`${prefix}StudentCount`).textContent =
    students.length;

  if (currentView === "grid") {
    renderGridSection(students, prefix);
  } else {
    renderTableSection(students, prefix);
  }
}

function renderGridSection(students, prefix) {
  const gridView = document.getElementById(`${prefix}GridView`);
  const tableView = document.getElementById(`${prefix}TableView`);
  const emptyState = document.getElementById(`${prefix}EmptyState`);

  tableView.style.display = "none";

  if (students.length === 0) {
    gridView.style.display = "none";
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";
  gridView.style.display = "grid";
  gridView.innerHTML = "";

  students.forEach((student) => {
    const card = createStudentCard(student);
    gridView.appendChild(card);
  });
}

function renderTableSection(students, prefix) {
  const gridView = document.getElementById(`${prefix}GridView`);
  const tableView = document.getElementById(`${prefix}TableView`);
  const tableBody = document.getElementById(`${prefix}TableBody`);
  const emptyState = document.getElementById(`${prefix}EmptyState`);

  gridView.style.display = "none";

  if (students.length === 0) {
    tableView.style.display = "none";
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";
  tableView.style.display = "block";
  tableBody.innerHTML = "";

  students.forEach((student) => {
    const row = createStudentRowSimple(student);
    tableBody.appendChild(row);
  });
}

// ==================== CREATE ELEMENTS ====================

function createStudentCard(student) {
  const card = document.createElement("div");
  card.className = "student-card";

  const initials = getInitials(student.firstName, student.otherNames);
  const name = `${student.firstName} ${student.otherNames}`;

  card.innerHTML = `
    <div class="student-avatar">${initials}</div>
    <div class="student-card-name">${name}</div>
    <div class="student-card-info">
      <div class="student-card-row">
        <span class="student-card-label">Gender:</span>
        <span class="student-card-value">${capitalizeFirst(
          student.gender
        )}</span>
      </div>
      <div class="student-card-row">
        <span class="student-card-label">Guardian:</span>
        <span class="student-card-value">${student.guardianName || "-"}</span>
      </div>
    </div>
    <div class="student-card-actions">
      <button class="btn-action btn-edit" onclick="editStudentClick('${
        student._id
      }')">
        Edit
      </button>
      <button class="btn-action btn-delete" onclick="deleteStudentClick('${
        student._id
      }')">
        Delete
      </button>
    </div>
  `;

  return card;
}

function createStudentRowSimple(student) {
  const row = document.createElement("tr");
  const initials = getInitials(student.firstName, student.otherNames);
  const name = `${student.firstName} ${student.otherNames}`;

  row.innerHTML = `
    <td>
      <div class="student-avatar-cell">
        <div class="student-avatar">${initials}</div>
        <div class="student-name-info">
          <div class="student-name">${name}</div>
          <div class="student-id-small">${student.studentId || ""}</div>
        </div>
      </div>
    </td>
    <td>${capitalizeFirst(student.gender)}</td>
    <td>${student.guardianName || "-"}</td>
    <td style="text-align: right">
      <div class="action-buttons">
        <button class="btn-action btn-edit" onclick="editStudentClick('${
          student._id
        }')">
          Edit
        </button>
        <button class="btn-action btn-delete" onclick="deleteStudentClick('${
          student._id
        }')">
          Delete
        </button>
      </div>
    </td>
  `;

  return row;
}

// ==================== EDIT & DELETE ====================

async function editStudentClick(studentId) {
  openModal(studentId);
}

async function deleteStudentClick(studentId) {
  const student = allStudents.find((s) => s._id === studentId);
  if (!student) return;

  const confirmed = confirm(
    `Are you sure you want to delete ${student.firstName} ${student.otherNames}?\n\nThis action cannot be undone.`
  );

  if (confirmed) {
    showLoading(document.body, "Deleting student...");
    try {
      await deleteStudent(studentId);
      showNotification("🗑️ Student deleted successfully", "success");
      await loadStudents();

      if (selectedClass) {
        renderStudents();
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      showNotification(
        "❌ Failed to delete student. Please try again.",
        "error"
      );
    } finally {
      hideLoading(document.body);
    }
  }
}

// ==================== HELPER FUNCTIONS ====================

function getInitials(firstName, otherNames) {
  const first = firstName ? firstName[0] : "";
  const other = otherNames ? otherNames[0] : "";
  return (first + other).toUpperCase();
}

function capitalizeFirst(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Helper functions like getInitials and capitalizeFirst remain
