import { getSettings, getAllStudents, getAllSubjects } from "./storage.js";
import { dashboardService } from "./api/dashboard.service.js";

window.addEventListener("DOMContentLoaded", async function () {
  await loadStatistics();

  await loadRecentActivities();

  updateGreeting();
});

function updateGreeting() {
  const greetingElement = document.querySelector(".dash-greetings p");
  const hour = new Date().getHours();

  let greeting = "";
  if (hour < 12) {
    greeting = "Good morning!";
  } else if (hour < 18) {
    greeting = "Good afternoon!";
  } else {
    greeting = "Good evening!";
  }

  greetingElement.textContent = `${greeting} Here's what's happening in your school today.`;
}

async function loadStatistics() {
  try {
    // We can use the dashboard service directly for stats if implemented
    // Or calculate them here using getAllStudents etc.
    // The backend has a getDashboardStats endpoint. Let's use it.

    const stats = await dashboardService.getStats();

    document.getElementById("total_students").textContent = stats.totalStudents;
    document.getElementById("active_spreadsheets").textContent =
      stats.activeSpreadsheets;
    document.getElementById("top_performers").textContent = stats.topPerformers;

    document.getElementById("total_students_percent").textContent = "+12"; // Placeholder
    document.getElementById("active_sreadsheets_percent").textContent = "+5"; // Placeholder
    document.getElementById("top_performer").textContent = "+8"; // Placeholder
  } catch (error) {
    console.error("Error loading statistics:", error);
  }
}

async function loadRecentActivities() {
  try {
    const activities = await dashboardService.getActivities();

    // Transform activities to match display format if needed
    // The backend returns { type, title, description, timestamp }
    // We need { title, description, time }

    const formattedActivities = activities.map((activity) => ({
      title: activity.title,
      description: activity.description,
      time: getTimeAgo(activity.timestamp),
    }));

    displayActivities(formattedActivities);
  } catch (error) {
    console.error("Error loading recent activities:", error);
  }
}

function displayActivities(activities) {
  const listContainer = document.querySelector(".recent-activities-list ul");

  listContainer.innerHTML = "";

  if (activities.length === 0) {
    listContainer.innerHTML = `
      <li>
        <div class="recent-wrapper">
          <p style="text-align: center; color: #666; padding: 20px;">
            No recent activities yet. Start by registering students or entering results!
          </p>
        </div>
      </li>
    `;
    return;
  }

  activities.forEach((activity) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="recent-wrapper">
        <h3 class="recent-title">${activity.title}</h3>
        <div class="recent-activity">
          <span>${activity.description}</span>
        </div>
        <p class="day">${activity.time}</p>
      </div>
    `;
    listContainer.appendChild(li);
  });
}

function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString();
}

window.exportData = function () {
  alert(
    "Export feature is coming soon! This will allow you to download a backup of your data."
  );
};
