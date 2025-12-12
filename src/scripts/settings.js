import { getSettings, getAllSubjects } from "./storage.js";
import settingsService from "./api/settings.service.js";

let currentClasses = [];
let currentDepartments = [];
let allSubjects = [];

window.addEventListener("DOMContentLoaded", async function () {
  await loadSettings();
  setupEventListeners();
  setupTabs();
});

function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  const tabContents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs and contents
      tabs.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Add active class to clicked tab
      tab.classList.add("active");

      // Show corresponding content
      const tabId = tab.getAttribute("data-tab");
      document.getElementById(`${tabId}-tab`).classList.add("active");
    });
  });
}

async function loadSettings() {
  try {
    const settings = await getSettings();

    // Populate form fields
    document.getElementById("schoolName").value = settings.schoolName || "";
    document.getElementById("academicYear").value =
      settings.currentAcademicYear || "";
    document.getElementById("currentTerm").value =
      settings.currentTerm || "firstTerm";
    document.getElementById("dateOfVacation").value =
      settings.dateOfVacation || "";
    document.getElementById("maxAttendance").value =
      settings.maxAttendance || "";
    document.getElementById("dateOfResumption").value =
      settings.dateOfResumption || "";

    // Load classes and departments
    currentClasses = settings.classes || [];
    currentDepartments = settings.departments || [];

    renderClassesList();
    renderClassesList();
    renderDepartmentsList();

    // Load Subject Orders
    allSubjects = await getAllSubjects();
    renderSubjectOrders(settings.subjectOrders || {});
  } catch (error) {
    console.error("Error loading settings:", error);
    showNotification("Failed to load settings", "error");
  }
}

function renderClassesList() {
  const list = document.getElementById("classesList");
  list.innerHTML = "";

  currentClasses.forEach((className, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${className}</span>
      <button type="button" onclick="removeClass(${index})" title="Remove">
        <span class="material-symbols-outlined">close</span>
      </button>
    `;
    list.appendChild(li);
  });
}

function renderDepartmentsList() {
  const list = document.getElementById("departmentsList");
  list.innerHTML = "";

  currentDepartments.forEach((deptName, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${deptName}</span>
      <button type="button" onclick="removeDepartment(${index})" title="Remove">
        <span class="material-symbols-outlined">close</span>
      </button>
    `;
    list.appendChild(li);
  });
}

function setupEventListeners() {
  // Add class button
  document.getElementById("addClassBtn").addEventListener("click", function () {
    const input = document.getElementById("newClass");
    const className = input.value.trim();

    if (!className) {
      showNotification("Please enter a class name", "error");
      return;
    }

    if (currentClasses.includes(className)) {
      showNotification("Class already exists", "error");
      return;
    }

    currentClasses.push(className);
    renderClassesList();
    input.value = "";
    showNotification(`Added class: ${className}`, "success");
  });

  // Add department button
  document.getElementById("addDeptBtn").addEventListener("click", function () {
    const input = document.getElementById("newDepartment");
    const deptName = input.value.trim().toUpperCase();

    if (!deptName) {
      showNotification("Please enter a department name", "error");
      return;
    }

    if (currentDepartments.includes(deptName)) {
      showNotification("Department already exists", "error");
      return;
    }

    currentDepartments.push(deptName);
    renderDepartmentsList();
    input.value = "";
    showNotification(`Added department: ${deptName}`, "success");
  });

  // Form submission
  document
    .getElementById("settingsForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      e.preventDefault();
      await saveSettings();
    });

  // Academic Form submission
  const academicForm = document.getElementById("academicSettingsForm");
  if (academicForm) {
    academicForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      await saveSettings();
    });
  }
}

// Make these functions globally available
window.removeClass = function (index) {
  const className = currentClasses[index];
  currentClasses.splice(index, 1);
  renderClassesList();
  showNotification(`Removed class: ${className}`, "success");
};

window.removeDepartment = function (index) {
  const deptName = currentDepartments[index];
  currentDepartments.splice(index, 1);
  renderDepartmentsList();
  showNotification(`Removed department: ${deptName}`, "success");
};

