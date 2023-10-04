import { createToast } from "./toasts.js";
import { createNotification } from "./notifications.js";
import { codeColors } from "./codeColors.js";
import { handleSchedulingIconsAndPosts } from "./dynamic_table.js";

// Cancel posts
let cancelButtons = document.querySelectorAll(".cancel-button");
if (cancelButtons) {
  cancelButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      deleteScheduledPost(btn);
    });
  });
}

// Scheduled posts deleter
function deleteScheduledPost(btn) {
  let row = btn.parentElement.parentElement;
  // Get the post ID from the data attribute
  let postId = row.getAttribute("post-id");

  requestDeletion(postId, false, row);
}

// Send a request to the server to delete the post from the data base
export function requestDeletion(postId, isScheduleTime, row) {
  fetch("/delete_scheduled_posts", {
    method: "POST",
    body: JSON.stringify({ postId: postId, isScheduleTime: isScheduleTime }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        if (row) {
          row.remove();
        }
        if (isScheduleTime) {
          createToast("Your scheduled post was just posted!", codeColors["info"]);
          createNotification(
            "Your scheduled post was just posted!",
            codeColors["info"]
          );
        }
        handleSchedulingIconsAndPosts();
      }
    })
    .catch((error) => {
      console.log(error);
      createToast(`An error occurred:<br>${error}`, codeColors["error"]);
      createNotification(`An error occurred:<br>${error}`, codeColors["error"]);
    });
}
