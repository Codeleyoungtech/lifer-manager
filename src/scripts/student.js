<<<<<<< HEAD
import {
  getSettings,
  addStudent,
  generateStudentId,
  getStudentsByClass,
  getAllStudents,
  updateStudent,
  deleteStudent,
} from "./storage.js";
=======
import { getSettings, addStudent, generateStudentId } from "./storage.js";
>>>>>>> 60453a0d9805bd7b2738c2206efa3acb379fe04f

window.addEventListener("DOMContentLoaded", function () {
  displayNextStudentId();

  loadClassLevels();

  setupFormSubmit();
<<<<<<< HEAD
  setupTabs();
  setupSearch();
});

// Tab switching is now handled via global function for simplicity with inline styles
window.switchTab = function (selectedTab) {
  // Reset all tabs
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("active");
    tab.style.color = "#666";
    tab.style.borderBottom = "none";
  });

  // Activate selected tab
  selectedTab.classList.add("active");
  selectedTab.style.color = "#007cba";
  selectedTab.style.borderBottom = "2px solid #007cba";

  // Show content
  const tabId = selectedTab.getAttribute("data-tab");
  document
    .querySelectorAll(".tab-content")
    .forEach((c) => (c.style.display = "none"));
  document.getElementById(`${tabId}-tab`).style.display = "block";

  if (tabId === "manage") {
    loadManageTab();
  }
};

function setupTabs() {
  // Initial setup not strictly needed if HTML has onclick, but good for cleanliness
  // leaving empty or removing listener logic as onclick handles it
}

=======
});

>>>>>>> 60453a0d9805bd7b2738c2206efa3acb379fe04f
function displayNextStudentId() {
  const nextId = generateStudentId();
  document.getElementById("studentid").value = nextId;
}

async function loadClassLevels() {
  try {
    const settings = await getSettings();
    const classSelect = document.getElementById("clslevel");

    classSelect.innerHTML = '<option value="">Select class level</option>';

    settings.classes.forEach((className) => {
      const option = document.createElement("option");
      option.value = className;
      option.textContent = className;
      classSelect.appendChild(option);
    });
<<<<<<< HEAD

    // Also populate filter dropdown in Manage tab
    const filterSelect = document.getElementById("filterClass");
    if (filterSelect) {
      filterSelect.innerHTML = '<option value="">Filter by Class</option>';
      settings.classes.forEach((className) => {
        const option = document.createElement("option");
        option.value = className;
        option.textContent = className;
        filterSelect.appendChild(option);
      });
    }
=======
>>>>>>> 60453a0d9805bd7b2738c2206efa3acb379fe04f
  } catch (error) {
    console.error("Error loading class levels:", error);
  }
}

function setupFormSubmit() {
  const form = document.getElementById("studentForm");

  document.getElementById("clslevel").addEventListener("change", function () {
    handleClassChange(this.value);
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const firstName = document.getElementById("Firstname").value.trim();
    const otherNames = document.getElementById("Other-Names").value.trim();
    const dob = document.getElementById("DOB").value;
    const gender = document.getElementById("gender").value;
    const religion = document.getElementById("religion").value;
    const classLevel = document.getElementById("clslevel").value;
    const contactEmail = document.getElementById("cntemail").value.trim();
    const contactPhone = document.getElementById("cntphone").value.trim();
    const guardianName = document.getElementById("guardianname").value.trim();
    const address = document.getElementById("address").value.trim();

    if (!firstName) {
      //Eleazar change this to a notification
      return;
    }
    if (!otherNames) {
      //Eleazar change this to a notification
      return;
    }
    if (!dob) {
      //Eleazar change this to a notification
      return;
    }
    if (!gender || gender === " ") {
      //Eleazar change this to a notification
      return;
    }
    if (!religion) {
      //Eleazar change this to a notification
      return;
    }
    if (!classLevel || classLevel === " ") {
      //Eleazar change this to a notification
      return;
    }

    let department = "GENERAL";
    if (classLevel.startsWith("SS")) {
      department = document.getElementById("department").value;
      if (!department) {
        //Eleazar change this to a notification for department

        return;
      }
    }

    if (!guardianName) {
      alert("Please enter parent/guardian name");
      return;
    }

    const studentData = {
      firstName: firstName,
      otherNames: otherNames,
      dateOfBirth: dob,
      gender: gender,
      religion: religion,
      currentClass: classLevel,
      department: department,
      contactEmail: contactEmail,
      contactPhone: contactPhone,
      guardianName: guardianName,
      address: address,
    };

    const newStudentId = addStudent(studentData);

    if (newStudentId) {
      // Show success notification
      showNotification(
        `✅ Student registered successfully! ID: ${newStudentId}`,
        "success"
      );

      form.reset();

      document.getElementById("departmentField").style.display = "none";

      displayNextStudentId();
    } else {
      // Show error notification
      showNotification(
        "❌ Error registering student. Please try again.",
        "error"
      );
    }
  });
}

