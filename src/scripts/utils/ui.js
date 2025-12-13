export function showLoading(element, message = null) {
  if (!element) return;

  // Check if loader already exists
  let overlay = element.querySelector(".loading-overlay");

  if (overlay) {
    if (message) {
      let msg = overlay.querySelector(".loading-text");
      if (!msg) {
        msg = document.createElement("div");
        msg.className = "loading-text";
        msg.style.marginLeft = "10px";
        msg.style.fontWeight = "500";
        msg.style.color = "#718096";
        overlay.appendChild(msg);
      }
      msg.textContent = message;
    }
    return;
  }

  const originalPosition = window.getComputedStyle(element).position;
  if (originalPosition === "static") {
    element.style.position = "relative";
    element.dataset.originalPosition = "static";
  }

  overlay = document.createElement("div");
  overlay.className = "loading-overlay";

  const spinner = document.createElement("div");
  spinner.className = "spinner";

  overlay.appendChild(spinner);

  if (message) {
    const msg = document.createElement("div");
    msg.className = "loading-text";
    msg.textContent = message;
    msg.style.marginLeft = "10px";
    msg.style.fontWeight = "500";
    msg.style.color = "#718096";
    overlay.appendChild(msg);
  }

  element.appendChild(overlay);
}

export function hideLoading(element) {
  if (!element) return;
  const overlay = element.querySelector(".loading-overlay");
  if (overlay) {
    overlay.remove();
  }

  if (element.dataset.originalPosition === "static") {
    element.style.position = "";
    delete element.dataset.originalPosition;
  }
}

export function setBtnLoading(button, isLoading, loadingText = null) {
  if (!button) return;

  if (isLoading) {
    if (!button.dataset.originalText) {
      button.dataset.originalText = button.textContent;
    }
    button.disabled = true;

    if (loadingText) {
      button.textContent = loadingText;
    } else {
      button.classList.add("btn-loading");
    }
  } else {
    button.disabled = false;
    button.classList.remove("btn-loading");
    if (button.dataset.originalText) {
      button.textContent = button.dataset.originalText;
    }
  }
}

export function showNotification(message, type = "success") {
  const existing = document.querySelector(".notification");
  if (existing) {
    existing.remove();
  }

  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  const isSuccess = type === "success";

  notification.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.95rem;
    z-index: 10000;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    background: ${
      isSuccess
        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        : "#e53e3e"
    };
    color: white;
    max-width: 400px;
    animation: slideIn 0.3s ease-out;
  `;

  if (!document.getElementById("notification-styles")) {
    const style = document.createElement("style");
    style.id = "notification-styles";
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
      `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-in forwards";
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}
