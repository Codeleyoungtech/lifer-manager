import { getSettings, getBroadsheetData } from "./storage.js";
import { showLoading, hideLoading, showNotification } from "./utils/ui.js";

// State
let currentData = null;

window.addEventListener("DOMContentLoaded", async function () {
  await loadYearOptions();
  await loadClassOptions();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById("loadBroadsheet").addEventListener("click", loadData);
  document
    .getElementById("printBtn")
    .addEventListener("click", () => window.print());
}

async function loadYearOptions() {
  try {
    const settings = await getSettings();
    const yearSelect = document.getElementById("academicYear");
    yearSelect.innerHTML = `<option value="${settings.currentAcademicYear}">${settings.currentAcademicYear}</option>`;
  } catch (error) {
    console.error("Error loading year:", error);
  }
}

async function loadClassOptions() {
  try {
    const settings = await getSettings();
    const classSelect = document.getElementById("classLevel");
    classSelect.innerHTML = '<option value="">Select Class</option>';
    settings.classes.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      classSelect.appendChild(opt);
    });
  } catch (error) {
    console.error("Error loading classes:", error);
  }
}

async function loadData() {
  const year = document.getElementById("academicYear").value;
  const classLevel = document.getElementById("classLevel").value;
  const term = document.getElementById("termSelect").value;

  if (!classLevel) {
    showNotification("Please select a class", "error");
    return;
  }

  const container = document.getElementById("sheetContainer");
  showLoading(container, "Generating Broadsheet...");

  try {
    const data = await getBroadsheetData(classLevel, year, term);
    currentData = data;
    renderBroadsheet(data, year, classLevel, term);
  } catch (error) {
    console.error("Broadsheet error:", error);
    container.innerHTML = `<div style="color:red; text-align:center; padding: 20px;">Error loading data: ${error.message}</div>`;
  } finally {
    hideLoading(container);
  }
}

function renderBroadsheet(data, year, classLevel, term) {
  const container = document.getElementById("sheetContainer");
  const { students, subjects, results } = data;

  // Sort students by name
  students.sort((a, b) => a.firstName.localeCompare(b.firstName));

  // Sort subjects (you might want to respect subject settings order here, similar to result-templates.js)
  // For now, alphabetical or ID based
  subjects.sort((a, b) => a.name.localeCompare(b.name));

  const termDisplay =
    term === "firstTerm"
      ? "1ST TERM"
      : term === "secondTerm"
      ? "2ND TERM"
      : "3RD TERM";

  let html = `
    <div class="sheet-header">
      <div class="school-info">
        <div class="logo-box"></div>
        <div class="school-text">
            <h1>LIFER SCHOOL</h1>
            <p>BROADSHEET RESULT SUMMARY</p>
        </div>
      </div>
      <div class="sheet-meta">
        <div>CLASS: ${classLevel}</div>
        <div>TERM: ${termDisplay}</div>
        <div>YEAR: ${year}</div>
      </div>
    </div>
    
    <table class="bs-table">
      <thead>
        <tr>
          <th class="col-sn">S/N</th>
          <th class="col-name">STUDENT NAME</th>
  `;

  // Subject Headers
  subjects.forEach((sub) => {
    html += `<th class="vertical-header"><div>${sub.name}</div></th>`;
  });

  html += `
          <th class="vertical-header"><div>TOTAL</div></th>
          <th class="vertical-header"><div>AVG</div></th>
          <th class="vertical-header"><div>POS</div></th>
        </tr>
      </thead>
      <tbody>
  `;

  // Rows
  students.forEach((student, index) => {
    html += `
      <tr>
        <td>${index + 1}</td>
        <td class="col-name">${student.firstName} ${student.otherNames}</td>
    `;

    // Scores
    let totalScore = 0;
    let subjectCount = 0;

    subjects.forEach((sub) => {
      // Find result for this student & subject
      // result map is likely: results[studentId][subjectCode]
      const studentResults = results[student._id] || {};
      const subResult = studentResults[sub.code];

      const score = subResult ? subResult.total : "-";
      if (typeof score === "number") {
        totalScore += score;
        subjectCount++;
      }

      html += `<td class="score-cell">${score !== "-" ? score : ""}</td>`;
    });

    const avg = subjectCount > 0 ? (totalScore / subjectCount).toFixed(1) : "-";

    // Position - Simplified calculation or fetch if available (usually requires full batch calculation first)
    // For now, let's leave position empty or basic rank if we calculated it

    html += `
        <td style="font-weight:bold">${totalScore}</td>
        <td>${avg}</td>
        <td></td> 
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
    
    <div style="margin-top: 20px; font-size: 12px; color: #666;">
        Generated on ${new Date().toLocaleDateString()}
    </div>
  `;

  container.innerHTML = html;
}
