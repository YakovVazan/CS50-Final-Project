import { createToast } from "./toasts.js";
import { createNotification } from "./notifications.js";
import { codeColors } from "./codeColors.js";

let socialMediaLoginForm = document.querySelector("#social-media-login-form");

if (socialMediaLoginForm) {
  let appName = socialMediaLoginForm.getAttribute("action").split("/").pop();
  appName = appName.charAt(0).toUpperCase() + appName.slice(1);

  socialMediaLoginForm.addEventListener("submit", (event) => {
    // Delay form submission for toast and notification's sake
    event.preventDefault();

    createToast(
      `${appName} has been successfully added to SocialHub!`,
      codeColors["success"]
    );
    createNotification(
      `${appName} has been successfully added to SocialHub!`,
      codeColors["success"]
    );

    setTimeout(() => {
      event.target.submit();
    }, 2000);
  });
}
