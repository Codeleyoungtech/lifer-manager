// Sidebar toggle functionality - BUTTON ONLY (no hover)
(function () {
  // Create toggle button
  const menuToggle = document.createElement("button");
  menuToggle.className = "menu-toggle";
  menuToggle.innerHTML = '<span class="material-symbols-outlined">menu</span>';
  menuToggle.setAttribute("aria-label", "Toggle sidebar");
  menuToggle.title = "Expand/Collapse sidebar";

  // Create overlay for mobile
  const overlay = document.createElement("div");
  overlay.className = "sidebar-overlay";

  // Add to DOM
  document.body.appendChild(menuToggle);
  document.body.appendChild(overlay);

  const sidebar = document.querySelector("aside");

  // Toggle sidebar expansion on desktop, open/close on mobile
  function toggleSidebar() {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // Mobile: show/hide sidebar with overlay
      sidebar.classList.toggle("active");
      overlay.classList.toggle("active");
    } else {
      // Desktop: toggle narrow/wide (NO HOVER)
      sidebar.classList.toggle("expanded");

      // Update button icon
      if (sidebar.classList.contains("expanded")) {
        menuToggle.innerHTML =
          '<span class="material-symbols-outlined">menu_open</span>';
      } else {
        menuToggle.innerHTML =
          '<span class="material-symbols-outlined">menu</span>';
      }
    }
  }

  // Event listeners
  menuToggle.addEventListener("click", toggleSidebar);
  overlay.addEventListener("click", toggleSidebar);

  // Close sidebar on mobile when clicking a link
  const sidebarLinks = sidebar.querySelectorAll("a");
  sidebarLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
      }
    });
  });

  // Handle window resize
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const isMobile = window.innerWidth <= 768;
      if (!isMobile) {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
      } else {
        sidebar.classList.remove("expanded");
      }
    }, 250);
  });
})();
