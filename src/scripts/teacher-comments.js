import { getSettings, getStudentsByClass } from "./storage.js";
import resultMetadataService from "./api/result-metadata.service.js";
import { showLoading, hideLoading, showNotification } from "./utils/ui.js";

const STORAGE_KEYS = {
  classLevel: "tc_class_level",
  term: "tc_term",
  studentId: "tc_student_id",
};

let currentYear = "";
let currentTerm = "firstTerm";
let currentClass = "";
let students = [];
let filteredStudents = [];
let currentStudentId = "";
let isDirty = false;

window.addEventListener("DOMContentLoaded", async () => {
  await bootstrap();
  setupEvents();
});

async function bootstrap() {
  const page = document.getElementById("teacherCommentsPage");
  showLoading(page, "Loading settings...");

  try {
    const settings = await getSettings();
    currentYear = settings.currentAcademicYear || "";

    const savedTerm = localStorage.getItem(STORAGE_KEYS.term);
    currentTerm = savedTerm || settings.currentTerm || "firstTerm";

    const yearInput = document.getElementById("academicYear");
    yearInput.value = currentYear;

    const termSelect = document.getElementById("termSelect");
    termSelect.value = currentTerm;

    const classSelect = document.getElementById("classSelect");
    classSelect.innerHTML = '<option value="">Select Class</option>';
    (settings.classes || []).forEach((className) => {
      const option = document.createElement("option");
      option.value = className;
      option.textContent = className;
      classSelect.appendChild(option);
    });

    const savedClass = localStorage.getItem(STORAGE_KEYS.classLevel);
    if (savedClass && (settings.classes || []).includes(savedClass)) {
      classSelect.value = savedClass;
      currentClass = savedClass;
      await loadStudentsForClass();
    }
  } catch (error) {
    console.error("Failed to load settings:", error);
    showNotification("Failed to load settings", "error");
  } finally {
    hideLoading(page);
  }
}

function setupEvents() {
  document.getElementById("classSelect").addEventListener("change", async (e) => {
    currentClass = e.target.value;
    localStorage.setItem(STORAGE_KEYS.classLevel, currentClass);
    await loadStudentsForClass();
  });

  document.getElementById("termSelect").addEventListener("change", async (e) => {
    currentTerm = e.target.value;
    localStorage.setItem(STORAGE_KEYS.term, currentTerm);
    if (currentStudentId) {
      await loadTeacherComment(currentStudentId);
    }
  });

  document.getElementById("studentSearch").addEventListener("input", (e) => {
    const query = e.target.value.trim().toLowerCase();
    filteredStudents = students.filter((student) => {
      const name = `${student.firstName} ${student.otherNames}`.toLowerCase();
      const studentId = (student.studentId || "").toLowerCase();
      return name.includes(query) || studentId.includes(query);
    });
    renderStudentList();
  });

  document.getElementById("saveCommentBtn").addEventListener("click", async () => {
    await saveTeacherComment();
  });

  document
    .getElementById("prevStudentBtn")
    .addEventListener("click", () => selectRelativeStudent(-1));

  document
    .getElementById("nextStudentBtn")
    .addEventListener("click", () => selectRelativeStudent(1));

  document.getElementById("teacherComment").addEventListener("input", () => {
    setDirty(true);
  });

  document.addEventListener("keydown", async (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      await saveTeacherComment();
    }
  });
}

function setDirty(dirty) {
  isDirty = dirty;
  const state = document.getElementById("saveState");
  if (!state) return;

  state.textContent = dirty ? "Unsaved changes" : "Saved";
  state.classList.toggle("unsaved", dirty);
}

function getSelectedStudentIndex() {
  return students.findIndex((student) => student._id === currentStudentId);
}

function updateNavButtons() {
  const prevBtn = document.getElementById("prevStudentBtn");
  const nextBtn = document.getElementById("nextStudentBtn");
  const index = getSelectedStudentIndex();
  const hasSelection = index !== -1;

  prevBtn.disabled = !hasSelection || index === 0;
  nextBtn.disabled = !hasSelection || index === students.length - 1;
}

function renderStudentList() {
  const list = document.getElementById("studentList");
  const count = document.getElementById("studentCount");
  list.innerHTML = "";

  count.textContent = `${filteredStudents.length} student${
    filteredStudents.length === 1 ? "" : "s"
  }`;

  if (filteredStudents.length === 0) {
    list.innerHTML =
      '<p style="padding:10px;color:#6b7280;font-size:13px;">No students found.</p>';
    return;
  }

  filteredStudents.forEach((student) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = `student-item${
      currentStudentId === student._id ? " active" : ""
    }`;
    item.innerHTML = `
      <div class="student-item-name">${student.firstName} ${student.otherNames}</div>
      <div class="student-item-id">${student.studentId || student._id}</div>
    `;
    item.addEventListener("click", async () => {
      await selectStudent(student._id);
    });
    list.appendChild(item);
  });
}

