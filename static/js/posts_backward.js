import { fetchData } from "./posts_foreward.js";

// Use AJAX to send message content to backend
export function deliverData(animationClass) {
  let textArea = document.getElementById("text-area");
  // Keep focus on the text area
  textArea.focus();
  let inputData = textArea.value;

  // Prevent sending an empty message
  if (inputData === "") {
    return;
  }

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
