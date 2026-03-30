import { authService } from "./api/auth.service.js";
import { setBtnLoading, showNotification } from "./utils/ui.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector(".login-details");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const button = loginForm.querySelector("button");

      try {
        setBtnLoading(button, true, "Signing in...");

        await authService.login(email, password);
        const user = authService.getCurrentUser();

        // Temporary role-based routing for quick teacher rollout
        if (user?.role === "teacher") {
          window.location.href = "src/pages/editor.html";
        } else {
          window.location.href = "src/pages/index.html";
        }
      } catch (error) {
        console.error("Login failed:", error);
        showNotification(
          error.message || "Login failed. Please check your credentials.",
          "error"
        );
        setBtnLoading(button, false);
      }
    });
  }
});
