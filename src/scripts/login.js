import { authService } from "./api/auth.service.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector(".login-details");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const button = loginForm.querySelector("button");
      const originalText = button.textContent;

      try {
        button.textContent = "Signing in...";
        button.disabled = true;

        await authService.login(email, password);

        // Redirect to dashboard
        // Adjust path based on where index.html is relative to pages
        // index.html is in root. src/pages/index.html is dashboard.
        window.location.href = "src/pages/index.html";
      } catch (error) {
        console.error("Login failed:", error);
        alert(error.message || "Login failed. Please check your credentials.");
        button.textContent = originalText;
        button.disabled = false;
      }
    });
  }
});
