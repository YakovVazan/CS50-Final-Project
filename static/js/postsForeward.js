import { createToast } from "./toasts.js";
import { createNotification } from "./notifications.js";
import { codeColors } from "./codeColors.js";

const shortMonthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Bring back updated messages data from back to front
export function fetchData(animationClass) {
  fetch("/get_data")
    .then((response) => response.json())
    .then((messages) => {
      // hide spinner
      document.querySelector("#sender").style.display = "block";
      document.querySelector("#spinner").style.display = "none";
      document.querySelector("#send-button").disabled = false;

      // An array to push all posts inside of
      let content = [];
      // Keep track of dates for date bubble in chat
      let previousDateString = "";

      // Process the received data
      for (let i = 0; i < messages.length; i++) {
        // Collect current post's date
        let dateString = messages[i]["date"].split("-");

        // Check for same or different date
        if (messages[i]["date"] !== previousDateString) {
          // Create a new date bubble:

          // Add date header in chat
          content.push(`<div id="date-container">
                <span id="date-bubble">${
                  shortMonthNames[dateString[0] - 1] + " " + dateString[1]
                }</span>
              </div>`);
          // Update current date value
          previousDateString = messages[i]["date"];
        }
        // Add next message content
        content.push(`<span>
                          <span id="message-bubble" class="px-4 rounded-5 ${
                            // Add lastly-posted post to the array WITH animation class
                            i === messages.length - 1 ? animationClass : ""
                          }">
                          <div id="message-content"><span>${
                            // Preserve new-line from original text
                            messages[i]["content"].replace(/\n/g, "<br>")
                          }</span></div>
                          <div id="message-bubble-time">
                            ${
                              messages[i]["is_scheduled"] === 1
                                ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                                    class="bi bi-clock-history" viewBox="0 0 16 16" style="margin-right: 0.5em;"
                                    data-id=${messages[i]["id"]} id="scheduled-clock-icon">
                                    <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.79a6.99 6.99 0 0 0-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 0 0-.214-.468l.893-.45a7.976 7.976 0 0 1 .45 1.088l-.95.313a7.023 7.023 0 0 0-.179-.483zm.53 2.507a6.991 6.991 0 0 0-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c.033-.17.06-.339.081-.51l.993.123a7.957 7.957 0 0 1-.23 1.155l-.964-.267c.046-.165.086-.332.12-.501zm-.952 2.379c.184-.29.346-.594.486-.908l.914.405c-.16.36-.345.706-.555 1.038l-.845-.535zm-.964 1.205c.122-.122.239-.248.35-.378l.758.653a8.073 8.073 0 0 1-.401.432l-.707-.707z" />
                                    <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z" />
                                    <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z" />
                                    </svg>`
                                : ""
                            }
                            <p class="text-muted" style="margin-bottom: 0;">${
                              messages[i]["time"]
                            }</p>
                          </div>
                          ${
                            // Details for scheduled posts
                            messages[i]["is_scheduled"] === 1
                              ? `<span id=${messages[i]["id"]} class="text-muted" style="display: none">
                                  This post was originally scheduled at ${messages[i]["schedule_date"]}
                                 </span>`
                              : ""
                          }
                        </span>
                      </span>
                    `);
      }

      if (messagesArea) {
        // Deal with user without history of messages
        messagesArea.innerHTML =
          content.length > 0
            ? // Convert array of HTML element into a one long string
              content.join(" ")
            : `<div id="no-history-message">
                  <p class="bg-info m-3 p-3 rounded-5">Your histroy posts will appear here once you post!</p>
               </div>`;

        // Scroll to bottom of messages on load
        messagesArea.scrollTop = messagesArea.scrollHeight;
      }

      // Show schedule details when clicking clock icon
      document.querySelectorAll("#scheduled-clock-icon").forEach((element) => {
        element.classList.add("animated-icon");
        element.style.cursor = "pointer";
        element.addEventListener("click", function () {
          const id = this.getAttribute("data-id"); // Get the id from a data attribute
          const scheduledElement = document.getElementById(id);

          if (scheduledElement) {
            let displayStatus = scheduledElement.style.display;
            scheduledElement.style.display = displayStatus === "" ? "none" : "";
          }
        });
      });

      // Zero posts filter
      if (document.getElementById("filter-posts")) {
        document.getElementById("filter-posts").value = 0;
      }
    })
    .catch((error) => {
      console.log("Error fetching data:", error);
      createToast(`Error fetching data:<br>${error}`, codeColors["error"]);
      createNotification("Check the console for details.", codeColors["error"]);
    });
}

let messagesArea = document.getElementById("messages-area");
if (messagesArea) {
  fetchData();
}
