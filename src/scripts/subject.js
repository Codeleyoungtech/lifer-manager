import {
  getSettings,
  getAllSubjects,
  addSubject,
<<<<<<< HEAD
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
let isEditing = false;
let editingSubjectCode = null;

=======
  deleteSubject,
} from "./storage.js";
import { generateSubjectCode } from "./utils/utils.js";

>>>>>>> 60453a0d9805bd7b2738c2206efa3acb379fe04f
window.addEventListener("DOMContentLoaded", async function () {
  await loadDepartments();

  await loadClassOptions();

  await loadSubjectsTable();
<<<<<<< HEAD

  // Expose handler globally
  window.handleCategoryChange = handleCategoryChange;
});

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

=======
});

>>>>>>> 60453a0d9805bd7b2738c2206efa3acb379fe04f
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

<<<<<<< HEAD
    allClasses = settings.classes || [];

    allClasses.forEach((className) => {
=======
    settings.classes.forEach((className) => {
>>>>>>> 60453a0d9805bd7b2738c2206efa3acb379fe04f
      const div = document.createElement("div");
      div.style.display = "inline-block";
      div.style.marginRight = "15px";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = className;
      checkbox.id = `class_${className}`;
      checkbox.className = "class-checkbox";

      const label = document.createElement("label");
      label.htmlFor = `class_${className}`;
      label.textContent = className;
      label.style.marginLeft = "5px";

      div.appendChild(checkbox);
      div.appendChild(label);

      classContainer.appendChild(div);
    });
  } catch (error) {
    console.error("Error loading class options:", error);
  }
}

async function loadSubjectsTable() {
  try {
    const subjects = await getAllSubjects();
    const tableBody = document.getElementById("subjectsTable");

    tableBody.innerHTML = "";

    if (subjects.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 20px; color: #666;">
            No subjects added yet. Add your first subject above.
          </td>
        </tr>
      `;
      return;
    }

    subjects.forEach((subject) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td style="padding: 1rem; border: 1px solid #ddd;">${subject.code}</td>
        <td style="padding: 1rem; border: 1px solid #ddd;">${subject.name}</td>
        <td style="padding: 1rem; border: 1px solid #ddd;">${subject.department}</td>
<<<<<<< HEAD
        <td style="padding: 1rem; border: 1px solid #ddd; display: flex; gap: 10px;">
          <button 
            onclick="editSubjectClick('${subject.code}')" 
            style="padding: 5px 15px; background: #ff9800; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Edit
          </button>
=======
        <td style="padding: 1rem; border: 1px solid #ddd;">
>>>>>>> 60453a0d9805bd7b2738c2206efa3acb379fe04f
          <button 
            onclick="deleteSubjectClick('${subject.code}')" 
            style="padding: 5px 15px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Delete
          </button>
        </td>
      `;

      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading subjects table:", error);
  }
}

window.saveSubject = async function () {
  const name = document.getElementById("subjectName").value.trim();
  const department = document.getElementById("departmentSelect").value;
<<<<<<< HEAD
  const code =
    document.getElementById("subjectCode").value.trim() ||
    generateSubjectCode(name);

  if (!name) {
    alert("Please enter a subject name");
    return;
  }
  if (!department) {
    alert("Please select a department");
    return;
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
=======
  const code = generateSubjectCode(name);

  if (!name) return;
  if (!department) return;

  const selectedClasses = [];
  const checkboxes = document.querySelectorAll(".class-checkbox:checked");
  checkboxes.forEach((checkbox) => {
    selectedClasses.push(checkbox.value);
  });

  if (selectedClasses.length === 0) return;
>>>>>>> 60453a0d9805bd7b2738c2206efa3acb379fe04f

  const subjectData = {
    code: code,
    name: name,
    department: department,
    classes: selectedClasses,
  };

<<<<<<< HEAD
  let success = false;

  if (isEditing) {
    // If editing, we use the original code (editingSubjectCode) to identify the record
    // But we pass the possibly NEW code if user changed it
    // Note: Changing primary key (code) might need specific backend handling or delete+create
    // For now assuming update endpoint handles body update
    // If user changed code, we might need to handle ID change differently, but let's try direct update
    // Actually, update typically assumes ID in URL is immutable, body has changes
    // If we want to change code, we might fail if backend uses code as ID.
    // Let's assume code is immutable for now or handled by backend.
    success = await updateSubject(editingSubjectCode, subjectData);
  } else {
    success = await addSubject(subjectData);
  }

  if (success) {
    resetForm();
    await loadSubjectsTable();
    alert(
      isEditing
        ? "Subject updated successfully!"
        : "Subject added successfully!"
    );
  }
};

window.editSubjectClick = async function (code) {
  const subject = await getSubjectByCode(code);
  if (!subject) return;

  isEditing = true;
  editingSubjectCode = code;

  // Update UI text
  const header = document.querySelector(".dashboard-action h3");
  if (header) header.textContent = "Edit Subject";

  const btn = document.querySelector("button[onclick='saveSubject()']");
  if (btn) btn.textContent = "Update Subject";

  // Populate fields
  document.getElementById("subjectCode").value = subject.code;
  document.getElementById("subjectName").value = subject.name;
  document.getElementById("departmentSelect").value = subject.department;

  // Handle classes
  // Default to Specific to show exactly what's selected
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

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
};

function resetForm() {
  isEditing = false;
  editingSubjectCode = null;

  document.getElementById("subjectCode").value = "";
  document.getElementById("subjectName").value = "";
  document.getElementById("departmentSelect").value = "";

  const header = document.querySelector(".dashboard-action h3");
  if (header) header.textContent = "Add New Subject";

  const btn = document.querySelector("button[onclick='saveSubject()']");
  if (btn) btn.textContent = "Save Subject";

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

=======
  const success = await addSubject(subjectData);

  if (success) {
    document.getElementById("subjectCode").value = "";
    document.getElementById("subjectName").value = "";
    document.getElementById("departmentSelect").value = "";

    document
      .querySelectorAll(".class-checkbox")
      .forEach((cb) => (cb.checked = false));

    await loadSubjectsTable();
    alert("Subject added successfully!");
  }
};

>>>>>>> 60453a0d9805bd7b2738c2206efa3acb379fe04f
window.deleteSubjectClick = async function (code) {
  const confirmed = confirm("Are you sure you want to delete this subject?");

  if (confirmed) {
    await deleteSubject(code);

    await loadSubjectsTable();

    alert("Subject deleted successfully!");
  }
};
