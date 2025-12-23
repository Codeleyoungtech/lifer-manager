import {
  getSettings,
  getBroadsheetData,
  getStudentResults,
} from "./storage.js";
import { showLoading, hideLoading, showNotification } from "./utils/ui.js";
import { generateResultSheet, getResultStyles } from "./result-templates.js";
import resultMetadataService from "./api/result-metadata.service.js";

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
    .addEventListener("click", printBroadsheet);

  const downloadBtn = document.getElementById("downloadAllBtn");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", downloadAllResults);
  }
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
    await renderBroadsheet(data, year, classLevel, term);
  } catch (error) {
    console.error("Broadsheet error:", error);
    container.innerHTML = `<div style="color:red; text-align:center; padding: 20px;">Error loading data: ${error.message}</div>`;
  } finally {
    hideLoading(container);
  }
}

// ==================== HEADER GENERATION ====================

async function generateSchoolNameImage() {
  try {
    await document.fonts.load("900 120px ITC");
    await document.fonts.ready;
  } catch (e) {
    console.warn("Font loading issue:", e);
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 1200; // High res width
  canvas.height = 80; // Reduced for compactness

  const gradient = ctx.createLinearGradient(0, 0, 0, 80);
  gradient.addColorStop(0, "#7ab85c");
  gradient.addColorStop(0.5, "#4a7c3a");
  gradient.addColorStop(1, "#2d5a28");

  ctx.font = "900 70px ITC, Arial Black, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.fillStyle = gradient;

  const text = "MUCH MORE LIFE COLLEGE";
  const x = canvas.width / 2;
  const y = canvas.height / 2;

  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);

  return canvas.toDataURL("image/png");
}

async function generatePreciousFruitSchoolNameImage() {
  try {
    await document.fonts.load("900 120px ITC");
    await document.fonts.ready;
  } catch (e) {
    console.warn("Font loading issue:", e);
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 1600;
  canvas.height = 90; // More compact

  const gradient = ctx.createLinearGradient(0, 0, 0, 90);
  gradient.addColorStop(0, "#7ab85c");
  gradient.addColorStop(0.5, "#4a7c3a");
  gradient.addColorStop(1, "#2d5a28");

  ctx.font = "900 75px ITC, Arial Black, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.strokeStyle = "white";
  ctx.lineWidth = 3;
  ctx.fillStyle = gradient;

  const text = "PRECIOUS FRUIT BEGINNERS' SCHOOL";
  const x = canvas.width / 2;
  const y = canvas.height / 2;

  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);

  return canvas.toDataURL("image/png");
}

