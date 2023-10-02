import { createToast } from "./toasts.js";
import { createNotification } from "./notifications.js";

let telegramLoginForm = document.querySelector("#telegram-login-form");

if (telegramLoginForm) {
  telegramLoginForm.addEventListener("submit", (event) => {
    // Delay form submission for toast and notification's sake
    event.preventDefault();

    createToast("Telegram has been successfully added to SocialHub!");
    createNotification(
      "Telegram has been successfully added to SocialHub!",
      "#ffc107"
    );

    setTimeout(() => {
      event.target.submit();
    }, 2000);
  });
}
