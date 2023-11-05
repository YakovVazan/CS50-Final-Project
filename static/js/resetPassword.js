import { createToast } from "./toasts.js";
import { codeColors } from "./codeColors.js";

let resetPasswordModal = document.querySelector("#reset-password-button");

if (resetPasswordModal) {
  resetPasswordModal.addEventListener("click", () => {
    let email = document.querySelector("#email").value;

    fetch("./update_password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(email),
    })
      .then((response) => response.json())
      .then((responseText) => {
        createToast(
          responseText["message"],
          codeColors[responseText["codeColor"]]
        );
      })
      .catch((error) => {
        console.error("Error", error);
      });
  });
}
