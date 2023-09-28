import { requestDeletion } from "./deletion.js";
import { fetchData } from "./posts_foreward.js";

// Render in live scheduled posts to chat window
function controlCountdowns() {
  if (
    document.querySelector(".schedule_area") &&
    !document.querySelector("#scheduleds-page")
  ) {
    const currentDate = new Date();
    const seconds = currentDate.getSeconds();

    // Call API only every beggining of a minute
    if (seconds === 0) {
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
              }, 100);
            }
          });
        });
    }
  }
}

// Start tracking for rendering scheduled posts
controlCountdowns();
setInterval(() => {
  controlCountdowns();
}, 1000);
