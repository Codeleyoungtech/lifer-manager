import {
  getSettings,
  getStudentsByClass,
} from "./storage.js";
import {
  generateResultSheet,
  getResultStyles,
  primeResultTemplateCache,
} from "./result-templates.js";
import resultMetadataService from "./api/result-metadata.service.js";
import { showLoading, hideLoading, showNotification } from "./utils/ui.js";
import itcFontUrl from "../assets/fonts/ITC-Machine-Medium.otf";
import { resultService } from "./api/result.service.js";
import attendanceService from "./api/attendance.service.js";

// State
let currentStudents = [];
let currentYear = "";
let currentTerm = "";
let currentClass = "";
let currentStudent = null; // Track current student for reloading
const studentResultsCache = new Map();
const metadataCache = new Map();

const buildCacheKey = (studentId, year, term) => `${studentId}:${year}:${term}`;

window.addEventListener("DOMContentLoaded", async function () {
  await loadInitialFilters();
  setupEventListeners();
  injectStyles();
});

async function loadInitialFilters() {
  try {
    const settings = await getSettings();
    const yearSelect = document.getElementById("academicYear");
    const termSelect = document.getElementById("termSelect");
    const classSelect = document.getElementById("classLevel");

    yearSelect.innerHTML = `
      <option value="${settings.currentAcademicYear}">${settings.currentAcademicYear}</option>
    `;
    currentYear = settings.currentAcademicYear;
    termSelect.value = settings.currentTerm || "firstTerm";
    currentTerm = termSelect.value;

    classSelect.innerHTML = '<option value="">Select Class</option>';
    settings.classes.forEach((className) => {
      const option = document.createElement("option");
      option.value = className;
      option.textContent = className;
      classSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading initial filters:", error);
  }
}

function injectStyles() {
  const styleElement = document.createElement("style");
  styleElement.textContent = getResultStyles();
  document.head.appendChild(styleElement);
}

function setupEventListeners() {
  document
    .getElementById("loadResults")
    .addEventListener("click", loadStudents);

  document.getElementById("studentSearch").addEventListener("input", (e) => {
    filterStudents(e.target.value);
  });

  document
    .getElementById("printCurrentBtn")
    .addEventListener("click", printCurrentResult);
  document
    .getElementById("downloadAllBtn")
    .addEventListener("click", downloadAllPDF);

  // Add save changes button listener
  document
    .getElementById("saveChangesBtn")
    .addEventListener("click", () => saveMetadataChanges(false));
}

// Local showLoading removed in favor of UI utils

async function loadStudents() {
  const classLevel = document.getElementById("classLevel").value;
  const term = document.getElementById("termSelect").value;
  const year = document.getElementById("academicYear").value;

  if (!classLevel) {
    showNotification("Please select a class!", "error");
    return;
  }

  showLoading(document.body, "Loading students and caching class data...");

  try {
    currentClass = classLevel;
    currentTerm = term;
    currentYear = year;
    studentResultsCache.clear();
    metadataCache.clear();

    const settings = await getSettings();
    currentStudents = await getStudentsByClass(classLevel);
    currentStudents.sort((a, b) => a.firstName.localeCompare(b.firstName));

    await preloadClassData(classLevel, year, term, currentStudents, settings);

    renderStudentList(currentStudents);

    document.getElementById("studentSearch").disabled =
      currentStudents.length === 0;
    document.getElementById("downloadAllBtn").disabled =
      currentStudents.length === 0;

    if (currentStudents.length === 0) {
      showNotification("No students found in this class.", "info");
    } else {
      selectStudent(currentStudents[0]);
    }
  } catch (error) {
    console.error("Error loading students:", error);
    showNotification("Failed to load students.", "error");
  } finally {
    hideLoading(document.body);
  }
}

async function preloadClassData(classLevel, year, term, students, settings) {
  // Preload all results for class in one request
  const [allResultsForTerm, allMetadata, attendanceRecords, allResultsForYear] =
    await Promise.all([
      resultService.getResults({
        classLevel,
        academicYear: year,
        term,
      }),
      resultMetadataService.getMetadataByClass(classLevel, term, year),
      attendanceService.getAttendance(classLevel, term, year),
      resultService.getResults({
        classLevel,
        academicYear: year,
      }),
    ]);

  const groupedResults = new Map();
  students.forEach((student) => {
    groupedResults.set(student._id, { subjects: {} });
  });

  allResultsForTerm.forEach((record) => {
    const sid = record.studentId?._id || record.studentId;
    if (!sid) return;
    if (!groupedResults.has(sid)) {
      groupedResults.set(sid, { subjects: {} });
    }
    groupedResults.get(sid).subjects[record.subjectCode] = record;
  });

  students.forEach((student) => {
    const cacheKey = buildCacheKey(student._id, year, term);
    studentResultsCache.set(cacheKey, groupedResults.get(student._id) || { subjects: {} });
  });

  // Preload all metadata for class in one request
  const metadataMap = new Map();
  (allMetadata || []).forEach((item) => {
    const sid = item.studentId?._id || item.studentId;
    if (sid) metadataMap.set(sid, item);
  });

  students.forEach((student) => {
    const cacheKey = buildCacheKey(student._id, year, term);
    metadataCache.set(cacheKey, metadataMap.get(student._id) || {});
  });

  const attendanceByStudentTerm = new Map();
  (attendanceRecords || []).forEach((record) => {
    const sid = record.studentId?._id || record.studentId;
    if (!sid) return;
    const key = `${sid}:${year}:${term}`;
    attendanceByStudentTerm.set(key, record);
  });

  const cumulativeMap = new Map();
  const rollup = new Map();
  (allResultsForYear || []).forEach((record) => {
    const sid = record.studentId?._id || record.studentId;
    if (!sid) return;
    const termKey = record.term;
    const k = `${sid}:${termKey}`;
    if (!rollup.has(k)) {
      rollup.set(k, { total: 0, count: 0 });
    }
    const current = rollup.get(k);
    current.total += record.total || 0;
    current.count += 1;
  });

  students.forEach((student) => {
    const base = {
      firstTerm: null,
      secondTerm: null,
      thirdTerm: null,
    };
    ["firstTerm", "secondTerm", "thirdTerm"].forEach((t) => {
      const entry = rollup.get(`${student._id}:${t}`);
      if (entry && entry.count > 0) {
        base[t] = ((entry.total / (entry.count * 100)) * 100).toFixed(2);
      }
    });
    cumulativeMap.set(`${student._id}:${year}`, base);
  });

  primeResultTemplateCache({
    settings,
    attendanceByStudentTerm,
    cumulativeScores: cumulativeMap,
  });
}

function renderStudentList(students) {
  const listContainer = document.getElementById("studentList");
  listContainer.innerHTML = "";

  if (students.length === 0) {
    listContainer.innerHTML = `
      <li style="padding: 20px; text-align: center; color: #999;">
        No students found.
      </li>
    `;
    return;
  }

  students.forEach((student) => {
    const li = document.createElement("li");
    li.className = "student-item";
    li.dataset.id = student._id;
    li.onclick = () => selectStudent(student);

    const initials = (
      student.firstName[0] + (student.otherNames[0] || "")
    ).toUpperCase();

    li.innerHTML = `
      <div class="student-avatar">${initials}</div>
      <div class="student-info">
        <div class="student-name">${student.firstName} ${
      student.otherNames
    }</div>
        <div class="student-id">${student.studentId || student._id}</div>
      </div>
    `;

    listContainer.appendChild(li);
  });
}

function filterStudents(query) {
  const lowerQuery = query.toLowerCase();
  const filtered = currentStudents.filter(
    (s) =>
      s.firstName.toLowerCase().includes(lowerQuery) ||
      s.otherNames.toLowerCase().includes(lowerQuery) ||
      (s.studentId && s.studentId.toLowerCase().includes(lowerQuery))
  );
  renderStudentList(filtered);
}

async function selectStudent(student) {
  currentStudent = student; // Store for reloading after save
  document
    .querySelectorAll(".student-item")
    .forEach((el) => el.classList.remove("active"));
  const activeItem = document.querySelector(
    `.student-item[data-id="${student._id}"]`
  );
  if (activeItem) activeItem.classList.add("active");

  const container = document.getElementById("resultSheetContainer");

  container.innerHTML = `
    <div style="text-align: center; padding: 60px; color: #666;">
      <div class="spinner" style="margin: 0 auto 20px;"></div>
      <p>Generating Result for ${student.firstName}...</p>
    </div>
  `;
  document.getElementById("printCurrentBtn").disabled = true;

  try {
    const cacheKey = buildCacheKey(student._id, currentYear, currentTerm);
    let termResults = studentResultsCache.get(cacheKey);
    if (!termResults) termResults = { subjects: {} };

    // Load metadata (conventional performance + comments)
    let metadata = metadataCache.get(cacheKey);
    if (!metadata) metadata = {};

    const resultHTML = await generateResultSheet(
      student,
      termResults.subjects || {},
      currentTerm,
      currentYear,
      metadata // Pass metadata to all templates
    );

    container.innerHTML = resultHTML;

    // Store current student ID for saving later
    container.dataset.studentId = student._id;

    document.getElementById("printCurrentBtn").disabled = false;
    document.getElementById("saveChangesBtn").disabled = false;
    document.getElementById(
      "previewTitle"
    ).textContent = `Result: ${student.firstName} ${student.otherNames}`;
  } catch (error) {
    console.error("Error generating result sheet:", error);
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: red;">
        <span class="material-symbols-outlined" style="font-size: 48px;">error</span>
        <p>Error loading result.</p>
      </div>
    `;
  }
}

// ==================== PDF GENERATION ====================

async function printCurrentResult() {
  const element = document.querySelector(".resu");
  if (!element) return;

  try {
    // Auto-save any changes before printing
    showLoading(document.body, "Saving changes before printing...");
    await saveMetadataChanges(true); // Pass true to skip notification
    hideLoading(document.body);
  } catch (error) {
    console.error("Error saving before print:", error);
  }

  // Wait for fonts to load
  try {
    await document.fonts.ready;
    await new Promise((resolve) => setTimeout(resolve, 300));
  } catch (e) {
    console.warn("Font loading check failed:", e);
  }

  const cssStyles = getResultStyles();

  const wrapper = document.createElement("div");
  const styleTag = document.createElement("style");
  styleTag.textContent = cssStyles;

  const contentClone = element.cloneNode(true);
  wrapper.appendChild(styleTag);
  wrapper.appendChild(contentClone);

  const pageWidth = 892.88 / 96;
  const pageHeight = 1263 / 96;

  const opt = {
    margin: 0,
    filename: `Result_${
      document.getElementById("previewTitle").textContent
    }.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: 892.88,
      height: 1263,
      letterRendering: true,
      scrollY: 0,
      scrollX: 0,
      backgroundColor: "#edf6f1",
      onclone: function (clonedDoc) {
        const style = clonedDoc.createElement("style");
        style.textContent = `
          @font-face {
            font-family: "ITC";
            src: url(${itcFontUrl});
          }
        `;
        clonedDoc.head.appendChild(style);
      },
    },
    jsPDF: {
      unit: "in",
      format: [pageWidth, pageHeight],
      orientation: "portrait",
      compress: true,
    },
    pagebreak: { mode: "avoid-all" },
  };

  html2pdf().set(opt).from(wrapper).save();
}

async function downloadAllPDF() {
  if (currentStudents.length === 0) return;

  if (
    !confirm(
      `Generate PDF for all ${currentStudents.length} students? This may take a moment.`
    )
  )
    return;

  showLoading(document.body, "Generating Batch PDF...");

  try {
    // Wait for fonts to load
    await document.fonts.ready;
    await new Promise((resolve) => setTimeout(resolve, 300));

    const cssStyles = getResultStyles();
    const batchContainer = document.createElement("div");

    const styleTag = document.createElement("style");
    styleTag.textContent = cssStyles;
    batchContainer.appendChild(styleTag);

    for (let i = 0; i < currentStudents.length; i++) {
      const student = currentStudents[i];

      showLoading(
        document.body,
        `Processing ${i + 1}/${currentStudents.length}: ${student.firstName}`
      );

      const cacheKey = buildCacheKey(student._id, currentYear, currentTerm);
      const termResults = studentResultsCache.get(cacheKey) || { subjects: {} };

      // Load metadata
      const metadata = metadataCache.get(cacheKey) || {};

      const resultHTML = await generateResultSheet(
        student,
        termResults?.subjects || {},
        currentTerm,
        currentYear,
        metadata
      );

      const wrapper = document.createElement("div");
      wrapper.innerHTML = resultHTML;

      batchContainer.appendChild(wrapper);
    }

    const pageWidth = 892.88 / 96;
    const pageHeight = 1263 / 96;

    const opt = {
      margin: 0,
      filename: `${currentClass}_${currentTerm}_All_Results.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        letterRendering: true,
        scrollY: 0,
        scrollX: 0,
        backgroundColor: "#edf6f1",
        onclone: function (clonedDoc) {
          const style = clonedDoc.createElement("style");
          style.textContent = `
            @font-face {
              font-family: "ITC";
              src: url(${itcFontUrl});
            }
          `;
          clonedDoc.head.appendChild(style);
        },
      },
      jsPDF: {
        unit: "in",
        format: [pageWidth, pageHeight],
        orientation: "portrait",
        compress: true,
      },
      pagebreak: { mode: "css", after: ".resu" },
    };

    await html2pdf().set(opt).from(batchContainer).save();
  } catch (error) {
    console.error("Error generating batch PDF:", error);
    showNotification("Failed to generate batch PDF.", "error");
  } finally {
    hideLoading(document.body);
  }
}

// ==================== SAVE METADATA (COMMENTS & CONVENTIONAL PERFORMANCE) ====================

async function saveMetadataChanges(silent = false) {
  // Ensure silent is boolean
  silent = silent === true;
  const container = document.getElementById("resultSheetContainer");
  const studentId = container.dataset.studentId;

  if (!studentId) {
    if (!silent) showNotification("Please select a student first", "error");
    return;
  }

  try {
    if (!silent) showLoading(document.body, "Saving changes...");

    // Collect conventional performance data (Pre-nursery only)
    const conventionalPerformance = {
      fair: {},
      good: {},
      veryGood: {},
      excellent: {},
    };

    // Get all conventional performance contenteditable cells
    const convCells = container.querySelectorAll(
      ".convenperform td[contenteditable='true']"
    );
    convCells.forEach((cell) => {
      const rating = cell.dataset.rating; // fair, good, veryGood, excellent
      const field = cell.dataset.field; // letterRecognition, countingNumbers, speakingFluency
      if (rating && field) {
        conventionalPerformance[rating][field] = cell.textContent.trim();
      }
    });

    // Collect comments
    const classTeacherComment =
      container.querySelector(".class-teacher-comment")?.textContent.trim() ||
      "Keep up the good work!";
    const principalComment =
      container
        .querySelector(".school-principal-comment")
        ?.textContent.trim() || "Excellent performance.";

    // Collect intuitive feats (Secondary)
    const intuitiveFeats = {};
    const featCells = container.querySelectorAll(
      ".feat-score[contenteditable='true']"
    );
    featCells.forEach((cell) => {
      const field = cell.dataset.field;
      if (field) {
        intuitiveFeats[field] = cell.textContent.trim();
      }
    });

    // Save to backend
    await resultMetadataService.saveResultMetadata(
      studentId,
      currentTerm,
      currentYear,
      {
        conventionalPerformance,
        classTeacherComment,
        principalComment,
        intuitiveFeats,
      }
    );
    const cacheKey = buildCacheKey(studentId, currentYear, currentTerm);
    const currentMeta = metadataCache.get(cacheKey) || {};
    metadataCache.set(cacheKey, {
      ...currentMeta,
      classTeacherComment,
      principalComment,
      conventionalPerformance,
      intuitiveFeats,
    });

    if (!silent) {
      hideLoading(document.body);
      showNotification("✅ Changes saved successfully!", "success");
    }
  } catch (error) {
    console.error("Error saving metadata:", error);
    if (!silent) {
      hideLoading(document.body);
      showNotification("❌ Failed to save changes. Please try again.", "error");
    }
  }
}
