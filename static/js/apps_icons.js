import { createToast } from "./toasts.js";
import { createNotification } from "./notifications.js";
import { codeColors } from "./codeColors.js";

document.addEventListener("DOMContentLoaded", function () {
  // Collect all apps by name
  const elements = document.querySelectorAll(".app-name ");
  const innerTextArray = [];
  elements.forEach((element) => {
    const innerText = element.textContent.trim();
    innerTextArray.push(innerText);
  });

  // Collect user's input from search bar
  let searchField = document.querySelector("#search-field");
  if (searchField) {
    searchField.addEventListener("input", function (event) {
      let searchFieldValue = event.target.value.toLowerCase();

      // Control magnifier icon appearance
      let svgContainer = document.querySelector(".svg-container");
      if (searchFieldValue) {
        svgContainer.style.display = "none";
      } else {
        svgContainer.style.display = "";
      }

      // Filters apps according to the value in the search box
      let iconsList = document.querySelectorAll(
        ".col-6.col-sm-4.col-md-3.col-lg-2"
      );
      iconsList.forEach((item) => {
        if (!item.innerText.toLowerCase().includes(searchFieldValue)) {
          item.style.display = "none";
        } else {
          item.style.display = "";
        }
      });
    });
  }

  // Apply JS on Social Icons
  const socialButtons = document.querySelectorAll(".social-button");
  socialButtons.forEach((btn) => {
    // Add event listeners
    btn.addEventListener("mousedown", applyClickEffect);
    btn.addEventListener("mouseup", removeClickEffect);
    btn.addEventListener("touchstart", applyClickEffect);
    btn.addEventListener("touchend", removeClickEffect);
    btn.addEventListener("keydown", applyClickEffect);

    // Add class
    btn.classList.add("btn");

    // Add bootstrap properties
    btn.style.setProperty("--bs-btn-padding-x", "0");
    btn.style.setProperty("--bs-btn-padding-y", "0");
    btn.style.setProperty("--bs-btn-border-width", "0");
  });

  // Handle click and touch on icon
  function applyClickEffect(event) {
    const button = event.target;
    button.classList.add("clicked-button");
    searchField.value = "";
  }

  // Handle unclick and untouch on icon
  function removeClickEffect(event) {
    const button = event.target;
    button.classList.remove("clicked-button");
  }

  // Log out of owned apps
  let ownedAppIcons = document.querySelectorAll(".owned-app-logout");
  if (ownedAppIcons) {
    ownedAppIcons.forEach((btn) => {
      btn.addEventListener("click", () => {
        fetch("./apps_logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(btn.parentElement.getAttribute("value")),
        })
          .then(() => {
            createToast("Logged Out Successfully!", codeColors["success"]);
            createNotification(
              "Logged Out Successfully!",
              codeColors["success"]
            );

            setTimeout(() => {
              window.location.reload();
            }, 2000);
          })
          .catch((error) => {
            createToast("Error Logging Out.", codeColors["error"]);
            createNotification("Error Logging Out.", codeColors["error"]);
            console.error("Error:", error);
          });
      });
    });
  }

  // App icons on chat window
  let appsCheckbox = document.querySelector("#apps-checkbox");
  if (appsCheckbox) {
    // Get owned apps
    fetch("/owned_apps")
      .then((response) => response.json())
      .then((owned_apps) => {
        // An array to push all app icons inside of
        let content = [];

        // Get apps data
        fetch("/apps_data")
          .then((res) => res.json())
          .then((apps_data) => {
            apps_data.forEach((app_data) => {
              owned_apps.forEach((owned_app) => {
                if (app_data["name"] === owned_app["name"]) {
                  let appIcon = `
                  <img id="app-icon-for-chat-window" src=${app_data["src"]} class="rounded-5" alt="${app_data["name"]}">
                  `;
                  content.push(appIcon);
                  appsCheckbox.innerHTML = content.join(" ");
                }
              });
            });
          });
      })
      .catch((error) => {
        console.log(error);
        createToast("Error fetching app icons", codeColors["error"]);
        createNotification("Error fetching app icons", codeColors["error"]);
      });
  }
});
