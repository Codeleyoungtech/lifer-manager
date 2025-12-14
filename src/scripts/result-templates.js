import {
  getSettings,
  getSubjectsForStudent,
  getStudentsByClass,
  getStudentResults,
} from "./storage.js";
import attendanceService from "./api/attendance.service.js";

// Generate school name as canvas image with ITC font and gradient
async function generateSchoolNameImage() {
  // Wait for ITC font to load
  try {
    await document.fonts.load("900 120px ITC");
    await document.fonts.ready;
  } catch (e) {
    console.warn("Font loading issue:", e);
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Set canvas size - BIGGER
  canvas.width = 1200;
  canvas.height = 130;

  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 130);
  gradient.addColorStop(0, "#7ab85c");
  gradient.addColorStop(0.5, "#4a7c3a");
  gradient.addColorStop(1, "#2d5a28");

  // Set font - INCREASED TO 105px
  ctx.font = "900 105px ITC, Arial Black, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic"; // FIXED: Use alphabetic baseline for consistent positioning

  // White stroke settings
  ctx.strokeStyle = "white";
  ctx.lineWidth = 5;

  // Gradient fill
  ctx.fillStyle = gradient;

  // Draw text with letter spacing
  const text = "MUCH MORE LIFE COLLEGE";
  const letterSpacing = 4; // pixels between letters
  const totalWidth =
    ctx.measureText(text).width + letterSpacing * (text.length - 1);
  let x = (canvas.width - totalWidth) / 2;
  const y = 95; // Adjusted for alphabetic baseline

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    // Draw stroke first, then fill
    ctx.strokeText(char, x, y);
    ctx.fillText(char, x, y);
    x += ctx.measureText(char).width + letterSpacing;
  }

  return canvas.toDataURL("image/png");
}

// Generate Precious Fruit Beginners' School name image
// Generate Precious Fruit Beginners' School name image
async function generatePreciousFruitSchoolNameImage() {
  try {
    await document.fonts.load("900 120px ITC");
    await document.fonts.ready;
  } catch (e) {
    console.warn("Font loading issue:", e);
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // BIGGER canvas size for wider/larger text
  canvas.width = 1600;
  canvas.height = 140;

  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 140);
  gradient.addColorStop(0, "#7ab85c");
  gradient.addColorStop(0.5, "#4a7c3a");
  gradient.addColorStop(1, "#2d5a28");

  // INCREASED font size to 100px
  ctx.font = "900 100px ITC, Arial Black, sans-serif";
  ctx.textAlign = "left"; // Changed to left align for manual positioning
  ctx.textBaseline = "alphabetic"; // FIXED: Use alphabetic baseline for consistent letter positioning

  // White stroke settings
  ctx.strokeStyle = "white";
  ctx.lineWidth = 5;

  // Gradient fill
  ctx.fillStyle = gradient;

  // Draw text with letter spacing
  const text = "PRECIOUS FRUIT BEGINNERS' SCHOOL";
  const letterSpacing = 4; // Increased spacing
  const totalWidth =
    ctx.measureText(text).width + letterSpacing * (text.length - 1);
  let x = (canvas.width - totalWidth) / 2;
  const y = 95; // Adjusted y position for alphabetic baseline

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    ctx.strokeText(char, x, y);
    ctx.fillText(char, x, y);
    x += ctx.measureText(char).width + letterSpacing;
  }

  return canvas.toDataURL("image/png");
}

// Determine which template to use based on class level
function getTemplateType(classLevel) {
  const level = classLevel.toUpperCase();

  // Pre-nursery template: Nursery1, KG1, KG2
  if (level === "NURSERY1" || level === "KG1" || level === "KG2") {
    return "prenursery";
  }

  // Primary template: Nursery2, Primary1-6
  if (level === "NURSERY2" || level.startsWith("PRIMARY")) {
    return "primary";
  }

  // Secondary template: JSS1-3, SS1-3 (default)
  return "secondary";
}

export async function generateResultSheet(
  student,
  subjectResults,
  term,
  year,
  metadata = {}
) {
  const templateType = getTemplateType(student.currentClass);

  // Route to appropriate template
  if (templateType === "prenursery") {
    return generatePreNurseryResultSheet(
      student,
      subjectResults,
      term,
      year,
      metadata
    );
  } else if (templateType === "primary") {
    return generatePrimaryResultSheet(
      student,
      subjectResults,
      term,
      year,
      metadata
    );
  } else {
    return generateSecondaryResultSheet(
      student,
      subjectResults,
      term,
      year,
      metadata
    );
  }
}

// ==================== SECONDARY TEMPLATE (JSS/SS) ====================

