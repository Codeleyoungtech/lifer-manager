import { getSettings, getAllStudents } from "./storage.js";
import { showLoading, hideLoading, showNotification } from "./utils/ui.js";

let studentsChart = null;
let genderChart = null;

window.addEventListener("DOMContentLoaded", async function () {
  const container = document.querySelector(".dashboard-page") || document.body;
  showLoading(container, "Updating dashboard...");

  try {
    await loadDashboardData();
  } catch (error) {
    console.error("Dashboard error:", error);
    showNotification("Failed to load dashboard data", "error");
  } finally {
    hideLoading(container);
  }

  window.exportData = exportData;
});

async function loadDashboardData() {
  try {
    const settings = await getSettings();
    const students = await getAllStudents();

    // Update KPIs
    updateKPIs(students, settings);

    // Render Charts
    renderStudentsChart(students, settings.classes);
    renderGenderChart(students);

    // Load Activities
    loadRecentActivities();

    // Update Insights
    updateInsights(students, settings);
  } catch (error) {
    console.error("Error loading dashboard data:", error);
  }
}

// ==================== UPDATE KPIs ====================

function updateKPIs(students, settings) {
  // Total Students
  document.getElementById("totalStudents").textContent = students.length;

  // Active Classes
  document.getElementById("activeClasses").textContent =
    settings.classes.length;

  // Pending Results (students without results)
  // This is a placeholder - you'd need to fetch actual results data
  document.getElementById("pendingResults").textContent = "0";

  // Average Performance (placeholder)
  document.getElementById("avgPerformance").textContent = "75.5%";
}

// ==================== RENDER CHARTS ====================

function renderStudentsChart(students, classes) {
  const ctx = document.getElementById("studentsChart");
  if (!ctx) return;

  // Count students per class
  const classCounts = {};
  classes.forEach((className) => {
    classCounts[className] = students.filter(
      (s) => s.currentClass === className
    ).length;
  });

  // Get top 10 classes by student count for better visualization
  const sortedClasses = Object.entries(classCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const labels = sortedClasses.map((item) => item[0]);
  const data = sortedClasses.map((item) => item[1]);

  // Destroy existing chart if it exists
  if (studentsChart) {
    studentsChart.destroy();
  }

  studentsChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Number of Students",
          data: data,
          backgroundColor: "rgba(102, 126, 234, 0.8)",
          borderColor: "rgba(102, 126, 234, 1)",
          borderWidth: 1,
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 12,
          borderRadius: 8,
          titleFont: {
            size: 14,
            weight: "bold",
          },
          bodyFont: {
            size: 13,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 5,
            font: {
              size: 12,
            },
          },
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
        },
        x: {
          ticks: {
            font: {
              size: 11,
            },
          },
          grid: {
            display: false,
          },
        },
      },
    },
  });
}

function renderGenderChart(students) {
  const ctx = document.getElementById("genderChart");
  if (!ctx) return;

  // Count by gender
  const maleCount = students.filter(
    (s) => s.gender.toLowerCase() === "male"
  ).length;
  const femaleCount = students.filter(
    (s) => s.gender.toLowerCase() === "female"
  ).length;

  // Destroy existing chart if it exists
  if (genderChart) {
    genderChart.destroy();
  }

  genderChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Male", "Female"],
      datasets: [
        {
          data: [maleCount, femaleCount],
          backgroundColor: [
            "rgba(102, 126, 234, 0.8)",
            "rgba(217, 70, 239, 0.8)",
          ],
          borderColor: ["rgba(102, 126, 234, 1)", "rgba(217, 70, 239, 1)"],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 15,
            font: {
              size: 13,
              weight: "500",
            },
            usePointStyle: true,
            pointStyle: "circle",
          },
        },
        tooltip: {
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: 12,
          borderRadius: 8,
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.parsed || 0;
              const total = maleCount + femaleCount;
              const percentage =
                total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
    },
  });
}

// ==================== RECENT ACTIVITIES ====================

function loadRecentActivities() {
  const activityList = document.getElementById("activityList");
  if (!activityList) return;

  // Sample activities - in a real app, these would come from a database
  const activities = [
    {
      icon: "edit_note",
      text: "Mathematics results published for SS3",
      time: "2 minutes ago",
    },
    {
      icon: "person_add",
      text: "New student added to KG1 class",
      time: "1 hour ago",
    },
    {
      icon: "school",
      text: "English results updated for JSS2",
      time: "3 hours ago",
    },
    {
      icon: "calendar_today",
      text: "Attendance recorded for Primary 5",
      time: "Today",
    },
    {
      icon: "settings",
      text: "System settings updated",
      time: "Yesterday",
    },
  ];

  activityList.innerHTML = activities
    .map(
      (activity) => `
    <div class="activity-item">
      <div class="activity-icon">
        <span class="material-symbols-outlined">${activity.icon}</span>
      </div>
      <div class="activity-content">
        <div class="activity-text">${activity.text}</div>
        <div class="activity-time">${activity.time}</div>
      </div>
    </div>
  `
    )
    .join("");
}

// ==================== UPDATE INSIGHTS ====================

function updateInsights(students, settings) {
  // Count students with missing results (placeholder - would need real results data)
  const missingResults = 0; // Replace with actual logic
  document.getElementById(
    "insightPending"
  ).textContent = `${missingResults} students have missing results`;

  // Count classes without results (placeholder)
  const classesWithoutResults = 0; // Replace with actual logic
  document.getElementById(
    "insightClasses"
  ).textContent = `${classesWithoutResults} classes haven't submitted results`;

  // Top student (placeholder - would calculate from actual results)
  const topStudent =
    students.length > 0
      ? `${students[0].firstName} ${students[0].otherNames}`
      : "No students yet";
  document.getElementById(
    "insightTop"
  ).textContent = `Top student this term: ${topStudent}`;
}

// ==================== EXPORT DATA ====================

function exportData() {
  showNotification("Export feature coming soon!", "info");
}
