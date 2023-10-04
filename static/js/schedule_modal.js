import { deliverData } from "./posts_backward.js";
import { createToast } from "./toasts.js";
import { createNotification } from "./notifications.js";
import { codeColors } from "./codeColors.js";

let sendButton = document.querySelector("#send-button");
// Schedule sending messages
let longClickTimer;
// Add event listeners for activating and deactivating modal
if (sendButton) {
  sendButton.addEventListener("mousedown", function () {
    if (document.getElementById("text-area").value) {
      sendButton.style.backgroundColor = "#dc3545";
      firstModalLoad = false;
      longClickTimer = setTimeout(activateModal, 1000);
    }
  });

  sendButton.addEventListener("mouseup", function () {
    sendButton.style.backgroundColor = "transparent";
    clearTimeout(longClickTimer);
  });

  sendButton.addEventListener("touchstart", function () {
    if (document.getElementById("text-area").value) {
      sendButton.style.backgroundColor = "#dc3545";
      firstModalLoad = false;
      longClickTimer = setTimeout(activateModal, 1000);
    }
  });

  sendButton.addEventListener("touchend", function () {
    sendButton.style.backgroundColor = "transparent";
    clearTimeout(longClickTimer);
  });
}

// Close modal
if (document.querySelector("#closeModal")) {
  document
    .querySelector("#closeModal")
    .addEventListener("click", dactivateModal);
}
// Submit modal
if (document.querySelector("#submitModal")) {
  document.querySelector("#submitModal").addEventListener("click", () => {
    let dateInput =
      document.querySelector("#dateInput").value.replace(/T/g, " ") + ":00";
    if (
      dateInput != ":00" &&
      inputField.value != "" &&
      new Date(dateInput) > new Date()
    ) {
      // Toast post scheduled
      createToast("Your post was scheduled successfully!", codeColors["success"]);
      createNotification(
        "Your post was scheduled successfully!",
        codeColors["success"]
      );

      dactivateModal();
      document
        .querySelector("#schedule_icon")
        .classList.remove("animated-icon");
      textArea.value = "";

      // Create http request from front to back for SQL
      let xhr = new XMLHttpRequest();
      xhr.open("POST", "/schedule_post", true);
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

      // Prepare and send data from front to back
      let data = JSON.stringify({
        content: inputField.value,
        date: dateInput,
      });
      xhr.send(data);
      document.querySelector("#schedule_icon_pulse").style.display = "";
    } else {
      createToast(
        "Impossible to schedule a post without all fields filled with legal valus.",
        codeColors["error"]
      );
      createNotification(
        "Impossible to schedule a post without all fields filled with legal valus.",
        codeColors["error"]
      );
    }
  });
}

let firstModalLoad = true;
function activateModal() {
  sendButton.style.backgroundColor = "transparent";
  document.querySelector(".modal").style.display = "flex";

  // Copy already-inputed text to the schedule modal content
  if (document.querySelector("#inputField")) {
    let inputField = document.querySelector("#inputField");
    inputField.value = document.getElementById("text-area").value;

    // Prevent going to new line after Enter long press for opening modal
    inputField.addEventListener("keydown", (event) => {
      if (firstModalLoad && event.key === "Enter") {
        event.preventDefault();
      }
    });
    inputField.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        firstModalLoad = false;
      }
    });
    // Grand the focus to the modal's input field
    document.getElementById("text-area").blur();
    inputField.focus();
  }

  // Decativate with Escape key
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      dactivateModal();
    }
  });
}

function dactivateModal() {
  firstModalLoad = true;
  document.querySelector(".modal").style.display = "none";
  // Grand the focus to the post's input field
  document.getElementById("text-area").focus();
  inputField.blur();
}

// Enter key for posting and scheduling
let textArea = document.getElementById("text-area");
if (textArea) {
  let setTimeoutClearer;
  let firstKeyPress = true;
  let longPressTimeout = false;

  textArea.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      // Prevent the default Enter key behavior (new line)
      event.preventDefault();
      if (firstKeyPress && textArea.value) {
        // Collect only first input when user presses the Enter key for a long time
        firstKeyPress = false;
        sendButton.style.backgroundColor = "#dc3545";
        // Detect long press
        setTimeoutClearer = setTimeout(function () {
          activateModal();
          longPressTimeout = true;
        }, 1000);
      }
    }
  });

  textArea.addEventListener("keyup", function (event) {
    sendButton.style.backgroundColor = "transparent";
    // Go to new line when enter is pressed along with shift
    if (event.key === "Enter" && event.shiftKey) {
      textArea.value += "\n";
    } else {
      if (event.key === "Enter") {
        if (longPressTimeout) {
          // Continue to activateModal when enter-key was pressed for a second or more
          activateModal();
        } else {
          // Continue to deliverData when enter-key was pressed for a less than a second
          deliverData("animated-new-post");
        }
      }
    }
    // Zero trackers
    firstKeyPress = true;
    longPressTimeout = false;
    clearTimeout(setTimeoutClearer);
  });
}