async function generateSecondaryResultSheet(
  student,
  subjectResults,
  term,
  year,
  metadata = {}
) {
  const settings = await getSettings();
  const isJSS = student.currentClass.startsWith("JSS");
  const isSS = student.currentClass.startsWith("SS");

  const stats = await calculateStatistics(subjectResults, student.currentClass);
  const cumulativeScores = await calculateCumulativeScores(
    student._id || student.id,
    year
  );

  return `
  <div class="resu-back">
    <div class="resu">
      <!-- School Logo Watermark -->
      <!-- School Logo Watermark -->
      <div class="resu-overlay overlay-secondary"></div>
      
      <!-- Top Section: Header & Student Info -->
      <div class="top">
        ${await generateSecondaryHeader(student.currentClass)}
        ${await generateStudentInfo(
          student,
          term,
          year,
          stats.totalStudents,
          settings
        )}
        <div class="cog">Cognitive Ability</div>
      </div>
      
      <!-- Middle Section: Results Table -->
      <div class="table">
        ${await generateSecondaryResultsTable(
          student,
          subjectResults,
          settings,
          metadata
        )}
      </div>
      
      <!-- Bottom Section: Statistics & Comments -->
      <div class="bottom">
        ${generateBottomStats(stats, cumulativeScores)}
        ${generateComments(metadata)}
        <div class="school-sign">SCHOOL SIGNATURE AND STAMP</div>
      </div>
  </div>
  `;
}

async function generateSecondaryHeader(classLevel) {
  const isJSS = classLevel.startsWith("JSS");
  const title = isJSS
    ? "Junior School Report Sheet"
    : "Senior School Report Sheet";

  const schoolNameImg = await generateSchoolNameImage();

  return `
    <div class="header-title">
      <div class="logo"></div>
      <div class="left">
        <img src="${schoolNameImg}" class="school-name-img" alt="MUCH MORE LIFE COLLEGE" />
        <div class="address">
          <span class="add-highlight">ADD:</span> Plot 17, Road D, OTUNLA
          LAYOUT, OKE JUNCTION, APETE, IBADAN, OYO STATE, NIGERIA.
        </div>
        <div class="motto"><span class="phone-highlight">Motto:</span>Knowledge and Discipline builds a destiny.</div>
        <div class="contact">
          <div class="phone">
            <span class="phone-highlight">Tel:</span> +2348072734402, 08055447625
          </div>
          <div class="email">
            <span class="phone-highlight">E-mail:</span>
            muchmorelifecollegeibadan13@gmail.com
          </div>
        </div>
        <div class="result-class">${title}</div>
      </div>
    </div>
  `;
}

// ==================== PRIMARY TEMPLATE (Nursery 2, Primary 1-6) ====================

async function generatePrimaryResultSheet(
  student,
  subjectResults,
  term,
  year,
  metadata = {}
) {
  const settings = await getSettings();
  const stats = await calculateStatistics(subjectResults, student.currentClass);
  const cumulativeScores = await calculateCumulativeScores(
    student._id || student.id,
    year
  );

  return `
  <div class="resu-back">
    <div class="resu resu-primary">
      <!-- School Logo Watermark -->
      <!-- School Logo Watermark -->
      <div class="resu-overlay overlay-primary"></div>
      
      <!-- Top Section: Header & Student Info -->
      <div class="top">
        ${await generatePrimaryHeader(student.currentClass)}
        ${await generateStudentInfo(
          student,
          term,
          year,
          stats.totalStudents,
          settings
        )}
        <div class="cog">Cognitive Ability</div>
      </div>
      
      <!-- Middle Section: Results Table -->
      <div class="table">
        ${await generatePrimaryResultsTable(student, subjectResults, settings)}
      </div>
      
      <!-- Bottom Section: Statistics & Comments -->
      <div class="bottom">
        ${generateBottomStats(stats, cumulativeScores)}
        ${generateComments(metadata)}
        <div class="school-sign">SCHOOL SIGNATURE AND STAMP</div>
      </div>
  </div>
  `;
}

async function generatePrimaryHeader(classLevel) {
  const schoolNameImg = await generatePreciousFruitSchoolNameImage();

  return `
    <div class="header-title">
      <div class="logo"></div>
      <div class="left">
        <img src="${schoolNameImg}" class="school-name-img" alt="PRECIOUS FRUIT BEGINNERS SCHOOL" />
        <div class="address">
          <span class="add-highlight">ADD:</span> Plot 12, Road D, OTUNLA
          LAYOUT, OKE JUNCTION, APETE, IBADAN, OYO STATE, NIGERIA.
        </div>
        <div class="motto"><span class="phone-highlight">Motto:</span>Ever Increasing in Knowledge</div>
        <div class="contact">
          <div class="phone">
            <span class="phone-highlight">Tel:</span> +2348072734402, 08055447625
          </div>
          <div class="email">
            <span class="phone-highlight">E-mail:</span>
            preciousfruitbeginnersschool08@gmail.com
          </div>
        </div>
        <div class="result-class">Primary School Report Sheet</div>
      </div>
    </div>
  `;
}

