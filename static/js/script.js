document.addEventListener("DOMContentLoaded", function () {
  // Get the HTML tag
  let root = document.documentElement;

  // Set the entire page's theme the previous one
  root.setAttribute("data-bs-theme", localStorage.getItem("theme"));

  // Change theme with ctrl + 'M' key-press
  document.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.key === "m") {
      if (root.getAttribute("data-bs-theme") == "light") {
        localStorage.setItem("theme", "dark");
      } else {
        localStorage.setItem("theme", "light");
      }
      root.setAttribute("data-bs-theme", localStorage.getItem("theme"));
      handleTheme();
    }
  });

  // Theme components
  let themeSvgIcon = document.querySelector("#theme-svg-icon");
  let themePath = document.querySelector("#theme-path");
  handleTheme();

  // Get a hold on the theme buttons
  let themeButtons = document.getElementsByClassName("theme_button");

  // Add an event listener to each of them
  Array.from(themeButtons).forEach(function (element) {
    element.addEventListener("click", function (event) {
      // Update the local storage
      localStorage.setItem("theme", event.target.textContent.toLowerCase());
      // Update the page's theme
      root.setAttribute("data-bs-theme", localStorage.getItem("theme"));

      handleTheme();
    });
  });

  // Clear local storage once logged out - COMMENTED OUT FOR NOW
  let logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      // localStorage.clear();
    });
  }

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

  // Update theme icon
  function handleTheme() {
    if (localStorage.getItem("theme") == "dark") {
      themeSvgIcon.classList.remove("bi-moon");
      themeSvgIcon.classList.add("bi-brightness-high");
      themePath.setAttribute(
        "d",
        "M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"
      );
    } else {
      themeSvgIcon.classList.remove("bi-brightness-high");
      themeSvgIcon.classList.add("bi-moon");
      themePath.setAttribute(
        "d",
        "M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278zM4.858 1.311A7.269 7.269 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.316 7.316 0 0 0 5.205-2.162c-.337.042-.68.063-1.029.063-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286z"
      );
    }
  }

  let messagesArea = document.getElementById("messages-area");
  if (messagesArea) {
    fetchData();
  }

  let sendButton = document.querySelector("#send-button");
  if (sendButton) {
    sendButton.addEventListener("click", deliverData("animated-new-post"));
  }

  // Use AJAX to send message content to backend
  function deliverData(animationClass) {
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

  // Bring back updated messages data from back to front
  function fetchData(animationClass) {
    fetch("/get_data")
      .then((response) => response.json())
      .then((messages) => {
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

            // Parse the date string into a Date object
            let dateObj = new Date(dateString);
            // Format the month name using the Date object
            dateString[0] = dateObj.toLocaleString("default", {
              month: "short",
            });
            // Final version of date
            dateString = dateString[0] + " " + dateString[1];
            // Add date header in chat
            content.push(`<div id="date-container">
                <span id="date-bubble">${dateString}</span>
              </div>`);
            // Update current date value
            previousDateString = messages[i]["date"];
          }
          // Add next message content
          content.push(`<span>
                          <span id="message-bubble" class="px-4 rounded-5 ${
                            // Add lastly-posted post to the array separately WITH animation class
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
        document
          .querySelectorAll("#scheduled-clock-icon")
          .forEach((element) => {
            element.classList.add("animated-icon");
            element.style.cursor = "pointer";
            element.addEventListener("mousedown", function () {
              const id = this.getAttribute("data-id"); // Get the id from a data attribute
              const scheduledElement = document.getElementById(id);

              if (scheduledElement) {
                scheduledElement.style.display = ""; // Show the scheduled element
              }
            });

            element.addEventListener("mouseup", function () {
              const id = this.getAttribute("data-id"); // Get the id from a data attribute
              const scheduledElement = document.getElementById(id);

              if (scheduledElement) {
                scheduledElement.style.display = "none"; // Hide the scheduled element
              }
            });
          });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }

  // Prevent message-form from refreshing after submition
  let messageForm = document.getElementById("message-form");
  if (messageForm) {
    messageForm.addEventListener("submit", function (event) {
      event.preventDefault();
      deliverData("animated-new-post");
    });
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
      if (dateInput != ":00" && inputField.value != "") {
        alert(`You scheduld: ${inputField.value}\nto: ${dateInput}`);
        dactivateModal();
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
        alert("Impossible to schedule a post without all fields filled.");
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

  // TODO: Edit posts
  let editButtons = document.querySelectorAll(".edit-button");
  if (editButtons) {
    editButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        console.log("Make it editable.");
      });
    });
  }

  // Cancel posts
  let cancelButtons = document.querySelectorAll(".cancel-button");
  if (cancelButtons) {
    cancelButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        deleteScheduledPost(btn);
      });
    });
  }

  // Scheduled posts visuals-deleter
  function deleteScheduledPost(btn) {
    let row = btn.parentElement.parentElement;
    // Get the post ID from the data attribute
    let postId = row.getAttribute("post-id");

    // Send a request to the server to delete the post from the data base
    fetch("/delete_scheduled_posts", {
      method: "POST",
      body: JSON.stringify({ postId: postId, isScheduleTime: false }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          row.remove();
          showUpToDateScreen();
        }
      })
      .catch((error) => {
        console.error("An error occurred:", error);
      });
  }

  // Get scheduled Posts
  async function getScheduledPosts() {
    try {
      const response = await fetch("/get_scheduled_posts");
      const scheduled_posts = await response.json();
      return scheduled_posts;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  // Control what shows on the screen after deletion
  function showUpToDateScreen() {
    if (document.querySelector(".schedule_area")) {
      getScheduledPosts()
        .then((scheduled_posts) => {
          if (scheduled_posts.length > 0) {
            document.querySelector("#schedule_icon_pulse").style.display = "";

            // Display scheduled posts' countdown
            let timeLeftElements = document.querySelectorAll(".time_left");
            for (let i = 0; i < timeLeftElements.length; i++) {
              // Calculate the countdown date for the current post
              const countdownDate = new Date(
                scheduled_posts[i]["execution_date"]
              ).getTime();

              // Initialize countdownInterval to null
              let countdownInterval = null;

              // Update the countdown for the current post
              function updateCountdown() {
                const now = new Date().getTime();
                const distance = countdownDate - now;

                // Calculate days, hours, minutes, and seconds
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor(
                  (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                );
                const minutes = Math.floor(
                  (distance % (1000 * 60 * 60)) / (1000 * 60)
                );
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                // If the countdown is not yet expired, display the countdown
                if (distance > 0) {
                  timeLeftElements[
                    i
                  ].innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
                } else {
                  // Send a request to the server to delete the post from the data base
                  fetch("/delete_scheduled_posts", {
                    method: "POST",
                    body: JSON.stringify({
                      postId:
                        timeLeftElements[i].parentElement.getAttribute(
                          "post-id"
                        ),
                      isScheduleTime: true,
                    }),
                    headers: {
                      "Content-Type": "application/json",
                    },
                  })
                    .then((response) => {
                      if (response.ok) {
                        showUpToDateScreen();
                      }
                    })
                    .catch((error) => {
                      console.error("An error occurred:", error);
                    });
                  clearInterval(countdownInterval);
                }
              }

              // Initial update before starting the interval
              updateCountdown();

              // Update the countdown every 1 second (1000 milliseconds) for the current post
              countdownInterval = setInterval(updateCountdown, 1000);
            }
          } else {
            document.querySelector("#schedule_icon_pulse").style.display =
              "none";

            if (document.querySelector("#scheduleds-page")) {
              let noScheduledPostsMessage = document.createElement("span");
              noScheduledPostsMessage.innerHTML = `<div class="container d-flex justify-content-center align-items-center h-100">
            <p class="bg-info m-3 p-3 rounded-5">Your scheduled posts will appear here once you schedule!</p>
                                                 </div>`;
              document.querySelector("table").remove();
              document
                .querySelector("#scheduleds-page")
                .appendChild(noScheduledPostsMessage);
            }
          }
        })
        .catch((error) => {
          console.error("Error in fetchData:", error);
        });
    }
  }
  showUpToDateScreen();
});