async function loadStudentsForClass() {
  const commentArea = document.getElementById("teacherComment");
  const emptyHelp = document.getElementById("emptyHelp");
  const info = document.getElementById("studentInfo");

  students = [];
  filteredStudents = [];
  currentStudentId = "";
  commentArea.value = "";
  info.textContent = "Select a class and student to load existing comment.";
  emptyHelp.style.display = "block";
  setDirty(false);
  renderStudentList();
  updateNavButtons();

  if (!currentClass) return;

  const page = document.getElementById("teacherCommentsPage");
  showLoading(page, "Loading students...");

  try {
    students = await getStudentsByClass(currentClass);
    students.sort((a, b) =>
      `${a.firstName} ${a.otherNames}`.localeCompare(`${b.firstName} ${b.otherNames}`)
    );
    filteredStudents = [...students];
    renderStudentList();

    if (students.length === 0) {
      showNotification("No students found in this class", "error");
      return;
    }

    const savedStudentId = localStorage.getItem(STORAGE_KEYS.studentId);
    const studentToSelect = students.some((s) => s._id === savedStudentId)
      ? savedStudentId
      : students[0]._id;
    await selectStudent(studentToSelect, { allowDirtySwitch: true });
  } catch (error) {
    console.error("Failed to load students:", error);
    showNotification("Failed to load students", "error");
  } finally {
    hideLoading(page);
  }
}

async function selectStudent(studentId, options = {}) {
  const { allowDirtySwitch = false } = options;

  if (!studentId) return;
  if (studentId === currentStudentId) return;

  if (isDirty && !allowDirtySwitch) {
    const shouldSave = window.confirm(
      "You have unsaved changes. Save before switching student?"
    );
    if (shouldSave) {
      const saved = await saveTeacherComment({ silent: true });
      if (!saved) return;
    }
  }

  currentStudentId = studentId;
  localStorage.setItem(STORAGE_KEYS.studentId, studentId);
  renderStudentList();
  updateNavButtons();
  await loadTeacherComment(studentId);
}

async function selectRelativeStudent(step) {
  const index = getSelectedStudentIndex();
  if (index === -1) return;

  const target = students[index + step];
  if (!target) return;
  await selectStudent(target._id);
}

async function loadTeacherComment(studentId) {
  const commentArea = document.getElementById("teacherComment");
  const emptyHelp = document.getElementById("emptyHelp");
  const info = document.getElementById("studentInfo");
  const selectedStudent = students.find((s) => s._id === studentId);

  if (!studentId || !selectedStudent) {
    commentArea.value = "";
    emptyHelp.style.display = "block";
    info.textContent = "Select a class and student to load existing comment.";
    setDirty(false);
    return;
  }

  info.textContent = `${selectedStudent.firstName} ${selectedStudent.otherNames} - ${
    currentClass || ""
  } - ${currentTerm}`;

  const page = document.getElementById("teacherCommentsPage");
  showLoading(page, "Loading existing comment...");

  try {
    const metadata = await resultMetadataService.getResultMetadata(
      studentId,
      currentTerm,
      currentYear
    );
    commentArea.value = metadata?.classTeacherComment || "";
    emptyHelp.style.display = "none";
    setDirty(false);
    commentArea.focus();
  } catch (error) {
    console.error("Failed to load comment:", error);
    commentArea.value = "";
    emptyHelp.style.display = "none";
    setDirty(false);
  } finally {
    hideLoading(page);
  }
}

async function saveTeacherComment(options = {}) {
  const { silent = false } = options;
  const commentArea = document.getElementById("teacherComment");
  const comment = commentArea.value.trim();

  if (!currentClass || !currentStudentId) {
    if (!silent) showNotification("Select class and student first", "error");
    return false;
  }

  const page = document.getElementById("teacherCommentsPage");
  showLoading(page, "Saving comment...");

  try {
    await resultMetadataService.saveResultMetadata(
      currentStudentId,
      currentTerm,
      currentYear,
      {
        classTeacherComment: comment,
      }
    );
    setDirty(false);
    if (!silent) showNotification("Teacher comment saved successfully", "success");
    return true;
  } catch (error) {
    console.error("Failed to save comment:", error);
    if (!silent) showNotification("Failed to save comment", "error");
    return false;
  } finally {
    hideLoading(page);
  }
}
