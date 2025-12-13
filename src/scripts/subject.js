import {
  getSettings,
  getAllSubjects,
  addSubject,
  updateSubject,
  deleteSubject,
  getSubjectByCode,
} from "./storage.js";

import { generateSubjectCode } from "./utils/utils.js";
import {
  showLoading,
  hideLoading,
  setBtnLoading,
  showNotification,
} from "./utils/ui.js";

// Class patterns for auto-selection
const classPatterns = {
  prenursery: /^(NURSERY\s*1|KG)/i,
  primary: /^(NURSERY\s*2|PRIMARY|BASIC)/i,
  jss: /^JSS/i,
  ss: /^SS/i,
};

let allClasses = [];
let allSubjects = [];
let isEditing = false;
let editingSubjectCode = null;

window.addEventListener("DOMContentLoaded", async function () {
  const container = document.querySelector(".dashboard-page") || document.body;
  showLoading(container, "Loading subjects...");

  try {
    await loadDepartments();
    await loadClassOptions();
    await loadSubjectsTable();
    await loadFilterOptions();
  } catch (error) {
    console.error("Initialization error:", error);
    showNotification("Failed to load initial data", "error");
  } finally {
    hideLoading(container);
  }

  // Expose handlers globally
  window.handleCategoryChange = handleCategoryChange;
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.closeModalOnOverlay = closeModalOnOverlay;
  window.saveSubject = saveSubject;
  window.editSubjectClick = editSubjectClick;
  window.deleteSubjectClick = deleteSubjectClick;
  window.filterSubjects = filterSubjects;
  window.autoGenerateCode = autoGenerateCode;
});

// ==================== MODAL FUNCTIONS ====================

function openModal(subjectCode = null) {
  const modal = document.getElementById("subjectModal");
  const title = document.getElementById("modalTitle");
  const saveBtn = document.getElementById("saveButton");

  if (subjectCode) {
    // Edit mode
    editSubjectClick(subjectCode);
  } else {
    // Add mode
    isEditing = false;
    editingSubjectCode = null;
    title.textContent = "Add New Subject";
    saveBtn.textContent = "Save Subject";
    resetForm();
  }

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("subjectModal");
  modal.classList.remove("active");
  document.body.style.overflow = "auto";
  resetForm();
}

function closeModalOnOverlay(event) {
  if (event.target.id === "subjectModal") {
    closeModal();
  }
}

// ==================== AUTO-GENERATE CODE ====================

function autoGenerateCode() {
  if (!isEditing) {
    const name = document.getElementById("subjectName").value.trim();
    const code = generateSubjectCode(name);
    document.getElementById("subjectCode").value = code;
  } else {
    // When editing, also update code based on name
    const name = document.getElementById("subjectName").value.trim();
    const newCode = generateSubjectCode(name);
    document.getElementById("subjectCode").value = newCode;
  }
}

// ==================== LOAD FUNCTIONS ====================

