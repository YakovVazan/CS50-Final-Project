import { createToast } from "./toasts.js";
import { createNotification } from "./notifications.js";
import { codeColors } from "./codeColors.js";

let telegramLoginForm = document.querySelector("#telegram-login-form");

if (telegramLoginForm) {
  telegramLoginForm.addEventListener("submit", (event) => {
    // Delay form submission for toast and notification's sake
    event.preventDefault();

    createToast(
      "Telegram has been successfully added to SocialHub!",
      codeColors["info"]
    );
    createNotification(
      "Telegram has been successfully added to SocialHub!",
      codeColors["info"]
    );

    setTimeout(() => {
      event.target.submit();
    }, 2000);
  });
}