// Show notification function
<<<<<<< HEAD
// Show notification function
=======
>>>>>>> 60453a0d9805bd7b2738c2206efa3acb379fe04f
function showNotification(message, type = "success") {
  // Remove existing notifications
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

  // Auto remove after 4 seconds
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-in";
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

function handleClassChange(classLevel) {
  const departmentField = document.getElementById("departmentField");

<<<<<<< HEAD
  if (classLevel && classLevel.startsWith("SS")) {
=======
  if (classLevel.startsWith("SS")) {
>>>>>>> 60453a0d9805bd7b2738c2206efa3acb379fe04f
    departmentField.style.display = "block";
  } else {
    departmentField.style.display = "none";
  }
}
<<<<<<< HEAD

// Manage Tab Logic
let allStudentsCache = [];
let currentView = "grid"; // Default to Grid
let selectedClass = "All"; // Default to All, or null if we want to force selection

async function loadManageTab() {
  // Render Sidebar
  await renderClassSidebar();

  // Load students
  // Show loading in main area
  const gridContainer = document.getElementById("studentsGrid");
  gridContainer.innerHTML =
    '<div style="grid-column: 1/-1; text-align: center; color: #666; padding: 20px;">Loading students...</div>';

  try {
    const students = await getAllStudents();
    allStudentsCache = students;
    performSearch(); // This will render based on default view and filters
  } catch (error) {
    console.error("Error loading students:", error);
    gridContainer.innerHTML =
      '<div style="grid-column: 1/-1; text-align: center; color: red;">Error loading students.</div>';
  }
}

async function renderClassSidebar() {
  const sidebar = document.getElementById("classSidebar");
  const settings = await getSettings();
  const classes = settings.classes || [];

  sidebar.innerHTML = "";

  // "All Classes" Option
  const allItem = document.createElement("div");
  allItem.textContent = "All Classes";
  allItem.className = `sidebar-item ${selectedClass === "All" ? "active" : ""}`;
  allItem.style.cssText = `
    padding: 10px 15px; 
    cursor: pointer; 
    border-left: 3px solid ${
      selectedClass === "All" ? "#007cba" : "transparent"
    };
    background: ${selectedClass === "All" ? "#f0f7fc" : "transparent"};
    color: ${selectedClass === "All" ? "#007cba" : "#333"};
  `;
  allItem.onclick = () => selectClass("All");
  sidebar.appendChild(allItem);

  // Class List
  classes.forEach((cls) => {
    const item = document.createElement("div");
    item.textContent = cls;
    item.className = `sidebar-item ${selectedClass === cls ? "active" : ""}`;
    item.style.cssText = `
      padding: 10px 15px; 
      cursor: pointer; 
      border-left: 3px solid ${
        selectedClass === cls ? "#007cba" : "transparent"
      };
      background: ${selectedClass === cls ? "#f0f7fc" : "transparent"};
      color: ${selectedClass === cls ? "#007cba" : "#333"};
    `;
    item.onclick = () => selectClass(cls);
    sidebar.appendChild(item);
  });
}

window.selectClass = function (cls) {
  selectedClass = cls;
  renderClassSidebar(); // Re-render to update active state styling
  performSearch();
};

window.toggleView = function (view) {
  currentView = view;

  // Update buttons
  document.querySelectorAll(".view-btn").forEach((btn) => {
    if (btn.dataset.view === view) {
      btn.classList.add("active");
      btn.style.background = "#eee";
    } else {
      btn.classList.remove("active");
      btn.style.background = "#fff";
    }
  });

  // Toggle containers
  const table = document.getElementById("tableView");
  const grid = document.getElementById("studentsGrid");

  if (view === "table") {
    table.style.display = "block";
    grid.style.display = "none";
  } else {
    table.style.display = "none";
    grid.style.display = "grid";
  }

  performSearch(); // Re-render content
};

function renderStudentsTable(students) {
  const tableBody = document.getElementById("studentsTableBody");
  const emptyState = document.getElementById("emptyState");
  const tableView = document.getElementById("tableView");

  tableBody.innerHTML = "";

  if (students.length === 0) {
    tableView.style.display = "none";
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";
  tableView.style.display = "block";

  students.forEach((student) => {
    const row = document.createElement("tr");
    row.style.borderBottom = "1px solid #eee";

    const displayId = student.studentId || student._id || "-";
    const name = `${student.firstName} ${student.otherNames}`;

    row.innerHTML = `
      <td style="padding: 12px; font-weight: 500;">${displayId}</td>
      <td style="padding: 12px; font-weight: bold; color: #333;">${name}</td>
      <td style="padding: 12px; text-align: center;"><span style="background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${
        student.currentClass
      }</span></td>
      <td style="padding: 12px; text-align: center; text-transform: capitalize;">${
        student.gender
      }</td>
      <td style="padding: 12px; text-align: center;">${
        student.guardianName || "-"
      }</td>
      <td style="padding: 12px; text-align: right;">
        <button onclick="editStudentClick('${student._id}')" 
          title="Edit"
          style="padding: 6px 10px; background: transparent; color: #007cba; border: 1px solid #007cba; border-radius: 4px; cursor: pointer; margin-right: 5px; font-size: 13px; display: inline-flex; align-items: center; gap: 4px;">
          <span class="material-symbols-outlined" style="font-size: 16px;">edit</span> Edit
        </button>
        <button onclick="deleteStudentClick('${student._id}')" 
          title="Delete"
          style="padding: 6px 10px; background: transparent; color: #dc3545; border: 1px solid transparent; border-radius: 4px; cursor: pointer; font-size: 13px; display: inline-flex; align-items: center; gap: 4px;">
          <span class="material-symbols-outlined" style="font-size: 16px;">delete</span> Delete
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function renderStudentsGrid(students) {
  const grid = document.getElementById("studentsGrid");
  const emptyState = document.getElementById("emptyState");

  grid.innerHTML = "";

  if (students.length === 0) {
    grid.style.display = "none";
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";
  grid.style.display = "grid";

  students.forEach((student) => {
    const card = document.createElement("div");
    card.style.cssText =
      "background: white; border: 1px solid #eee; border-radius: 8px; padding: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); display: flex; flex-direction: column; align-items: center; text-align: center; transition: transform 0.2s;";
    card.onmouseover = () => (card.style.transform = "translateY(-3px)");
    card.onmouseout = () => (card.style.transform = "translateY(0)");

    const initials = (
      student.firstName[0] + (student.otherNames[0] || "")
    ).toUpperCase();
    const name = `${student.firstName} ${student.otherNames}`;

    card.innerHTML = `
      <div style="width: 60px; height: 60px; background: #e3f2fd; color: #1565c0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; margin-bottom: 15px;">
        ${initials}
      </div>
      <h3 style="margin: 0 0 5px 0; font-size: 16px; color: #333;">${name}</h3>
      <span style="background: #f5f5f5; color: #666; padding: 2px 8px; border-radius: 12px; font-size: 12px; margin-bottom: 15px;">${
        student.currentClass
      }</span>
      
      <div style="width: 100%; border-top: 1px solid #eee; padding-top: 15px; margin-top: auto; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; text-align: left; font-size: 13px; color: #555;">
        <div>
           <span style="display:block; color: #999; font-size: 11px;">Gender</span>
           ${student.gender}
        </div>
        <div>
           <span style="display:block; color: #999; font-size: 11px;">Guardian</span>
           ${student.guardianName || "-"}
        </div>
      </div>

      <div style="width: 100%; margin-top: 15px; display: flex; gap: 10px;">
        <button onclick="editStudentClick('${
          student._id
        }')" style="flex: 1; padding: 8px; border: 1px solid #007cba; background: white; color: #007cba; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 600;">Edit</button>
        <button onclick="deleteStudentClick('${
          student._id
        }')" style="flex: 1; padding: 8px; border: 1px solid #ffebee; background: #ffebee; color: #d32f2f; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 600;">Delete</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  const filterGender = document.getElementById("filterGender");
  const filterStatus = document.getElementById("filterStatus");
  // filterClass is removed/replaced by sidebar

  const filters = [searchInput, filterGender, filterStatus];

  filters.forEach((filter) => {
    if (filter) {
      filter.addEventListener("input", performSearch);
      filter.addEventListener("change", performSearch);
    }
  });
}

function performSearch() {
  const query = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();
  const selectedGender = document.getElementById("filterGender").value;
  const selectedStatus = document.getElementById("filterStatus").value;

  const filtered = allStudentsCache.filter((s) => {
    // 1. Search Query
    const name = `${s.firstName} ${s.otherNames}`.toLowerCase();
    const id = (s.studentId || "").toLowerCase();
    const matchesQuery = !query || name.includes(query) || id.includes(query);

    // 2. Class Filter (Sidebar)
    const matchesClass =
      selectedClass === "All" || s.currentClass === selectedClass;

    // 3. Gender Filter
    const matchesGender =
      !selectedGender || s.gender.toLowerCase() === selectedGender;

    // 4. Status Filter
    const studentStatus = (s.status || "active").toLowerCase();
    const matchesStatus = !selectedStatus || studentStatus === selectedStatus;

    return matchesQuery && matchesClass && matchesGender && matchesStatus;
  });

  if (currentView === "grid") {
    renderStudentsGrid(filtered);
  } else {
    renderStudentsTable(filtered);
  }
}

// Edit Student Logic
window.editStudentClick = function (id) {
  const student = allStudentsCache.find(
    (s) => s._id === id || s.studentId === id
  );
  if (!student) {
    alert("Student not found!");
    return;
  }

  const modal = document.getElementById("editModal");
  const container = document.getElementById("editFormContainer");

  // Clone the registration form to reuse structure
  // In a real app, I'd extract the form to a reusable component vs cloning
  const originalForm = document.getElementById("studentForm");
  const formClone = originalForm.cloneNode(true);

  formClone.id = "editStudentForm";
  formClone.removeAttribute("onsubmit"); // Remove inline listeners if any

  // Update submit button text
  const submitBtn = formClone.querySelector("button[type='submit']");
  submitBtn.textContent = "Update Student";

  container.innerHTML = "";
  container.appendChild(formClone);

  // Populate Fields
  formClone.querySelector("#Firstname").value = student.firstName;
  formClone.querySelector("#Other-Names").value = student.otherNames;
  formClone.querySelector("#studentid").value = student.studentId || "";
  formClone.querySelector("#DOB").value = student.dateOfBirth
    ? student.dateOfBirth.split("T")[0]
    : "";
  formClone.querySelector("#gender").value = student.gender;
  formClone.querySelector("#religion").value = student.religion;
  formClone.querySelector("#clslevel").value = student.currentClass;
  formClone.querySelector("#cntemail").value = student.contactEmail || "";
  formClone.querySelector("#cntphone").value = student.contactPhone || "";
  formClone.querySelector("#guardianname").value = student.guardianName;
  formClone.querySelector("#address").value = student.address || "";

  // Handle Department Visibility
  const deptField = formClone.querySelector("#departmentField");
  if (student.currentClass && student.currentClass.startsWith("SS")) {
    deptField.style.display = "block";
    const deptSelect = formClone.querySelector("#department");
    if (deptSelect) deptSelect.value = student.department || "";
  } else {
    deptField.style.display = "none";
  }

  // Handle Form Submit
  formClone.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Gather updated data
    const updatedData = {
      firstName: formClone.querySelector("#Firstname").value.trim(),
      otherNames: formClone.querySelector("#Other-Names").value.trim(),
      // studentId is usually immutable, but we send it if needed by backend or just ignore
      dateOfBirth: formClone.querySelector("#DOB").value,
      gender: formClone.querySelector("#gender").value,
      religion: formClone.querySelector("#religion").value,
      currentClass: formClone.querySelector("#clslevel").value,
      contactEmail: formClone.querySelector("#cntemail").value.trim(),
      contactPhone: formClone.querySelector("#cntphone").value.trim(),
      guardianName: formClone.querySelector("#guardianname").value.trim(),
      address: formClone.querySelector("#address").value.trim(),
    };

    if (updatedData.currentClass.startsWith("SS")) {
      updatedData.department = formClone.querySelector("#department").value;
    } else {
      updatedData.department = "GENERAL"; // or null
    }

    try {
      await updateStudent(id, updatedData);
      showNotification("Checking details...", "success"); // Feedback immediately

      // Wait a small bit then refresh
      setTimeout(() => {
        showNotification("✅ Student updated successfully", "success");
        closeEditModal();
        loadManageTab(); // Refresh the grid/table
      }, 500);
    } catch (error) {
      console.error("Update failed", error);
      showNotification("❌ Update failed: " + error.message, "error");
    }
  });

  // Handle Class Change in Edit Form
  const classSelect = formClone.querySelector("#clslevel");
  classSelect.addEventListener("change", function () {
    if (this.value && this.value.startsWith("SS")) {
      deptField.style.display = "block";
    } else {
      deptField.style.display = "none";
    }
  });

  modal.style.display = "block";
};

window.closeEditModal = function () {
  document.getElementById("editModal").style.display = "none";
};

window.deleteStudentClick = async function (id) {
  if (
    confirm(
      "Are you sure you want to delete this student? This action cannot be undone."
    )
  ) {
    try {
      await deleteStudent(id);
      showNotification("🗑 Student deleted successfully", "success");
      loadManageTab(); // Refresh list
    } catch (error) {
      console.error("Delete failed", error);
      showNotification("❌ Delete failed: " + error.message, "error");
    }
  }
};
=======
>>>>>>> 60453a0d9805bd7b2738c2206efa3acb379fe04f
