import { socket } from "./socketio_init.js";

export function createToast(message, codeColor) {
  let toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("id", "notificationToast");
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");

  toast.innerHTML = `
    <div class="toast-header">
      <svg width="25" height="25">
        <circle cx="12.5" cy="12.5" r="8" fill=${codeColor} />
      </svg>
      <strong class="ms-auto px-1 bg-danger text-warning rounded-3 ">SocialHub</strong>
    </div>
    <div class="toast-body">
      ${message}
    </div>`;

  let toastContainer = document.querySelector(".toast-container");
  toastContainer.appendChild(toast);

  let toastInstance = new bootstrap.Toast(toast);

  toastInstance.show();
}

// Generating toasts directly from backend using socketIO
socket.on("generate_toast", function (data) {
  createToast(data.message, data.codeColor);
});
