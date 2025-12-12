import {
  getSettings,
  getStudentsByClass,
  getStudentResults,
} from "./storage.js";
import { generateResultSheet, getResultStyles } from "./result-templates.js";
import resultMetadataService from "./api/result-metadata.service.js";

// State
let currentStudents = [];
let currentYear = "";
let currentTerm = "";
let currentClass = "";
let currentStudent = null; // Track current student for reloading

window.addEventListener("DOMContentLoaded", async function () {
  await loadYearOptions();
  await loadClassOptions();
  setupEventListeners();
  injectStyles();
});

async function loadYearOptions() {
  try {
    const settings = await getSettings();
    const yearSelect = document.getElementById("academicYear");
    yearSelect.innerHTML = `
      <option value="${settings.currentAcademicYear}">${settings.currentAcademicYear}</option>
    `;
    currentYear = settings.currentAcademicYear;
  } catch (error) {
    console.error("Error loading year options:", error);
  }
}

async function loadClassOptions() {
  try {
    const settings = await getSettings();
    const classSelect = document.getElementById("classLevel");
    classSelect.innerHTML = '<option value="">Select Class</option>';
    settings.classes.forEach((className) => {
      const option = document.createElement("option");
      option.value = className;
      option.textContent = className;
      classSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading class options:", error);
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

function showLoading(show, text = "Processing...") {
  const overlay = document.getElementById("loadingOverlay");
  const loadingText = document.getElementById("loadingText");
  if (show) {
    loadingText.textContent = text;
    overlay.style.display = "flex";
  } else {
    overlay.style.display = "none";
  }
}

async function loadStudents() {
  const classLevel = document.getElementById("classLevel").value;
  const term = document.getElementById("termSelect").value;
  const year = document.getElementById("academicYear").value;

  if (!classLevel) {
    alert("Please select a class!");
    return;
  }

  showLoading(true, "Loading Students...");

  try {
    currentClass = classLevel;
    currentTerm = term;
    currentYear = year;

    currentStudents = await getStudentsByClass(classLevel);
    currentStudents.sort((a, b) => a.firstName.localeCompare(b.firstName));

    renderStudentList(currentStudents);

    document.getElementById("studentSearch").disabled =
      currentStudents.length === 0;
    document.getElementById("downloadAllBtn").disabled =
      currentStudents.length === 0;

    if (currentStudents.length === 0) {
      alert("No students found in this class.");
    } else {
      selectStudent(currentStudents[0]);
    }
  } catch (error) {
    console.error("Error loading students:", error);
    alert("Failed to load students.");
  } finally {
    showLoading(false);
  }
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
    const termResults = await getStudentResults(
      student._id,
      currentYear,
      currentTerm
    );

    // Load metadata (conventional performance + comments)
    let metadata = {};
    try {
      console.log("Requesting metadata with:", {
        studentId: student._id,
        term: currentTerm,
        year: currentYear,
      });

      metadata = await resultMetadataService.getResultMetadata(
        student._id,
        currentTerm,
        currentYear
      );

      console.log("Fetched Metadata for Result:", metadata);
      console.log("Metadata type:", typeof metadata);
      console.log("Has intuitiveFeats?:", !!metadata?.intuitiveFeats);

      // If metadata is undefined or doesn't have expected structure, use empty object
      if (!metadata || typeof metadata !== "object") {
        console.warn("Metadata is invalid, using empty object");
        metadata = {};
      }
    } catch (error) {
      console.error("Error fetching metadata:", error);
      console.log("No existing metadata, using defaults", error);
    }

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
    showLoading(true, "Saving changes before printing...");
    await saveMetadataChanges(true); // Pass true to skip alert
    showLoading(false);
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
            src: url(../assets/fonts/ITC-Machine-Medium.otf);
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

  showLoading(true, "Generating Batch PDF...");

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

      document.getElementById("loadingText").textContent = `Processing ${
        i + 1
      }/${currentStudents.length}: ${student.firstName}`;

      const termResults = await getStudentResults(
        student._id,
        currentYear,
        currentTerm
      );

      // Load metadata (conventional performance + comments) for each student
      let metadata = {};
      try {
        metadata = await resultMetadataService.getResultMetadata(
          student._id,
          currentTerm,
          currentYear
        );
      } catch (error) {
        console.log(`No metadata for ${student.firstName}, using defaults`);
      }

      const resultHTML = await generateResultSheet(
        student,
        termResults.subjects || {},
        currentTerm,
        currentYear,
        metadata // Pass metadata for each student
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
              src: url(../assets/fonts/ITC-Machine-Medium.otf);
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
    alert("Failed to generate batch PDF.");
  } finally {
    showLoading(false);
  }
}

// ==================== SAVE METADATA (COMMENTS & CONVENTIONAL PERFORMANCE) ====================

async function saveMetadataChanges(silent = false) {
  // Ensure silent is boolean
  silent = silent === true;
  const container = document.getElementById("resultSheetContainer");
  const studentId = container.dataset.studentId;

  if (!studentId) {
    if (!silent) alert("Please select a student first");
    return;
  }

  try {
    if (!silent) showLoading(true, "Saving changes...");

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

    console.log("Scraped Intuitive Feats:", intuitiveFeats);
    console.log("Scraped Conventional:", conventionalPerformance);

    // Debug scraping
    if (!silent) {
      // Check if specific fields have data
      const punc = intuitiveFeats.punctuality;
      if (punc) {
        console.log("Punctuality found:", punc);
      } else {
        console.log("Punctuality is empty or missing");
      }
    }

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

    if (!silent) {
      showLoading(false);
      alert("✅ Changes saved successfully!");
      // Reload the result to show saved data
      if (currentStudent) {
        await selectStudent(currentStudent);
      }
    }
  } catch (error) {
    console.error("Error saving metadata:", error);
    if (!silent) {
      showLoading(false);
      alert("❌ Failed to save changes. Please try again.");
    }
  }
}
