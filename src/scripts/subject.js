import {
  getSettings,
  getAllSubjects,
  addSubject,
  updateSubject,
  deleteSubject,
  getSubjectByCode,
} from "./storage.js";

import { generateSubjectCode } from "./utils/utils.js";

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
  await loadDepartments();
  await loadClassOptions();
  await loadSubjectsTable();
  await loadFilterOptions();

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
    alert("Please enter a subject name");
    return;
  }
  if (!department) {
    alert("Please select a department");
    return;
  }
  if (!code) {
    alert("Subject code is required");
    return;
  }

  // Check for duplicate subject code (only if adding new or code changed)
  if (!isEditing || (isEditing && code !== editingSubjectCode)) {
    const existingSubject = allSubjects.find(
      (s) => s.code.toUpperCase() === code.toUpperCase()
    );

    if (existingSubject) {
      alert(
        `Subject code "${code}" already exists!\n\n` +
          `It's used by: ${existingSubject.name}\n\n` +
          `Please edit the code field to use a different unique code.`
      );
      // Focus on the code field for user to edit
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
    alert("No classes selected for this subject or category empty.");
    return;
  }

  const subjectData = {
    code: code,
    name: name,
    department: department,
    classes: selectedClasses,
  };

  let success = false;

  try {
    if (isEditing) {
      // When editing and code changes, we need to handle it specially
      if (code !== editingSubjectCode) {
        // Code changed - need to delete old and create new
        await deleteSubject(editingSubjectCode);
        success = await addSubject(subjectData);
      } else {
        // Code unchanged - normal update
        success = await updateSubject(editingSubjectCode, subjectData);
      }
    } else {
      success = await addSubject(subjectData);
    }

    if (success) {
      closeModal();
      await loadSubjectsTable();
      alert(
        isEditing
          ? "Subject updated successfully!"
          : "Subject added successfully!"
      );
    }
  } catch (error) {
    console.error("Error saving subject:", error);
    alert("Failed to save subject. Please try again.");
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
    try {
      await deleteSubject(code);
      await loadSubjectsTable();
      alert("Subject deleted successfully!");
    } catch (error) {
      console.error("Error deleting subject:", error);
      alert("Failed to delete subject. Please try again.");
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
