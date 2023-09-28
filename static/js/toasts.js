export function createToast(message) {
  let toast = document.createElement("div");
  toast.className = "toast";
  toast.setAttribute("id", "notificationToast");
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");

  toast.innerHTML = `
    <div class="toast-header">
      <strong class="me-auto px-1 bg-danger text-warning rounded-3 ">SocialHub</strong>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      ${message}
    </div>`;

  let toastContainer = document.querySelector(".toast-container");
  toastContainer.appendChild(toast);

  let toastInstance = new bootstrap.Toast(toast);

  toastInstance.show();
}
