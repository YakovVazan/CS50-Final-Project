import { requestDeletion } from "./deletion.js";
import { fetchData } from "./postsForeward.js";
import { createNotification, getNotifications } from "./notifications.js";
import { createToast } from "./toasts.js";
import { codeColors } from "./codeColors.js";

// Render in live scheduled posts to chat window
function controlCountdowns() {
  if (
    document.querySelector(".schedule_area") &&
    !document.querySelector("#scheduleds-page")
  ) {
    fetch("/get_scheduled_posts")
      .then((response) => response.json())
      .then((data) => {
        data.forEach((x) => {
          const currentDate = new Date();

          const year = currentDate.getFullYear();
          const month = String(currentDate.getMonth() + 1).padStart(2, "0");
          const day = String(currentDate.getDate()).padStart(2, "0");

          const hours = String(currentDate.getHours()).padStart(2, "0");
          const minutes = String(currentDate.getMinutes()).padStart(2, "0");
          const seconds = String(currentDate.getSeconds()).padStart(2, "0");

          const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

          if (formattedTime === x["execution_date"]) {
            requestDeletion(x["id"], true, "");

            // Delay so the DB will get time to update
            setTimeout(() => {
              if (document.querySelector("#chat-window")) {
                fetchData("animated-new-post");
              } else {
                fetchData();
              }
            }, 2000);
          }
        });
      });
  }
}

// Start tracking for rendering scheduled posts and for updating dates of notifications
controlCountdowns();
setInterval(() => {
  const currentDate = new Date();
  const seconds = currentDate.getSeconds();

  // Call API only every beggining of a minute
  if (seconds === 0) {
    controlCountdowns();
    getNotifications();
  }
}, 1000);

// Greet user when first entrace occurs
if (document.getElementById("main-block")) {
  fetch("/get_current_user_details")
    .then((response) => response.json())
    .then((currentUserDetails) => {
      if (localStorage.getItem("SocialHubFirstEntrance") === "true") {
        localStorage.setItem("SocialHubFirstEntrance", "false");
        createToast(
          `It's good to see you, ${currentUserDetails["username"]}!`,
          codeColors["info"]
        );
        createToast(
          `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cookie" viewBox="0 0 16 16">
            <path d="M6 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm4.5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm-.5 3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/>
            <path d="M8 0a7.963 7.963 0 0 0-4.075 1.114c-.162.067-.31.162-.437.28A8 8 0 1 0 8 0Zm3.25 14.201a1.5 1.5 0 0 0-2.13.71A7.014 7.014 0 0 1 8 15a6.967 6.967 0 0 1-3.845-1.15 1.5 1.5 0 1 0-2.005-2.005A6.967 6.967 0 0 1 1 8c0-1.953.8-3.719 2.09-4.989a1.5 1.5 0 1 0 2.469-1.574A6.985 6.985 0 0 1 8 1c1.42 0 2.742.423 3.845 1.15a1.5 1.5 0 1 0 2.005 2.005A6.967 6.967 0 0 1 15 8c0 .596-.074 1.174-.214 1.727a1.5 1.5 0 1 0-1.025 2.25 7.033 7.033 0 0 1-2.51 2.224Z"/>
           </svg>
           <p id="cookie-msg">This website uses cookies to allow normal data flow and efficient user experience.</p>`,
          codeColors["info"]
        );
        createNotification(
          `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cookie" viewBox="0 0 16 16">
            <path d="M6 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm4.5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm-.5 3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/>
            <path d="M8 0a7.963 7.963 0 0 0-4.075 1.114c-.162.067-.31.162-.437.28A8 8 0 1 0 8 0Zm3.25 14.201a1.5 1.5 0 0 0-2.13.71A7.014 7.014 0 0 1 8 15a6.967 6.967 0 0 1-3.845-1.15 1.5 1.5 0 1 0-2.005-2.005A6.967 6.967 0 0 1 1 8c0-1.953.8-3.719 2.09-4.989a1.5 1.5 0 1 0 2.469-1.574A6.985 6.985 0 0 1 8 1c1.42 0 2.742.423 3.845 1.15a1.5 1.5 0 1 0 2.005 2.005A6.967 6.967 0 0 1 15 8c0 .596-.074 1.174-.214 1.727a1.5 1.5 0 1 0-1.025 2.25 7.033 7.033 0 0 1-2.51 2.224Z"/>
           </svg>
           <p id="cookie-msg">This website uses cookies to allow normal data flow and efficient user experience.</p>`,
          codeColors["info"]
        );
      }
    });
}