async function getHeaderHTML(classLevel) {
  const isSecondary =
    classLevel.startsWith("JSS") || classLevel.startsWith("SS");

  if (isSecondary) {
    const schoolNameImg = await generateSchoolNameImage();
    const title = classLevel.startsWith("JSS")
      ? "JUNIOR SCHOOL BROADSHEET"
      : "SENIOR SCHOOL BROADSHEET";
    return `
      <div class="header-title" style="display:flex; flex-direction:column; align-items:center; text-align:center; margin-bottom: 3px;">
        <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:3px;">
             <div class="logo" style="width:60px; height:60px; background-image: url('../assets/mmlclogo.jpg'); background-size:contain; background-repeat:no-repeat;"></div>
             <img src="${schoolNameImg}" alt="MUCH MORE LIFE COLLEGE" style="height: 55px; width: auto;" />
        </div>
        <div class="header-details" style="text-align:center; font-weight:bold; font-size:10px; font-family: Arial, sans-serif; line-height: 1.3;">
          <div class="address" style="background:#006336; color:white; padding:2px 8px; border-radius:3px; display:inline-block; margin-bottom:2px;">
            <span style="color:yellow; font-weight:bold;">ADD:</span> Plot 17, Road D, OTUNLA LAYOUT, OKE JUNCTION, APETE, IBADAN.
          </div>
          <div class="motto" style="font-size:10px; margin:2px 0;">
            <span style="color:#b70d18; font-weight:bold;">Motto:</span> Knowledge and Discipline builds a destiny.
          </div>
          <div class="contact" style="font-size:9px; margin:1px 0;">
            <span style="color:#b70d18; font-weight:bold;">Tel:</span> 08072734402, 08055447625
            <span style="color:#b70d18; margin-left:8px; font-weight:bold;">E-mail:</span> muchmorelifecollegeibadan13@gmail.com
          </div>
          <div class="result-class" style="background:#b70d18; color:white; padding:3px 12px; border-radius:4px; margin-top:3px; display:inline-block; font-size:12px; font-weight:bold;">
            ${title}
          </div>
        </div>
      </div>
    `;
  } else {
    const schoolNameImg = await generatePreciousFruitSchoolNameImage();
    return `
      <div class="header-title" style="display:flex; flex-direction:column; align-items:center; text-align:center; margin-bottom: 3px;">
        <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:3px;">
             <div class="logo" style="width:60px; height:60px; background-image: url('../assets/pfbslogo.jpg'); background-size:contain; background-repeat:no-repeat;"></div>
             <img src="${schoolNameImg}" alt="PRECIOUS FRUIT BEGINNERS SCHOOL" style="height: 55px; width: auto;" />
        </div>
        <div class="header-details" style="text-align:center; font-weight:bold; font-size:10px; font-family: Arial, sans-serif; line-height: 1.3;">
          <div class="address" style="background:#006336; color:white; padding:2px 8px; border-radius:3px; display:inline-block; margin-bottom:2px;">
            <span style="color:yellow; font-weight:bold;">ADD:</span> Plot 12, Road D, OTUNLA LAYOUT, OKE JUNCTION, APETE, IBADAN.
          </div>
          <div class="motto" style="font-size:10px; margin:2px 0;">
            <span style="color:#b70d18; font-weight:bold;">Motto:</span> Ever Increasing in Knowledge
          </div>
          <div class="contact" style="font-size:9px; margin:1px 0;">
            <span style="color:#b70d18; font-weight:bold;">Tel:</span> 08072734402, 08055447625
            <span style="color:#b70d18; margin-left:8px; font-weight:bold;">E-mail:</span> preciousfruitbeginnersschool08@gmail.com
          </div>
          <div class="result-class" style="background:#b70d18; color:white; padding:3px 12px; border-radius:4px; margin-top:3px; display:inline-block; font-size:12px; font-weight:bold;">
            PRIMARY/NURSERY BROADSHEET
          </div>
        </div>
      </div>
    `;
  }
}

// ==================== RENDERING ====================

