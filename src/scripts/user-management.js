import { authService } from "./api/auth.service.js";
import { getSettings } from "./storage.js";
import { showLoading, hideLoading, showNotification } from "./utils/ui.js";
import { API_URL } from "../config.js";
import settingsService from "./api/settings.service.js";

let classes = [];
let users = [];
let currentEditUserId = null;

window.addEventListener("DOMContentLoaded", async () => {
  await bootstrap();
  setupEvents();
});

async function bootstrap() {
  const page = document.getElementById("userManagementPage");
  showLoading(page, "Loading user setup...");
  try {
    const [settings, list] = await Promise.all([
      getSettings(),
      authService.getUsers(),
    ]);
    classes = settings.classes || [];
    updateTermLockStatus(settings);
    users = list || [];
    renderClassOptions();
    renderUsers();
  } catch (error) {
    console.error(error);
    showNotification("Failed to load user setup", "error");
  } finally {
    hideLoading(page);
  }
}

function setupEvents() {
  document
    .getElementById("createTeacherBtn")
    .addEventListener("click", createTeacher);
  document
    .getElementById("saveEditUserBtn")
    .addEventListener("click", saveEditedUser);
  document
    .getElementById("cancelEditUserBtn")
    .addEventListener("click", closeEditPanel);

  document.querySelectorAll(".export-btn").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const type = event.currentTarget.dataset.type;
      await exportCsv(type);
    });
  });

  document
    .getElementById("lockCurrentTermBtn")
    .addEventListener("click", async () => {
      await setCurrentTermLock(true);
    });
  document
    .getElementById("unlockCurrentTermBtn")
    .addEventListener("click", async () => {
      await setCurrentTermLock(false);
    });
}

function renderClassOptions() {
  const createContainer = document.getElementById("assignedClasses");
  const editContainer = document.getElementById("editAssignedClasses");

  [createContainer, editContainer].forEach((container, index) => {
    const prefix = index === 0 ? "create" : "edit";
    container.innerHTML = "";
    classes.forEach((className) => {
      const safeId = `${prefix}-class-${className.replace(/\s+/g, "-")}`;
      const wrapper = document.createElement("label");
      wrapper.className = "class-item";
      wrapper.innerHTML = `
        <input type="checkbox" value="${className}" id="${safeId}" />
        <span>${className}</span>
      `;
      container.appendChild(wrapper);
    });
  });
}

function getSelectedClasses() {
  const container = document.getElementById("assignedClasses");
  return Array.from(container.querySelectorAll("input[type='checkbox']:checked"))
    .map((input) => input.value);
}

async function createTeacher() {
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = document.getElementById("password").value;
  const assignedClasses = getSelectedClasses();

  if (!firstName || !lastName || !email || !password) {
    showNotification("Fill first name, last name, email and password", "error");
    return;
  }

  const page = document.getElementById("userManagementPage");
  showLoading(page, "Creating teacher...");
  try {
    await authService.register({
      firstName,
      lastName,
      email,
      password,
      assignedClasses,
    });
    showNotification("Teacher created successfully", "success");
    document.getElementById("firstName").value = "";
    document.getElementById("lastName").value = "";
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
    await refreshUsers();
  } catch (error) {
    console.error(error);
    showNotification(error.message || "Failed to create teacher", "error");
  } finally {
    hideLoading(page);
  }
}

