// Sidebar toggle functionality with Persistence and "Best Logic"
(function () {
  const SIDEBAR_STATE_KEY = "lifer_sidebar_state";
  const SIDEBAR_LINKS = [
    {
      href: "../pages/index.html",
      icon: "dashboard",
      label: "Dashboard",
    },
    {
      href: "../pages/editor.html",
      icon: "description",
      label: "Legacy Editor",
    },
    {
      href: "../pages/student.html",
      icon: "group",
      label: "Students",
    },
    {
      href: "../pages/result-manager.html",
      icon: "assignment",
      label: "Student Results",
    },
    {
      href: "../pages/broadsheet.html",
      icon: "table_chart",
      label: "Broadsheet",
    },
    {
      href: "../pages/attendance.html",
      icon: "calendar_month",
      label: "Attendance",
    },
    {
      href: "../pages/teacher-comments.html",
      icon: "comment",
      label: "Teacher Comments",
    },
    {
      href: "../pages/subject.html",
      icon: "school",
      label: "Classes & Subjects",
    },
    {
      href: "../pages/settings.html",
      icon: "settings",
      label: "Settings",
    },
    {
      href: "../pages/user-management.html",
      icon: "manage_accounts",
      label: "User Setup",
    },
  ];

  function normalizePath(path) {
    return (path || "").replace(/\/+$/, "");
  }

  function buildSidebarLinkItem(linkDef) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = linkDef.href;
    a.innerHTML = `
      <span class="material-symbols-outlined">${linkDef.icon}</span>
      <span>${linkDef.label}</span>
    `;
    li.appendChild(a);
    return li;
  }

  function ensureSidebarLinks(sidebar) {
    const list = sidebar.querySelector(".links-wrapper ul");
    if (!list) return;

    const existingHrefs = new Set();
    list.querySelectorAll("a").forEach((link) => {
      const href = link.getAttribute("href");
      if (href) existingHrefs.add(href);
    });

    SIDEBAR_LINKS.forEach((linkDef) => {
      if (!existingHrefs.has(linkDef.href)) {
        list.appendChild(buildSidebarLinkItem(linkDef));
      }
    });

    const currentPath = normalizePath(window.location.pathname);
    list.querySelectorAll("a").forEach((link) => {
      link.classList.remove("active");
      const path = normalizePath(new URL(link.href, window.location.origin).pathname);
      if (path === currentPath) {
        link.classList.add("active");
      }
    });
  }

  function enforceSidebarRoleVisibility(sidebar) {
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("user") || "null");
    } catch (error) {
      user = null;
    }

    if (user?.role !== "teacher") return;

    const allowedHrefs = new Set([
      "../pages/editor.html",
      "../pages/attendance.html",
      "../pages/teacher-comments.html",
    ]);

    sidebar.querySelectorAll(".links-wrapper a").forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (!allowedHrefs.has(href)) {
        const item = link.closest("li");
        if (item) item.style.display = "none";
      }
    });
  }

  function hydrateSidebarUser() {
    const userNameEl = document.querySelector(".sidebar-footer .user-name");
    const userTypeEl = document.querySelector(".sidebar-footer .user-type");
    if (!userNameEl || !userTypeEl) return;

    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("user") || "null");
    } catch (error) {
      user = null;
    }

    if (!user) return;

    const displayName =
      [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
      user.email ||
      "User";
    const displayRole = user.role
      ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
      : "User";

    userNameEl.textContent = displayName;
    userTypeEl.textContent = displayRole;
  }

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

  ensureSidebarLinks(sidebar);
  enforceSidebarRoleVisibility(sidebar);
  hydrateSidebarUser();

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
