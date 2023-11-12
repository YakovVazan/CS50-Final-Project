import { codeColors } from "./codeColors.js";
import { createNotification } from "./notifications.js";
import { fetchData } from "./postsForeward.js";
import { createToast } from "./toasts.js";

// Use AJAX to send message content to backend
export function deliverData(animationClass) {
  // show spinner
  document.querySelector("#sender").style.display = "none";
  document.querySelector("#spinner").style.display = "block";
  sendButton.disabled = true;

  let textArea = document.getElementById("text-area");
  // Keep focus on the text area
  textArea.focus();
  let inputData = textArea.value;

  // Prevent sending an empty message
  if (inputData === "") {
    // hide spinner
    document.querySelector("#sender").style.display = "block";
    document.querySelector("#spinner").style.display = "none";
    sendButton.disabled = false;
    return;
  }

  fetch("/has_social_accounts")
    .then((reponse) => reponse.json())
    .then((data) => {
      if (data === 0) {
        // hide spinner
        document.querySelector("#sender").style.display = "block";
        document.querySelector("#spinner").style.display = "none";
        sendButton.disabled = false;
        
        createToast(
          "You must log into at least one social media account before posting from SocialHub.",
          codeColors["error"]
        );
        createNotification(
          "You must log into at least one social media account before posting from SocialHub.",
          codeColors["error"]
        );
      } else {
        // Create http request from front to back
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "/process_data", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4 && xhr.status === 200) {
            // Fetch the updated data back to the front
            fetchData(animationClass);

            // Empty the text-area
            textArea.value = "";
          }
        };

        // Prepare and send data from front to back
        let data = JSON.stringify({
          data: inputData,
        });
        xhr.send(data);
      }
    });
}

let sendButton = document.querySelector("#send-button");
if (sendButton) {
  sendButton.addEventListener("click", deliverData("animated-new-post"));
}

// Prevent message-form from refreshing after submition
let messageForm = document.getElementById("message-form");
if (messageForm) {
  messageForm.addEventListener("submit", function (event) {
    event.preventDefault();
    deliverData("animated-new-post");
  });
}