function renderUsers() {
  const tbody = document.getElementById("usersTableBody");
  tbody.innerHTML = "";

  users.forEach((user) => {
    const tr = document.createElement("tr");
    const userClasses = (user.assignedClasses || []).join(", ");
    const isActive = user.isActive !== false;

    tr.innerHTML = `
      <td>${user.firstName || ""} ${user.lastName || ""}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td>
        <span class="badge ${isActive ? "badge-active" : "badge-inactive"}">
          ${isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td>${userClasses || "-"}</td>
      <td>
        <button class="btn btn-secondary btn-edit" data-id="${user._id}">
          Edit
        </button>
        <button class="btn btn-secondary btn-toggle" data-id="${user._id}" data-next-active="${
      isActive ? "false" : "true"
    }">${isActive ? "Deactivate" : "Activate"}</button>
        <button class="btn btn-secondary btn-logout" data-id="${
          user._id
        }">Force Logout</button>
        <button class="btn btn-secondary btn-delete" data-id="${user._id}">
          Delete
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll(".btn-edit").forEach((button) => {
    button.addEventListener("click", (event) => {
      const id = event.currentTarget.dataset.id;
      openEditPanel(id);
    });
  });

  tbody.querySelectorAll(".btn-toggle").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const id = event.currentTarget.dataset.id;
      const nextActive = event.currentTarget.dataset.nextActive === "true";
      await updateAccess(id, { isActive: nextActive });
    });
  });

  tbody.querySelectorAll(".btn-logout").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const id = event.currentTarget.dataset.id;
      await updateAccess(id, { forceLogoutNow: true });
    });
  });

  tbody.querySelectorAll(".btn-delete").forEach((button) => {
    button.addEventListener("click", async (event) => {
      const id = event.currentTarget.dataset.id;
      const targetUser = users.find((item) => item._id === id);
      if (!targetUser) return;
      if (targetUser.role === "admin") {
        showNotification("Admin users cannot be deleted", "error");
        return;
      }
      if (!window.confirm(`Delete user ${targetUser.email}? This cannot be undone.`)) {
        return;
      }
      await deleteUser(id);
    });
  });
}

async function updateAccess(id, payload) {
  const page = document.getElementById("userManagementPage");
  showLoading(page, "Updating user...");
  try {
    await authService.updateUserAccess(id, payload);
    showNotification("User updated", "success");
    await refreshUsers();
  } catch (error) {
    console.error(error);
    showNotification(error.message || "Failed to update user", "error");
  } finally {
    hideLoading(page);
  }
}

async function refreshUsers() {
  users = await authService.getUsers();
  renderUsers();
  if (currentEditUserId) {
    const stillExists = users.find((item) => item._id === currentEditUserId);
    if (!stillExists) closeEditPanel();
  }
}

function openEditPanel(id) {
  const user = users.find((item) => item._id === id);
  if (!user) return;
  currentEditUserId = id;

  document.getElementById("editFirstName").value = user.firstName || "";
  document.getElementById("editLastName").value = user.lastName || "";
  document.getElementById("editEmail").value = user.email || "";
  document.getElementById("editPassword").value = "";
  document.getElementById("editStatus").value =
    user.isActive === false ? "inactive" : "active";

  const classSet = new Set(user.assignedClasses || []);
  const classContainer = document.getElementById("editAssignedClasses");
  Array.from(classContainer.querySelectorAll("input[type='checkbox']")).forEach(
    (input) => {
      input.checked = classSet.has(input.value);
    }
  );
  Array.from(
    document
      .getElementById("assignedClasses")
      .querySelectorAll("input[type='checkbox']")
  ).forEach((input) => {
    input.checked = false;
  });

  document.getElementById("editUserPanel").classList.remove("hidden");
}

function closeEditPanel() {
  currentEditUserId = null;
  document.getElementById("editUserPanel").classList.add("hidden");
}

function getSelectedEditClasses() {
  const container = document.getElementById("editAssignedClasses");
  return Array.from(container.querySelectorAll("input[type='checkbox']:checked"))
    .map((input) => input.value);
}

async function saveEditedUser() {
  if (!currentEditUserId) return;

  const firstName = document.getElementById("editFirstName").value.trim();
  const lastName = document.getElementById("editLastName").value.trim();
  const email = document.getElementById("editEmail").value.trim().toLowerCase();
  const password = document.getElementById("editPassword").value.trim();
  const status = document.getElementById("editStatus").value;
  const assignedClasses = getSelectedEditClasses();

  if (!firstName || !lastName || !email) {
    showNotification("First name, last name and email are required", "error");
    return;
  }

  const payload = {
    firstName,
    lastName,
    email,
    isActive: status === "active",
    assignedClasses,
  };
  if (password) payload.password = password;

  await updateAccess(currentEditUserId, payload);
  closeEditPanel();
}

async function deleteUser(id) {
  const page = document.getElementById("userManagementPage");
  showLoading(page, "Deleting user...");
  try {
    await authService.deleteUser(id);
    showNotification("User deleted", "success");
    await refreshUsers();
  } catch (error) {
    console.error(error);
    showNotification(error.message || "Failed to delete user", "error");
  } finally {
    hideLoading(page);
  }
}

function updateTermLockStatus(currentSettings) {
  const statusEl = document.getElementById("termLockStatus");
  const currentYear = currentSettings.currentAcademicYear;
  const currentTerm = currentSettings.currentTerm;
  const key = `${currentYear}:${currentTerm}`;
  const locked = (currentSettings.lockedTerms || []).includes(key);
  statusEl.textContent = `${currentYear} ${currentTerm} is currently ${
    locked ? "LOCKED" : "UNLOCKED"
  } for teachers.`;
}

async function setCurrentTermLock(shouldLock) {
  const page = document.getElementById("userManagementPage");
  showLoading(page, shouldLock ? "Locking term..." : "Unlocking term...");
  try {
    const latest = await getSettings();
    const key = `${latest.currentAcademicYear}:${latest.currentTerm}`;
    const lockedTerms = new Set(latest.lockedTerms || []);
    if (shouldLock) {
      lockedTerms.add(key);
    } else {
      lockedTerms.delete(key);
    }

    const updated = await settingsService.updateSettings({
      lockedTerms: Array.from(lockedTerms),
    });
    updateTermLockStatus(updated);
    showNotification(
      shouldLock
        ? "Current term locked for teachers"
        : "Current term unlocked",
      "success"
    );
  } catch (error) {
    console.error(error);
    showNotification("Failed to update term lock", "error");
  } finally {
    hideLoading(page);
  }
}

async function exportCsv(type) {
  const token = localStorage.getItem("token");
  if (!token) {
    showNotification("Please login again", "error");
    return;
  }

  const page = document.getElementById("userManagementPage");
  showLoading(page, "Downloading export...");
  try {
    const response = await fetch(`${API_URL}/core/export/${type}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Export failed");
    }

    const blob = await response.blob();
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${type}-export.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showNotification("Export downloaded", "success");
  } catch (error) {
    console.error(error);
    showNotification(error.message || "Export failed", "error");
  } finally {
    hideLoading(page);
  }
}