async function loadDepartments() {
  try {
    const settings = await getSettings();
    const departmentSelect = document.getElementById("departmentSelect");

    departmentSelect.innerHTML = '<option value="">Select Department</option>';

    settings.departments.forEach((dept) => {
      const option = document.createElement("option");
      option.value = dept;
      option.textContent = dept;
      departmentSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading departments:", error);
  }
}

async function loadClassOptions() {
  try {
    const settings = await getSettings();
    const classContainer = document.getElementById("classCheckboxes");

    classContainer.innerHTML = "";
    allClasses = settings.classes || [];

    allClasses.forEach((className) => {
      const label = document.createElement("label");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = className;
      checkbox.id = `class_${className}`;
      checkbox.className = "class-checkbox";

      const text = document.createTextNode(` ${className}`);

      label.appendChild(checkbox);
      label.appendChild(text);
      classContainer.appendChild(label);
    });
  } catch (error) {
    console.error("Error loading class options:", error);
  }
}

async function loadFilterOptions() {
  try {
    const settings = await getSettings();

    // Load department filter
    const deptFilter = document.getElementById("departmentFilter");
    deptFilter.innerHTML = '<option value="">All Departments</option>';
    settings.departments.forEach((dept) => {
      const option = document.createElement("option");
      option.value = dept;
      option.textContent = dept;
      deptFilter.appendChild(option);
    });

    // Load class filter
    const classFilter = document.getElementById("classFilter");
    classFilter.innerHTML = '<option value="">All Classes</option>';
    allClasses.forEach((className) => {
      const option = document.createElement("option");
      option.value = className;
      option.textContent = className;
      classFilter.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading filters:", error);
  }
}

async function loadSubjectsTable() {
  try {
    allSubjects = await getAllSubjects();
    renderSubjectsTable(allSubjects);
  } catch (error) {
    console.error("Error loading subjects table:", error);
  }
}

function renderSubjectsTable(subjects) {
  const tableBody = document.getElementById("subjectsTable");
  tableBody.innerHTML = "";

  if (subjects.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">
          <span class="material-symbols-outlined">school</span>
          <p>No subjects found. Add your first subject to get started!</p>
        </td>
      </tr>
    `;
    return;
  }

  subjects.forEach((subject) => {
    const row = document.createElement("tr");

    // Format classes as badges
    const classesBadges = (subject.classes || [])
      .map((cls) => `<span class="class-badge">${cls}</span>`)
      .join("");

    row.innerHTML = `
      <td><span class="subject-code">${subject.code}</span></td>
      <td>${subject.name}</td>
      <td>${subject.department}</td>
      <td><div class="subject-classes">${classesBadges || "None"}</div></td>
      <td>
        <div class="action-buttons">
          <button class="btn-edit" onclick="openModal('${subject.code}')">
            Edit
          </button>
          <button class="btn-delete" onclick="deleteSubjectClick('${
            subject.code
          }')">
            Delete
          </button>
        </div>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

// ==================== FILTER & SEARCH ====================

function filterSubjects() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const deptFilter = document.getElementById("departmentFilter").value;
  const classFilter = document.getElementById("classFilter").value;

  const filtered = allSubjects.filter((subject) => {
    // Search filter
    const matchesSearch =
      subject.name.toLowerCase().includes(searchTerm) ||
      subject.code.toLowerCase().includes(searchTerm);

    // Department filter
    const matchesDept = !deptFilter || subject.department === deptFilter;

    // Class filter
    const matchesClass =
      !classFilter ||
      (subject.classes && subject.classes.includes(classFilter));

    return matchesSearch && matchesDept && matchesClass;
  });

  renderSubjectsTable(filtered);
}

// ==================== CATEGORY CHANGE ====================

function handleCategoryChange() {
  const category = document.querySelector(
    'input[name="classCategory"]:checked'
  ).value;
  const container = document.getElementById("specificClassContainer");

  if (category === "specific") {
    container.style.display = "block";
  } else {
    container.style.display = "none";
  }
}

// ==================== SAVE SUBJECT ====================

async function saveSubject() {
  const name = document.getElementById("subjectName").value.trim();
  const department = document.getElementById("departmentSelect").value;
  const code = document.getElementById("subjectCode").value.trim();

  if (!name) {
    showNotification("Please enter a subject name", "error");
    return;
  }
  if (!department) {
    showNotification("Please select a department", "error");
    return;
  }
  if (!code) {
    showNotification("Subject code is required", "error");
    return;
  }

  // Check for duplicate subject code
  if (!isEditing || (isEditing && code !== editingSubjectCode)) {
    const existingSubject = allSubjects.find(
      (s) => s.code.toUpperCase() === code.toUpperCase()
    );

    if (existingSubject) {
      showNotification(`Subject code "${code}" already exists!`, "error");
      document.getElementById("subjectCode").focus();
      document.getElementById("subjectCode").select();
      return;
    }
  }

  // Determine selected classes based on category
  let selectedClasses = [];
  const category = document.querySelector(
    'input[name="classCategory"]:checked'
  ).value;

  if (category === "all") {
    selectedClasses = [...allClasses];
  } else if (category === "specific") {
    const checkboxes = document.querySelectorAll(".class-checkbox:checked");
    checkboxes.forEach((checkbox) => {
      selectedClasses.push(checkbox.value);
    });
  } else {
    // Filter based on pattern
    const pattern = classPatterns[category];
    if (pattern) {
      selectedClasses = allClasses.filter((cls) => pattern.test(cls));
    }
  }

  if (selectedClasses.length === 0) {
    showNotification("No classes selected for this subject", "error");
    return;
  }

  const subjectData = {
    code: code,
    name: name,
    department: department,
    classes: selectedClasses,
  };

  const saveBtn = document.getElementById("saveButton");
  setBtnLoading(saveBtn, true, isEditing ? "Updating..." : "Saving...");

  try {
    let success = false;

    if (isEditing) {
      if (code !== editingSubjectCode) {
        await deleteSubject(editingSubjectCode);
        success = await addSubject(subjectData);
      } else {
        success = await updateSubject(editingSubjectCode, subjectData);
      }
    } else {
      success = await addSubject(subjectData);
    }

    if (success) {
      closeModal();
      await loadSubjectsTable();
      showNotification(
        isEditing
          ? "Subject updated successfully!"
          : "Subject added successfully!",
        "success"
      );
    }
  } catch (error) {
    console.error("Error saving subject:", error);
    showNotification("Failed to save subject. Please try again.", "error");
  } finally {
    setBtnLoading(saveBtn, false);
  }
}

// ==================== EDIT SUBJECT ====================

async function editSubjectClick(code) {
  const subject = await getSubjectByCode(code);
  if (!subject) return;

  isEditing = true;
  editingSubjectCode = code;

  // Update modal UI
  document.getElementById("modalTitle").textContent = "Edit Subject";
  document.getElementById("saveButton").textContent = "Update Subject";

  // Populate fields
  document.getElementById("subjectCode").value = subject.code;
  document.getElementById("subjectName").value = subject.name;
  document.getElementById("departmentSelect").value = subject.department;

  // Handle classes - show in specific mode
  const categoryRadio = document.querySelector(
    'input[name="classCategory"][value="specific"]'
  );
  if (categoryRadio) {
    categoryRadio.checked = true;
    handleCategoryChange();
  }

  // Populate checkboxes
  const subjectClasses = subject.classes || [];
  document.querySelectorAll(".class-checkbox").forEach((cb) => {
    cb.checked = subjectClasses.includes(cb.value);
  });

  // Show modal
  const modal = document.getElementById("subjectModal");
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

// ==================== DELETE SUBJECT ====================

async function deleteSubjectClick(code) {
  const confirmed = confirm(
    "Are you sure you want to delete this subject?\n\nThis action cannot be undone."
  );

  if (confirmed) {
    showLoading(document.body, "Deleting subject...");
    try {
      await deleteSubject(code);
      await loadSubjectsTable();
      showNotification("Subject deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting subject:", error);
      showNotification("Failed to delete subject. Please try again.", "error");
    } finally {
      hideLoading(document.body);
    }
  }
}

// ==================== RESET FORM ====================

function resetForm() {
  isEditing = false;
  editingSubjectCode = null;

  document.getElementById("subjectCode").value = "";
  document.getElementById("subjectName").value = "";
  document.getElementById("departmentSelect").value = "";

  // Reset to "All" by default
  const allRadio = document.querySelector(
    'input[name="classCategory"][value="all"]'
  );
  if (allRadio) {
    allRadio.checked = true;
    handleCategoryChange();
  }

  document
    .querySelectorAll(".class-checkbox")
    .forEach((cb) => (cb.checked = false));
}
