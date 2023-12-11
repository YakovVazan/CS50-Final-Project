import { codeColors } from "./codeColors.js";
import { createNotification } from "./notifications.js";
import { createToast } from "./toasts.js";

let editButtons = document.querySelectorAll(".edit-button");
if (editButtons) {
  editButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelector("#edited-post-content").value =
        btn.parentElement.parentElement.parentElement.children[0].children[0].innerHTML;
      document.querySelector("#edited-post-date").value =
        btn.parentElement.parentElement.parentElement.children[1].innerHTML;

      repost(btn.parentElement.parentElement.getAttribute("post-id"));
    });
  });
}

function repost(postId) {
  let submitButton = document.querySelector("#edited-post-submit");
  if (submitButton) {
    // Collcet initial values
    let newValue = document.querySelector("#edited-post-content").value;
    let newDate =
      document.querySelector("#edited-post-date").value.replace(/T/g, " ") +
      ":00";

    // Collect new values dynamically
    document
      .querySelector("#edited-post-content")
      .addEventListener("input", (event) => {
        newValue = event.target.value;
      });

    document
      .querySelector("#edited-post-date")
      .addEventListener("input", (event) => {
        newDate = event.target.value.replace(/T/g, " ") + ":00";
      });

    // Update changes in Data base
    document
      .querySelector("#reposting-form")
      .addEventListener("submit", (event) => {
        event.preventDefault();
        // Create http request from front to back for SQL
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "/edit_scheduled_post", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

        // Prepare and send data from front to back
        let data = JSON.stringify({
          content: newValue,
          date: newDate,
          postId: postId,
        });
        xhr.send(data);

        // Close modal
        document.querySelector("#edited-post-close").click();

        createToast("Post was edited successfully!", codeColors["success"]);
        createNotification(
          "Post was edited successfully!",
          codeColors["success"]
        );

        // Submit changes
        setTimeout(() => {
          event.target.submit();
        }, 2000);
      });
  }
}
