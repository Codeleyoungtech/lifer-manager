// Sidebar toggle functionality with Persistence and "Best Logic"
(function () {
  const SIDEBAR_STATE_KEY = "lifer_sidebar_state";

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
  if (!sidebar) return; // Guard clause

  // Initialize state from localStorage (Desktop only)
  function initSidebarState() {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) {
      const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
      if (savedState === "expanded") {
        sidebar.classList.add("expanded");
        menuToggle.innerHTML =
          '<span class="material-symbols-outlined">menu_open</span>';
      }
    }
  }

  // Toggle sidebar logic
  function toggleSidebar() {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // Mobile: show/hide sidebar with overlay
      const isActive = sidebar.classList.toggle("active");
      overlay.classList.toggle("active");
      // Prevent body scroll when menu is open on mobile
      document.body.style.overflow = isActive ? "hidden" : "";
    } else {
      // Desktop: toggle narrow/wide and save preference
      const isExpanded = sidebar.classList.toggle("expanded");

      // Update persistent state
      localStorage.setItem(
        SIDEBAR_STATE_KEY,
        isExpanded ? "expanded" : "collapsed"
      );

      // Update button icon
      menuToggle.innerHTML = isExpanded
        ? '<span class="material-symbols-outlined">menu_open</span>'
        : '<span class="material-symbols-outlined">menu</span>';
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
        document.body.style.overflow = "";
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
        // Desktop: Remove mobile active classes, restore desktop state preference
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
        document.body.style.overflow = "";

        // Restore desktop preference
        const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
        if (savedState === "expanded") {
          sidebar.classList.add("expanded");
          menuToggle.innerHTML =
            '<span class="material-symbols-outlined">menu_open</span>';
        } else {
          sidebar.classList.remove("expanded");
          menuToggle.innerHTML =
            '<span class="material-symbols-outlined">menu</span>';
        }
      } else {
        // Mobile: Remove desktop expanded class
        sidebar.classList.remove("expanded");
        menuToggle.innerHTML =
          '<span class="material-symbols-outlined">menu</span>';
      }
    }, 250);
  });

  // Initialize on load
  initSidebarState();
})();