async function generatePrimaryResultsTable(
  student,
  subjectResults,
  settings = {}
) {
  const allSubjectsForStudent = await getSubjectsForStudent(
    student._id || student.id
  );
  sortSubjects(allSubjectsForStudent, student.currentClass, settings);

  let subjectRows = "";
  allSubjectsForStudent.forEach((subject) => {
    const result = subjectResults[subject.code] || {};
    subjectRows += `
      <tr>
        <td class="subject-title">${subject.name}</td>
        <td class="bold">10</td>
        <td>${result?.weeklyTest ?? "--"}</td>
        <td class="bold">20</td>
        <td>${result?.midTerm ?? "--"}</td>
        <td class="bold">70</td>
        <td>${result?.exam ?? "--"}</td>
        <td><strong>${result?.total ?? "--"}</strong></td>
        <td>${getOrdinal(result?.position)}</td>
        <td>${result?.remarks ?? "--"}</td>
      </tr>
    `;
  });

  if (allSubjectsForStudent.length === 0) {
    subjectRows = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 20px; color: #666;">
          No subjects configured for this student's class/department
        </td>
      </tr>
    `;
  }

  return `
    <table class="result-table">
      <thead>
        <tr>
          <th rowspan="1" class="subject-header"></th>
          <th colspan="2" class="red-header">WEEKLY TEST</th>
          <th colspan="2" class="red-header">MID TERM</th>
          <th colspan="2" class="red-header">EXAM SCORE</th>
          <th rowspan="1" class="other-header"></th>
          <th rowspan="1" class="other-header"></th>
          <th rowspan="1" class="other-header"></th>
        </tr>
        <tr>
          <th rowspan="2" class="subject-header">SUBJECT</th>
          <th class="mark-col-h">MARK OBTAINABLE</th>
          <th class="mark-col-h">MARK OBTAINED</th>
          <th class="mark-col-h">MARK OBTAINABLE</th>
          <th class="mark-col-h">MARK OBTAINED</th>
          <th class="mark-col-h">MARK OBTAINABLE</th>
          <th class="mark-col-h">MARK OBTAINED</th>
          <th rowspan="2" class="other-header">FINAL SCORE</th>
          <th rowspan="2" class="other-header">POSITION IN EACH SUBJECT</th>
          <th rowspan="2" class="other-header">TEACHER'S REMARK</th>
        </tr>
      </thead>
      <tbody>
        ${subjectRows}
      </tbody>
    </table>
  `;
}

// ==================== PRE-NURSERY TEMPLATE (Nursery 1, KG 1, KG 2) ====================

async function generatePreNurseryResultSheet(
  student,
  subjectResults,
  term,
  year,
  metadata = {}
) {
  const settings = await getSettings();
  const stats = await calculateStatistics(subjectResults, student.currentClass);
  const cumulativeScores = await calculateCumulativeScores(
    student._id || student.id,
    year
  );

  return `
  <div class="resu-back">
    <div class="resu resu-prenursery">
      <!-- School Logo Watermark -->
      <!-- School Logo Watermark -->
      <div class="resu-overlay overlay-primary"></div>
      
      <!-- Top Section: Header & Student Info -->
      <div class="top">
        ${await generatePreNurseryHeader(student.currentClass)}
        ${await generateStudentInfo(
          student,
          term,
          year,
          stats.totalStudents,
          settings
        )}
        <div class="cog">Cognitive Ability</div>
      </div>
      
      <!-- Middle Section: Results Table -->
      <div class="table">
        ${await generatePreNurseryResultsTable(
          student,
          subjectResults,
          metadata,
          settings
        )}
      </div>
      
      <!-- Bottom Section: Statistics & Comments -->
      <div class="bottom">
        ${generateBottomStats(stats, cumulativeScores)}
        ${generateComments(metadata)}
        <div class="school-sign">SCHOOL SIGNATURE AND STAMP</div>
      </div>
  </div>
  `;
}

async function generatePreNurseryHeader(classLevel) {
  const schoolNameImg = await generatePreciousFruitSchoolNameImage();

  return `
    <div class="header-title">
      <div class="logo"></div>
      <div class="left">
        <img src="${schoolNameImg}" class="school-name-img" alt="PRECIOUS FRUIT BEGINNERS SCHOOL" />
        <div class="address">
          <span class="add-highlight">ADD:</span> Plot 12, Road D, OTUNLA
          LAYOUT, OKE JUNCTION, APETE, IBADAN, OYO STATE, NIGERIA.
        </div>
        <div class="motto"><span class="phone-highlight">Motto:</span> Ever Increasing in Knowledge</div>
        <div class="contact">
          <div class="phone">
            <span class="phone-highlight">Tel:</span> +2348072734402, 08055447625
          </div>
          <div class="email">
            <span class="phone-highlight">E-mail:</span>
            preciousfruitbeginnersschool08@gmail.com
          </div>
        </div>
        <div class="result-class">Pre-Nursery Report Sheet</div>
      </div>
    </div>
  `;
}

async function generatePreNurseryResultsTable(
  student,
  subjectResults,
  metadata = {},
  settings = {}
) {
  const allSubjectsForStudent = await getSubjectsForStudent(
    student._id || student.id
  );
  sortSubjects(allSubjectsForStudent, student.currentClass, settings);

  let subjectRows = "";
  allSubjectsForStudent.forEach((subject) => {
    const result = subjectResults[subject.code] || {};
    subjectRows += `
      <tr>
        <td class="subject-title">${subject.name}</td>
        <td class="bold">20</td>
        <td>${result?.weeklyTest || ""}</td>
        <td class="bold">20</td>
        <td>${result?.midTerm || ""}</td>
        <td class="bold">60</td>
        <td>${result?.exam || ""}</td>
        <td><strong>${result?.total || ""}</strong></td>
        <td>${getOrdinal(result?.position)}</td>
        <td>${result?.remarks || ""}</td>
      </tr>
    `;
  });

  if (allSubjectsForStudent.length === 0) {
    subjectRows = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 20px; color: #666;">
          No subjects configured for this student's class/department
        </td>
      </tr>
    `;
  }

  // Conventional Performance table with data from metadata AND contenteditable
  const conv = metadata.conventionalPerformance || {};
  const conventionalRows = `
    <tr>
      <td>FAIR</td>
      <td contenteditable="true" data-rating="fair" data-field="letterRecognition">${
        conv.fair?.letterRecognition || ""
      }</td>
      <td contenteditable="true" data-rating="fair" data-field="countingNumbers">${
        conv.fair?.countingNumbers || ""
      }</td>
      <td contenteditable="true" data-rating="fair" data-field="speakingFluency">${
        conv.fair?.speakingFluency || ""
      }</td>
    </tr>
    <tr>
      <td>GOOD</td>
      <td contenteditable="true" data-rating="good" data-field="letterRecognition">${
        conv.good?.letterRecognition || ""
      }</td>
      <td contenteditable="true" data-rating="good" data-field="countingNumbers">${
        conv.good?.countingNumbers || ""
      }</td>
      <td contenteditable="true" data-rating="good" data-field="speakingFluency">${
        conv.good?.speakingFluency || ""
      }</td>
    </tr>
    <tr>
      <td>VERY GOOD</td>
      <td contenteditable="true" data-rating="veryGood" data-field="letterRecognition">${
        conv.veryGood?.letterRecognition || ""
      }</td>
      <td contenteditable="true" data-rating="veryGood" data-field="countingNumbers">${
        conv.veryGood?.countingNumbers || ""
      }</td>
      <td contenteditable="true" data-rating="veryGood" data-field="speakingFluency">${
        conv.veryGood?.speakingFluency || ""
      }</td>
    </tr>
    <tr>
      <td>EXCELLENT</td>
      <td contenteditable="true" data-rating="excellent" data-field="letterRecognition">${
        conv.excellent?.letterRecognition || ""
      }</td>
      <td contenteditable="true" data-rating="excellent" data-field="countingNumbers">${
        conv.excellent?.countingNumbers || ""
      }</td>
      <td contenteditable="true" data-rating="excellent" data-field="speakingFluency">${
        conv.excellent?.speakingFluency || ""
      }</td>
    </tr>
  `;

  return `
    <table class="result-table">
      <thead>
        <tr>
          <th rowspan="1" class="subject-header"></th>
          <th colspan="2" class="red-header">WEEKLY TEST</th>
          <th colspan="2" class="red-header">MID TERM</th>
          <th colspan="2" class="red-header">EXAM SCORE</th>
          <th rowspan="1" class="other-header"></th>
          <th rowspan="1" class="other-header"></th>
          <th rowspan="1" class="other-header"></th>
        </tr>
        <tr>
          <th rowspan="2" class="subject-header">SUBJECT</th>
          <th class="mark-col-h">MARK OBTAINABLE</th>
          <th class="mark-col-h">MARK OBTAINED</th>
          <th class="mark-col-h">MARK OBTAINABLE</th>
          <th class="mark-col-h">MARK OBTAINED</th>
          <th class="mark-col-h">MARK OBTAINABLE</th>
          <th class="mark-col-h">MARK OBTAINED</th>
          <th rowspan="2" class="other-header">FINAL SCORE</th>
          <th rowspan="2" class="other-header">POSITION IN EACH SUBJECT</th>
          <th rowspan="2" class="other-header">TEACHER'S REMARK</th>
        </tr>
      </thead>
      <tbody>
        ${subjectRows}
      </tbody>
    </table>

    <div class="cog" style="margin-top: 15px;">Conventional Performance</div>

    <table class="convenperform">
      <thead>
        <th class="con-header">REMARK</th>
        <th class="con-header">RECOGNITION OF LETTER</th>
        <th class="con-header">COUNTING & IDENTIFICATION OF NUMBERS</th>
        <th class="con-header">SPEAKING FLUENCY</th>
      </thead>
      <tbody>
        ${conventionalRows}
      </tbody>
    </table>
  `;
}

