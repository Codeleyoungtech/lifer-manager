import { authService } from "./api/auth.service.js";

(async function () {
  const isAuth = authService.isAuthenticated();
  if (!isAuth) {
    // Redirect to login. We are in src/pages/, so login is ../../index.html
    window.location.href = "../../index.html";
    return;
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
