import { requestDeletion } from "./deletion.js";
import { fetchData } from "./posts_foreward.js";
import { getNotifications } from "./notifications.js";
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
  fetch("/first_entrance_notification")
    .then((response) => response.json())
    .then((details) => {
      if (details["first_entrance"]) {
        createToast(
          `It's good to see you, ${details["username"]}!`,
          codeColors["info"]
        );

        // Update db
        let data = {
          first_entrance: false,
        };
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "/not_first_entrance", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(data));
      }
    });
}