// ==================== SHARED HELPER FUNCTIONS ====================

function sortSubjects(subjects, classLevel, settings) {
  if (!settings.subjectOrders) {
    subjects.sort((a, b) => a.name.localeCompare(b.name));
    return;
  }

  let orderList = [];
  const level = classLevel.toUpperCase();
  if (level === "NURSERY1" || level === "KG1" || level === "KG2") {
    orderList = settings.subjectOrders.prenursery || [];
  } else if (level === "NURSERY2" || level.startsWith("PRIMARY")) {
    orderList = settings.subjectOrders.primary || [];
  } else if (level.startsWith("JSS")) {
    orderList = settings.subjectOrders.jss || [];
  } else if (level.startsWith("SS")) {
    orderList = settings.subjectOrders.ss || [];
  }

  if (orderList.length === 0) {
    subjects.sort((a, b) => a.name.localeCompare(b.name));
    return;
  }

  subjects.sort((a, b) => {
    const indexA = orderList.indexOf(a.code);
    const indexB = orderList.indexOf(b.code);

    // If both found, sort by index
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    // If only A found, A comes first
    if (indexA !== -1) return -1;
    // If only B found, B comes first
    if (indexB !== -1) return 1;
    // If neither, sort alphabetical
    return a.name.localeCompare(b.name);
  });
}

