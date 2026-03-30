import { authService } from "./api/auth.service.js";

(async function () {
  const isAuth = authService.isAuthenticated();
  if (!isAuth) {
    // Redirect to login. We are in src/pages/, so login is ../../index.html
    window.location.href = "../../index.html";
    return;
  }

  const user = authService.getCurrentUser();
  const role = user?.role || "";
  const currentPath = window.location.pathname;
  const teacherAllowedPaths = [
    "/src/pages/editor.html",
    "/src/pages/attendance.html",
    "/src/pages/teacher-comments.html",
  ];
  const isTeacherAllowedPage = teacherAllowedPaths.some((path) =>
    currentPath.endsWith(path)
  );

  if (role === "teacher" && !isTeacherAllowedPage) {
    window.location.href = "../pages/editor.html";
    return;
  }

  if (role === "teacher") {
    const allowedHrefs = [
      "../pages/editor.html",
      "../pages/attendance.html",
      "../pages/teacher-comments.html",
    ];
    document.querySelectorAll(".links-wrapper a").forEach((link) => {
      const href = link.getAttribute("href") || "";
      const isAllowed = allowedHrefs.includes(href);
      if (!isAllowed) {
        const listItem = link.closest("li");
        if (listItem) {
          listItem.style.display = "none";
        }
      }
    });
  }

  // Logout handler
  // Target the logout link in the sidebar
  const logoutBtn = document.querySelector(".sidebar-footer a");
  if (logoutBtn && logoutBtn.textContent.includes("Logout")) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      authService.logout();
      window.location.href = "../../index.html";
    });
  }
})();