async function renderBroadsheet(data, year, classLevel, term) {
  const container = document.getElementById("sheetContainer");
  const { students, subjects, results } = data;

  // Helper to compute stats and positions
  const studentsWithStats = students.map((student) => {
    let totalScore = 0;
    let subjectCount = 0;
    subjects.forEach((sub) => {
      const studentResults = results[student._id] || {};
      const subResult = studentResults[sub.code];
      if (subResult && typeof subResult.total === "number") {
        totalScore += subResult.total;
        subjectCount++;
      }
    });
    const avg = subjectCount > 0 ? totalScore / subjectCount : 0;
    return { ...student, totalScore, avg, subjectCount };
  });

  // Calculate Positions
  // Sort by total score descending
  const sortedByScore = [...studentsWithStats].sort(
    (a, b) => b.totalScore - a.totalScore
  );

  // Assign ranks
  let currentRank = 1;
  for (let i = 0; i < sortedByScore.length; i++) {
    if (
      i > 0 &&
      sortedByScore[i].totalScore < sortedByScore[i - 1].totalScore
    ) {
      currentRank = i + 1;
    }
    sortedByScore[i].position =
      currentRank +
      (currentRank === 1
        ? "st"
        : currentRank === 2
        ? "nd"
        : currentRank === 3
        ? "rd"
        : "th");
  }

  // Restore name sorting for display or keep score sorting?
  // Usually broadsheets are alphabetical. Let's stick to alphabetical but show position.
  studentsWithStats.sort((a, b) => a.firstName.localeCompare(b.firstName));

  // Determine school type for watermark
  const isSecondary =
    classLevel.startsWith("JSS") || classLevel.startsWith("SS");

  // Sort Subjects by Settings Order
  const settings = await getSettings();
  const category = getCategory(classLevel);
  const subjectOrder = settings.subjectOrders
    ? settings.subjectOrders[category] || []
    : [];

  if (subjectOrder.length > 0) {
    subjects.sort((a, b) => {
      const idxA = subjectOrder.indexOf(a.code);
      const idxB = subjectOrder.indexOf(b.code);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  const termDisplay =
    term === "firstTerm"
      ? "1ST TERM"
      : term === "secondTerm"
      ? "2ND TERM"
      : "3RD TERM";

  const headerHTML = await getHeaderHTML(classLevel);

  let html = `
    <div class="broadsheet-print-container" style="background:white;">
        <!-- Watermark -->
        <div class="broadsheet-watermark" style="background-image: url('../assets/${
          isSecondary ? "mmlclogo.jpg" : "pfbslogo.jpg"
        }');"></div>

        ${headerHTML}
        
        <div class="sheet-meta" style="margin: 3px 0 5px 0; display: flex; justify-content:center; gap: 30px; font-weight: bold; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 0; font-size:10px; text-transform:uppercase;">
            <div>CLASS: ${classLevel}</div>
            <div>TERM: ${termDisplay}</div>
            <div>YEAR: ${year}</div>
        </div>

        <table class="bs-table" style="width:100%; border-collapse:collapse; font-size:9px;">
          <thead>
            <tr>
              <th class="col-sn">S/N</th>
              <th class="col-name" style="text-align:left;">STUDENT NAME</th>
  `;

  subjects.forEach((sub) => {
    html += `<th class="vertical-header"><div>${sub.name}</div></th>`;
  });

  html += `
          <th class="vertical-header"><div>TOTAL</div></th>
          <th class="vertical-header"><div>PERCENTAGE</div></th>
          <th class="vertical-header"><div>POSITION IN CLASS</div></th>
        </tr>
      </thead>
      <tbody>
  `;

  studentsWithStats.forEach((student, index) => {
    html += `
      <tr>
        <td style="text-align:center;">${index + 1}</td>
        <td class="col-name" style="text-align:left; font-weight:bold; white-space:nowrap;">${
          student.firstName
        } ${student.otherNames}</td>
    `;

    subjects.forEach((sub) => {
      const studentResults = results[student._id] || {};
      const subResult = studentResults[sub.code];
      const score = subResult ? subResult.total : "-";
      html += `<td class="score-cell">${score !== "-" ? score : ""}</td>`;
    });

    const avg = student.subjectCount > 0 ? student.avg.toFixed(1) : "-";

    html += `
        <td style="font-weight:bold">${student.totalScore}</td>
        <td style="font-weight:bold">${avg}</td>
        <td style="font-weight:bold">${student.position}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
    
    <div style="margin-top: 20px; font-size: 10px; color: #666; text-align: center;">
        Generated on ${new Date().toLocaleDateString()}
    </div>
    </div>
  `;

  container.innerHTML = html;
}

function getCategory(classLevel) {
  if (/^(NURSERY\s*1|KG)/i.test(classLevel)) return "prenursery";
  if (/^(NURSERY\s*2|PRIMARY|BASIC)/i.test(classLevel)) return "primary";
  if (/^JSS/i.test(classLevel)) return "jss";
  if (/^SS/i.test(classLevel)) return "ss";
  return "primary";
}

// ==================== PRINTING ====================

async function printBroadsheet() {
  const element = document.querySelector(".broadsheet-print-container");
  if (!element) return;

  showLoading(document.body, "Generating PDF...");

  try {
    // Wait for fonts to load
    try {
      await document.fonts.ready;
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (e) {
      console.warn("Font loading wait failed", e);
    }

    // 1. Create a detached wrapper for clean generation
    // This isolates styling from the main page
    const wrapper = document.createElement("div");

    // 2. Clone the content
    const contentClone = element.cloneNode(true);

    // 3. Force styles on the clone to ensure perfect A4 landscape fit (1120px)
    contentClone.style.width = "1120px";
    contentClone.style.maxWidth = "1120px";
    contentClone.style.margin = "0";
    contentClone.style.padding = "0";
    contentClone.style.background = "white";

    // 4. Inject styles explicitly
    const styleTag = document.createElement("style");
    styleTag.textContent = `
      @font-face {
        font-family: "ITC";
        src: url(/assets/fonts/ITC-Machine-Medium.otf);
      }
      .broadsheet-print-container {
        width: 1120px !important;
        max-width: 1120px !important;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
      }
      .bs-table {
        width: 1120px !important;
        margin: 0 !important;
        border-collapse: collapse;
      }
      /* Ensure watermark is visible in print */
      .broadsheet-watermark {
         opacity: 0.1 !important;
         -webkit-print-color-adjust: exact;
         print-color-adjust: exact;
      }
    `;

    wrapper.appendChild(styleTag);
    wrapper.appendChild(contentClone);

    // 5. PDF generation options
    const opt = {
      margin: 0,
      filename: `Broadsheet_${document.getElementById("classLevel").value}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
        width: 1120, // Exact width
        windowWidth: 1120,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
      },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "landscape",
        compress: true,
      },
      pagebreak: { mode: "avoid-all" },
    };

    await html2pdf().set(opt).from(wrapper).save();
    showNotification("PDF generated successfully!", "success");
  } catch (e) {
    console.error("PDF generation error:", e);
    showNotification("Failed to generate PDF. Please try again.", "error");
  } finally {
    hideLoading(document.body);
  }
}

async function downloadAllResults() {
  if (
    !currentData ||
    !currentData.students ||
    currentData.students.length === 0
  ) {
    showNotification("No data loaded to download", "error");
    return;
  }

  const year = document.getElementById("academicYear").value;
  const term = document.getElementById("termSelect").value;
  const classLevel = document.getElementById("classLevel").value;

  if (
    !confirm(
      `Generate PDF with all ${currentData.students.length} individual results? This may take a while.`
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

    for (let i = 0; i < currentData.students.length; i++) {
      const student = currentData.students[i];

      showLoading(
        document.body,
        `Processing ${i + 1}/${currentData.students.length}: ${
          student.firstName
        }`
      );

      // We need detailed results per student, including subjects not in broadsheet maybe?
      // broadsheetData.results is a map for the broadsheet.
      // Ideally we fetch fresh results per student to be safe and reuse standard logic.
      const termResults = await getStudentResults(student._id, year, term);

      // Load metadata
      let metadata = {};
      try {
        metadata = await resultMetadataService.getResultMetadata(
          student._id,
          term,
          year
        );
      } catch (error) {
        // No metadata, use defaults
      }

      const resultHTML = await generateResultSheet(
        student,
        termResults.subjects || {},
        term,
        year,
        metadata
      );

      const wrapper = document.createElement("div");
      wrapper.innerHTML = resultHTML;
      // Force page break
      wrapper.style.pageBreakAfter = "always";
      wrapper.className = "result-page-wrapper"; // Helper class

      batchContainer.appendChild(wrapper);
    }

    const pageWidth = 892.88 / 96;
    const pageHeight = 1263 / 96;

    const opt = {
      margin: 0,
      filename: `${classLevel}_${term}_All_Results.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2, // Slightly lower scale for batch to avoid huge file
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
              src: url(/assets/fonts/ITC-Machine-Medium.otf);
            }
            .result-page-wrapper { page-break-after: always; }
            .result-page-wrapper:last-child { page-break-after: avoid; }
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
      pagebreak: { mode: "css", after: ".result-page-wrapper" },
    };

    await html2pdf().set(opt).from(batchContainer).save();
    showNotification("Batch PDF Generated!", "success");
  } catch (error) {
    console.error("Error generating batch PDF:", error);
    showNotification("Failed to generate batch PDF.", "error");
  } finally {
    hideLoading(document.body);
  }
}