// Convert date from YYYY-MM-DD to DD/MM/YYYY for display
function formatDateForDisplay(dateString) {
  if (!dateString) return "-";
  // Check if already in DD/MM/YYYY format
  if (dateString.includes("/")) return dateString;

  // Convert from YYYY-MM-DD
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Get ordinal suffix (1ST, 2ND, 3RD, etc.)
function getOrdinal(n) {
  if (!n || isNaN(n) || n == 0) return "--";
  const i = parseInt(n);
  const j = i % 10,
    k = i % 100;
  if (j == 1 && k != 11) {
    return i + "ST";
  }
  if (j == 2 && k != 12) {
    return i + "ND";
  }
  if (j == 3 && k != 13) {
    return i + "RD";
  }
  return i + "TH";
}

async function generateStudentInfo(
  student,
  term,
  year,
  totalStudents,
  settings = {}
) {
  const termDisplay =
    term === "firstTerm"
      ? "1ST TERM"
      : term === "secondTerm"
      ? "2ND TERM"
      : "3RD TERM";

  const vacationDate = formatDateForDisplay(settings.dateOfVacation);
  const resumptionDate = formatDateForDisplay(settings.dateOfResumption);

  // Fetch attendance for this student
  let attendance = {};
  try {
    attendance = await attendanceService.getStudentAttendance(
      student._id || student.id,
      term,
      year
    );
  } catch (error) {
    console.log("No attendance found for student:", error);
  }

  const maxAttendance =
    attendance?.maxAttendance || settings.maxAttendance || "-";
  const timePresent = attendance?.timePresent || "-";
  const timeAbsent = attendance?.timeAbsent || "-";

  return `
    <div class="stat">
      <div class="line">
        <div class="name"><strong font-weight:900; font-family:"rockwell">NAME:</strong> ${student.firstName} ${student.otherNames}</div>
        <div class="class"><strong font-weight:900; font-family:"rockwell">CLASS:</strong> ${student.currentClass}</div>
      </div>
      <div class="line">
        <div class="term"><strong font-weight:900; font-family:"rockwell">TERM:</strong> ${termDisplay}</div>
        <div class="session"><strong font-weight:900; font-family:"rockwell">SESSION:</strong> ${year}</div>
        <div class="max-att"><strong font-weight:900; font-family:"rockwell">MAX.ATTENDANCE:</strong> ${maxAttendance}</div>
      </div>
      <div class="line">
        <div class="noinclass"><strong font-weight:900; font-family:"rockwell">NUMBER IN CLASS:</strong> ${totalStudents}</div>
        <div class="time-present"><strong font-weight:900; font-family:"rockwell">TIME PRESENT:</strong> ${timePresent}</div>
        <div class="time-absent"><strong font-weight:900; font-family:"rockwell">TIME ABSENT:</strong> ${timeAbsent}</div>
      </div>
      <div class="line">
        <div class="dov"><strong font-weight:900; font-family:"rockwell">DATE OF VACATION:</strong> ${vacationDate}</div>
        <div class="dor"><strong font-weight:900; font-family:"rockwell">DATE OF RESUMPTION:</strong> ${resumptionDate}</div>
      </div>
    </div>
  `;
}

async function generateSecondaryResultsTable(
  student,
  subjectResults,
  settings,
  metadata = {}
) {
  return `
    <table class="result-table">
      <thead>
        <tr>
          <th rowspan="2" class="subject-header">SUBJECT</th>
          <th class="mark-col-h">WEEKLY REPORT<br />(10)</th>
          <th class="mark-col-h">MID TERM TEST<br />(20)</th>
          <th class="mark-col-h">EXAM<br />(70)</th>
          <th class="mark-col-h">AVERAGE MARKS<br />(100)</th>
          <th class="mark-col-h">GRADE</th>
          <th rowspan="2" class="mark-col-h">POSITION IN EACH SUBJECT</th>
          <th class="other-header">REMARK</th>
          <th rowspan="2" class="other-header">TEACHER'S SIGNATURE</th>
        </tr>
      </thead>
      <tbody>
        ${await generateSubjectRows(student, subjectResults, settings)}
      </tbody>
    </table>
    
    <!-- Grading Key & Behavioral Traits -->
    <div class="table-below">
      <div class="table-below-left">
        <ul class="grade-list">
          <li><strong style="color: #b70d18;">GRADE:</strong></li>
          <li><strong>A:</strong> EXCELLENT</li>
          <li><strong>B:</strong> GOOD</li>
          <li><strong>C:</strong> CREDIT</li>
          <li><strong>D:</strong> PASS</li>
          <li><strong>E:</strong> POOR</li>
          <li><strong>F:</strong> FAIL</li>
          <li><strong>AB:</strong> ABSENT</li>
        </ul>
      </div>
    <div class="table-below-right">
        <ul class="feat-list">
          <li><strong style="color: #b70d18;">INTUITIVE FEAT GRADE:</strong></li>
          <li>PUNCTUALITY & LEADERSHIP: <span contenteditable="true" class="feat-score" data-field="punctuality">${
            metadata.intuitiveFeats?.punctuality || ""
          }</span></li>
          <li>ATTENTIVE & ABILITY TO SPEAK IN PUBLIC: <span contenteditable="true" class="feat-score" data-field="attentive">${
            metadata.intuitiveFeats?.attentive || ""
          }</span></li>
          <li>NEATNESS & WORKING WITH OTHERS: <span contenteditable="true" class="feat-score" data-field="neatness">${
            metadata.intuitiveFeats?.neatness || ""
          }</span></li>
          <li>HELPING & COOPERATION WITH OTHERS: <span contenteditable="true" class="feat-score" data-field="helping">${
            metadata.intuitiveFeats?.helping || ""
          }</span></li>
          <li>SPEAKING & HONESTY: <span contenteditable="true" class="feat-score" data-field="speaking">${
            metadata.intuitiveFeats?.speaking || ""
          }</span></li>
          <li>HONESTY & POLITENESS: <span contenteditable="true" class="feat-score" data-field="politeness">${
            metadata.intuitiveFeats?.politeness || ""
          }</span></li>
          <li>PERSEVERANCE: <span contenteditable="true" class="feat-score" data-field="perseverance">${
            metadata.intuitiveFeats?.perseverance || ""
          }</span></li>
        </ul>
      </div>
    </div>
  `;
}

async function generateSubjectRows(student, subjectResults, settings) {
  let rows = "";

  const allSubjectsForStudent = await getSubjectsForStudent(
    student._id || student.id
  );

  sortSubjects(allSubjectsForStudent, student.currentClass, settings);

  allSubjectsForStudent.forEach((subject) => {
    const result = subjectResults[subject.code];

    rows += `
      <tr>
        <td class="subject-title">${subject.name}</td>
        <td class="mark-col">${result?.weeklyTest ?? "--"}</td>
        <td class="mark-col">${result?.midTerm ?? "--"}</td>
        <td class="mark-col">${result?.exam ?? "--"}</td>
        <td class="mark-col"><strong>${result?.total ?? "--"}</strong></td>
        <td class="mark-col"><strong>${result?.grade ?? "--"}</strong></td>
        <td>${getOrdinal(result?.position)}</td>
        <td>${result?.remarks ?? "--"}</td>
        <td></td>
      </tr>
    `;
  });

  if (allSubjectsForStudent.length === 0) {
    rows = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 20px; color: #666;">
          No subjects configured for this student's class/department
        </td>
      </tr>
    `;
  }

  return rows;
}

function generateBottomStats(stats, cumulativeScores = {}) {
  return `
    <div class="bottom-stat">
      <div class="bt-line">
        <div class="tmo">
          <b>TOTAL MARK OBTAINABLE:</b><span class="bt-value">${
            stats.totalObtainable
          }</span>
        </div>
        <div class="tmo">
          <b>TOTAL MARK OBTAINED:</b><span class="bt-value">${
            stats.totalObtained
          }</span>
        </div>
      </div>
      
      <div class="bt-line">
        <div class="ovrpercentage">
          <span>OVERALL PERCENTAGE:</span> <span class="bt-value">${stats.percentage.toFixed(
            2
          )}%</span>
        </div>
      </div>
      
      <div>
        <div class="cumscore">
            <span style="font-size: 16px;">CUMULATIVE SCORE:<span>  </span>  </span>
          <div class="terms-grade">
            <div class="term-grade"><span>1st TERM:</span> <span class="bt-value">${
              cumulativeScores.firstTerm
                ? cumulativeScores.firstTerm + "%"
                : "-"
            }</span></div>
            <div class="term-grade"><span>2nd TERM:</span> <span class="bt-value">${
              cumulativeScores.secondTerm
                ? cumulativeScores.secondTerm + "%"
                : "-"
            }</span></div>
            <div class="term-grade"><span>3rd TERM:</span> <span class="bt-value">${
              cumulativeScores.thirdTerm
                ? cumulativeScores.thirdTerm + "%"
                : "-"
            }</span></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateComments(metadata = {}) {
  const classTeacherComment =
    metadata.classTeacherComment || "Keep up the good work!";
  const principalComment =
    metadata.principalComment || "Excellent performance.";

  return `
    <div class="comment-section">
      <div class="comment">
        <span class="comment-type">CLASS TEACHER'S COMMENT:</span>
        <span class="class-teacher-comment" contenteditable="true" data-field="classTeacherComment">${classTeacherComment}</span>
      </div>
      
      <div class="comment">
        <span class="comment-type">SCHOOL PRINCIPAL'S COMMENT:</span>
        <span class="school-principal-comment" contenteditable="true" data-field="principalComment">${principalComment}</span>
      </div>
    </div>
  `;
}

async function calculateStatistics(subjectResults, classLevel) {
  let totalObtained = 0;
  let subjectCount = 0;

  for (let code in subjectResults) {
    totalObtained += subjectResults[code].total;
    subjectCount++;
  }

  const totalObtainable = subjectCount * 100;
  const percentage =
    totalObtainable > 0 ? (totalObtained / totalObtainable) * 100 : 0;

  const studentsInClass = await getStudentsByClass(classLevel);

  return {
    totalObtained,
    totalObtainable,
    percentage,
    totalStudents: studentsInClass.length,
  };
}

// Calculate cumulative scores for all three terms
async function calculateCumulativeScores(studentId, academicYear) {
  const terms = ["firstTerm", "secondTerm", "thirdTerm"];
  const cumulativeScores = {
    firstTerm: null,
    secondTerm: null,
    thirdTerm: null,
  };

  for (const term of terms) {
    try {
      const termResults = await getStudentResults(
        studentId,
        academicYear,
        term
      );

      if (termResults && termResults.subjects) {
        let totalObtained = 0;
        let subjectCount = 0;

        for (let code in termResults.subjects) {
          const result = termResults.subjects[code];
          if (result && typeof result.total === "number") {
            totalObtained += result.total;
            subjectCount++;
          }
        }

        if (subjectCount > 0) {
          const totalObtainable = subjectCount * 100;
          const percentage = (totalObtained / totalObtainable) * 100;
          cumulativeScores[term] = percentage.toFixed(2);
        }
      }
    } catch (error) {
      // Keep as null if no results
    }
  }

  return cumulativeScores;
}

export function getResultStyles() {
  return `
    * {
      padding: 0;
      margin: 0;
      box-sizing: border-box;
    }

    @font-face {
      font-family: "ITC";
      src: url(/assets/fonts/ITC-Machine-Medium.otf);
    }
    
    @font-face {
      font-family: "book-antiqua";
      src: url(/assets/fonts/book-antiqua-bold.ttf);
    }
    
    @font-face {
      font-family: "rockwell";
      src: url(../assets/fonts/Rockwell-bold.ttf);
    }

    .resu-back {
      width: 892.88px;
      height: 1263px;
      margin: 0 auto;
      padding: 15px;
      position: relative;
      box-shadow: 0 6px 12px rgba(0,0,0,0.15);
      page-break-after: always;
      overflow: hidden;
      box-sizing: border-box;
    }

    .resu-back::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url(/public/download.jpeg);
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      transform: rotate(180deg);
      transform-origin: center;
      z-index: 0;
    }

    .resu-back > * {
      position: relative;
      z-index: 1;
    }

    .resu-back:last-child {
      page-break-after: auto;
    }

    .resu {
      width: 100%;
      height: 100%;
      background-color: #edf6f1;
      font-family: "Arial", sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px 8px;
      position: relative;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      page-break-after: always;
    }

    .resu:last-child {
      page-break-after: auto;
    }

    .resu-overlay {
      position: absolute;
      top: 100px;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      opacity: 0.08;
      pointer-events: none;
      background-size: 33.33% 25%;
      background-repeat: repeat;
    }

    .overlay-secondary {
      background-image: url(/assets/mmlclogo.jpg);
    }

    .overlay-primary {
      background-image: url(/assets/pfbslogo.jpg);
    }

    .top, .table, .bottom {
      position: relative;
      z-index: 2;
      width: 100%;
    }

    .top { flex-basis: 25%; }
    .table { flex-basis: 61%; }
    .bottom { flex-basis: 14%; }

    .header-title {
      width: 100%;
      display: flex;
    }

    .logo {
      width: 110px;
      height: 110px;
      background-image: url(/assets/mmlclogo.jpg); /* Default for secondary */
      background-position: center;
      background-size: contain;
      background-repeat: no-repeat;
    }

    /* Override for primary and pre-nursery */
    .resu-primary .logo,
    .resu-prenursery .logo {
      background-image: url(/assets/pfbslogo.jpg);
    }

    .left {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      font-weight: 900;
      width: 100%;
      font-size: 14px;
    }

    .school-name-img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
      scale: 1.1;
      padding-left: 20px;
    }

    .address {
      background-color: #006336;
      color: white;
      padding: 4px;
      border-radius: 8px;
      font-size: 12px;
    }

    .add-highlight { color: yellow; }
    .phone-highlight { color: #b70d18; }

    .motto { font-size: 15px; text-transform: uppercase; }

    .contact {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      align-items: center;
      line-height: 16px;
    }

    .result-class {
      font-size: 20px;
      padding: 2px 10px;
      background-color: #b70d18;
      color: white;
      width: fit-content;
      border-radius: 8px;
      text-transform: uppercase;
      font-family: "georgia", serif;
    }

    .stat {
      width: 100%;
      background-color: white;
      padding: 5px 10px;
      font-size: 19px;
      margin-top: 10px;
      border-radius: 4px;
    }


    .line { display: flex; text-transform: uppercase; font-family: "Times New Roman", Times, serif; line-height: 18px; }
    .name { flex-basis: 65%; }
    .class { flex-basis: 35%; }
    .dov, .dor { flex-basis: 50%; }
    .term, .session, .max-att, .noinclass, .time-present, .time-absent { flex-basis: 33%; }

    .cog {
      font-size: 30px;
      color: red;
      font-weight: 900;
      align-self: flex-start;
      text-transform: uppercase;
      margin-top: 5px;
      font-family:"antiqua", serif;
    }

    .table table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      border:2px solid black
    }

    .table th, .table td {
      border: 1px solid black;
      text-align: center;
      vertical-align: middle;
      word-wrap: break-word;
      white-space: normal;
      text-transform: uppercase;
      padding: 2px 2px;
      font-size: 15.3px;
    }

    .table th{
    color: #006336;}

    .table-td{
    padding: 2px;
    }

    .table .subject-header {
      // font-weight: bold;
      width: 28%;
      text-align: center;
      font-size: 36px;
      color: #b70d18;
    }

    .table .mark-col-h { font-size: 11.5px; }
    .table .mark-col { width: 29.8px; word-break: break-word; }
    .table .other-header { width: 12.4%; font-weight: bold; font-size: 12px; padding: 0; }
    .table .subject-title { text-align: left; font-size:16.5px;}

    .table-below {
      display: flex;
      justify-content: space-between;
      margin-top: 5px;
      border: solid 1px #000000;
      padding: 5px 30px 5px 50px;
    }

   .table-below ul li {
      list-style-type: none;
      font-size: 13px;
    }

    .feat-list { text-align: right; }
    
    .feat-score {
       display: inline-block; 
       min-width: 30px; 
       padding: 0 5px;
       color: #000;
       font-weight: bold;
    }

    .bottom-stat {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .bt-line {
      display: flex;
      font-size: 16.5px;
    }

    .tmo {
      flex-basis: 50%;
      display: flex;
      align-items: center;
    }

    .bt-value {
      display: block;
      height: 20px;
      width: 100px;
      background-color: lightgreen;
      margin-left: 10px;
      padding: 2px 5px;
      color: #011d10ff;
    }

    .comment-section {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-top: 10px;
      font-size: 16px;
    }

    .comment { height: 32px; }
    .comment-type { white-space: nowrap; }

    .class-teacher-comment, .school-teacher-comment {
      width: 100%;
      white-space: normal;
      word-wrap: break-word;
      padding-bottom: 5px;
    }

    .school-sign {
      text-align: center;
      margin-top: 8px;
      margin-bottom: 8px;
      margin-left: 300px;
    }

    .ovrpercentage,
    .cumscore {
      width: 100%;
      display: flex;
      align-items: center;
    }

    .bold {
      font-weight: bold;
    }

    .terms-grade,
    .term-grade {
      display: flex;
      align-items: center;
    }

    .term-grade {
      width:200px    
    }

    @media print {
      * {
        margin: 0 !important;
        padding: 0 !important;
      }
      
      .resu {
        margin: 0 !important;
        padding: 15px 20px !important;
        box-shadow: none;
        page-break-after: always;
      }
      
      .resu:last-child {
        page-break-after: auto;
      }
      
      body {
        margin: 0;
        padding: 0;
      }

      /* Conventional Performance table for pre-nursery */
      .convenperform {
        width: 100%;
        border-collapse: collapse;
        margin-top: 5px;
      }

      .convenperform th,
      .convenperform td {
        border: 1px solid black;
        text-align: center;
        vertical-align: middle;
        padding: 4px;
        word-wrap: break-word;
        white-space: normal;
      }

      .convenperform .con-header {
        font-weight: bold;
        font-size: 12px;
        background-color: #f0f0f0;
      }

      .convenperform td[contenteditable="true"] {
        min-height: 20px;
        background-color: #fffef8;
      }

      .convenperform td[contenteditable="true"]:focus {
        outline: 2px solid #4CAF50;
        background-color: #ffffff;
      }
    }
  `;
}
