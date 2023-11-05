import { createToast } from "./toasts.js";
import { codeColors } from "./codeColors.js";

export const passwordLength = 6;

let registrationForm = document.querySelector("#registration-form");
let passwordRegistration = document.querySelector(".password-registration");
let registrationFormSubmittionButton = document.querySelector(
  "#registration-form-submittion-button"
);

if (registrationForm) {
  registrationFormSubmittionButton.addEventListener("click", () => {
    if (passwordRegistration.value.length < passwordLength) {
      registrationForm.addEventListener("submit", (e) => {
        e.preventDefault();
      });

      createToast(
        `Password must contain at least ${passwordLength} characters`,
        codeColors["info"]
      );
    } else {
      registrationForm.submit();
    }
  });
}