async function saveSettings() {
  try {
    const formData = {
      schoolName: document.getElementById("schoolName").value.trim(),
      currentAcademicYear: document.getElementById("academicYear").value.trim(),
      currentTerm: document.getElementById("currentTerm").value,
      dateOfVacation: document.getElementById("dateOfVacation").value, // Store as YYYY-MM-DD
      dateOfResumption: document.getElementById("dateOfResumption").value, // Store as YYYY-MM-DD
      maxAttendance:
        parseInt(document.getElementById("maxAttendance").value) || 0,
      classes: currentClasses,
      classes: currentClasses,
      departments: currentDepartments,
      subjectOrders: {
        prenursery: getOrderFromContainer("container-prenursery"),
        primary: getOrderFromContainer("container-primary"),
        jss: getOrderFromContainer("container-jss"),
        ss: getOrderFromContainer("container-ss"),
      },
    };

    // Validation
    if (!formData.schoolName || !formData.currentAcademicYear) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    if (currentClasses.length === 0) {
      showNotification("Please add at least one class", "error");
      return;
    }

    if (currentDepartments.length === 0) {
      showNotification("Please add at least one department", "error");
      return;
    }

    // Save to backend
    await settingsService.updateSettings(formData);

    showNotification("✅ Settings saved successfully!", "success");

    // Reload settings to confirm
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } catch (error) {
    console.error("Error saving settings:", error);
    showNotification("❌ Failed to save settings. Please try again.", "error");
  }
}

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
const validClassPatterns = {
  prenursery: /^(NURSERY\s*1|KG)/i,
  primary: /^(NURSERY\s*2|PRIMARY|BASIC)/i,
  jss: /^JSS/i,
  ss: /^SS/i,
};

function renderSubjectOrders(savedOrders) {
  renderContainer(
    "container-prenursery",
    filterSubjectsForCategory("prenursery"),
    savedOrders.prenursery || []
  );
  renderContainer(
    "container-primary",
    filterSubjectsForCategory("primary"),
    savedOrders.primary || []
  );
  renderContainer(
    "container-jss",
    filterSubjectsForCategory("jss"),
    savedOrders.jss || []
  );
  renderContainer(
    "container-ss",
    filterSubjectsForCategory("ss"),
    savedOrders.ss || []
  );

  setupDragAndDrop();
}

function filterSubjectsForCategory(category) {
  const pattern = validClassPatterns[category];
  if (!pattern) return [];

  return allSubjects.filter((subject) => {
    // If subject has no classes defined, show it everywhere (fallback)
    // Or maybe we should hide it? Let's keep existing behavior of 'true' but be careful.
    if (!subject.classes || subject.classes.length === 0) return true;

    return subject.classes.some((cls) => pattern.test(cls));
  });
}

function renderContainer(containerId, subjects, savedOrder) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  // Sort subjects: first by savedOrder, then remaining alphabetical
  const orderedSubjects = [];
  const remainingSubjects = [...subjects];

  // First pick out the ones in the saved order
  if (savedOrder && savedOrder.length > 0) {
    savedOrder.forEach((code) => {
      const idx = remainingSubjects.findIndex((s) => s.code === code);
      if (idx !== -1) {
        orderedSubjects.push(remainingSubjects[idx]);
        remainingSubjects.splice(idx, 1);
      }
    });
  }

  // Then add the rest
  remainingSubjects.sort((a, b) => a.name.localeCompare(b.name));
  const finalList = [...orderedSubjects, ...remainingSubjects];

  if (finalList.length === 0) {
    container.innerHTML = `<p class="gray-medium" style="font-size: 12px;">No subjects found for this level.</p>`;
    return;
  }

  finalList.forEach((subject) => {
    const el = document.createElement("div");
    el.className = "sortable-item";
    el.draggable = true;
    el.dataset.code = subject.code;
    el.innerHTML = `
      <span class="material-symbols-outlined" style="color: #999; font-size: 16px;">drag_indicator</span>
      <span class="code">${subject.code}</span>
      <span class="name">${subject.name}</span>
    `;
    container.appendChild(el);
  });
}

function setupDragAndDrop() {
  const items = document.querySelectorAll(".sortable-item");
  const containers = document.querySelectorAll(".sortable-list");

  items.forEach((item) => {
    item.addEventListener("dragstart", () => {
      item.classList.add("dragging");
    });

    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
    });
  });

  containers.forEach((container) => {
    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(container, e.clientY);
      const draggable = document.querySelector(".dragging");
      // Only allow dropping if draggable is from the SAME container (or allowed to move between?
      // For now, let's assume strict ordering within the category,
      // but maybe we shouldn't restrict if they want to move things around?
      // Actually, if we move between containers, we might mess up the filtering.
      // Let's restrict to same container for safety, or just let it be open.
      // The prompt is "finish ordering", so reordering within the list is key.
      // If I drag from Primary to SS, does that make sense? Probably not if the subject isn't 'in' SS.
      // But checking parent might be complex. Let's just allow reordering for now.
      if (!draggable) return;

      if (afterElement == null) {
        container.appendChild(draggable);
      } else {
        container.insertBefore(draggable, afterElement);
      }
    });
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".sortable-item:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

function getOrderFromContainer(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return [];
  const items = container.querySelectorAll(".sortable-item");
  return Array.from(items).map((item) => item.dataset.code);
}
