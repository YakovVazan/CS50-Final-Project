import { createToast } from "./toasts.js";
import { createNotification } from "./notifications.js";
import { codeColors } from "./codeColors.js";
import { passwordLength } from "./registrationLogics.js";

let submitButton = document.querySelector("#submit-personal-changes");

// set stats for accout_center
if (document.querySelector("#account-center-block")) {
  // Fetch current user details
  fetch("/get_current_user_details")
    .then((response) => response.json())
    .then((data) => {
      // Fetch details for the specific user using the retrieved ID
      fetch(`/account_center/${data.id}`)
        .then((res) => res.json())
        .then((details) => {
          // turn off spinners
          document.querySelectorAll(".stats-spinner").forEach((spinner) => {
            spinner.style.display = "none";
          });

          // Update the total posts count
          document.querySelector("#total-posts").innerHTML =
            details.posts[0]["COUNT(*)"];

          // Update the total scheduled posts count
          document.querySelector("#total-scheduled-posts").innerHTML =
            details.scheduled_posts[0]["COUNT(*)"];
        });
    });
}

// edit personal details in account_center
if (submitButton) {
  // name
  let oldName = document.querySelector("#username").innerHTML,
    newName = oldName;
  // catch old name
  document.querySelector("#update-name").value = oldName;
  // catch new name
  document.querySelector("#update-name").addEventListener("input", (event) => {
    newName = event.target.value;
  });

  // email
  let oldEmail = document.querySelector("#user_email").innerHTML,
    newEmail = oldEmail;
  // catch old email
  document.querySelector("#update-email").value = oldEmail;
  // catch new email
  document.querySelector("#update-email").addEventListener("input", (event) => {
    newEmail = event.target.value;
  });

  // old password
  let oldPassword = "";
  document
    .querySelector("#update-old-password")
    .addEventListener("input", (event) => {
      oldPassword = event.target.value;
    });

  // new password
  let newPassword = "";
  document
    .querySelector("#update-new-password")
    .addEventListener("input", (event) => {
      newPassword = event.target.value;
    });

  // confirm new password
  let confirmNewPassword = "";
  document
    .querySelector("#update-confirm-new-password")
    .addEventListener("input", (event) => {
      confirmNewPassword = event.target.value;
    });

  // Send new details to back end to be updated
  submitButton.addEventListener("click", () => {
    if (newPassword !== confirmNewPassword) {
      createToast("New passwords not matching", codeColors["error"]);
      createNotification("New passwords not matching", codeColors["error"]);
    } else if (newPassword !== "" && newPassword.length < 6) {
      createToast(
        `Password must contain at least ${passwordLength} characters`,
        codeColors["info"]
      );
      createNotification(
        `Password must contain at least ${passwordLength} characters`,
        codeColors["info"]
      );
    } else if (oldPassword === "") {
      createToast("Enter your current password", codeColors["info"]);
      createNotification("Enter your current password", codeColors["info"]);
    } else {
      // Establish connection to back end
      let xhr = new XMLHttpRequest();
      xhr.open("POST", "/update_personal_details", true);
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          let response = JSON.parse(xhr.responseText);

          createToast(response["message"], codeColors[response["codeColor"]]);
          createNotification(
            response["message"],
            codeColors[response["codeColor"]]
          );

          if (response["message"] === "Details updated successfully!") {
            setTimeout(() => {
              location.reload();
            }, 2000);
          }
        }
      };

      let data = JSON.stringify({
        name: newName,
        email: newEmail,
        oldPassword: oldPassword,
        newPassword: newPassword,
      });
      xhr.send(data);
    }
  });
}
