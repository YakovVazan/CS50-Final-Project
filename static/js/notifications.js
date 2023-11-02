export function createNotification(content, codeColor) {
  fetch("/manage_notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "CREATE",
      content: content,
      id: "",
      codeColor: codeColor,
    }),
  })
    .then((response) => response.json())
    .then(() => {
      getNotifications();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

export function getNotifications() {
  if (!document.querySelector("#entrance_card")) {
    let notificationsModal = document.querySelector(
      ".notifications-modal-body"
    );
    if (!document.querySelector("#error-box")) {
      fetch("/manage_notifications")
        .then((response) => response.json())
        .then((data) => {
          if (data.length > 0) {
            notificationsModal.innerHTML = "";
            // Reversing notifications
            for (let i = data.length - 1; i >= 0; i--) {
              notificationsModal.innerHTML += `
              <div id="notification-body" class="d-flex justify-content-around align-items-center">
                <svg width="100" height="100">
                  <circle cx="25" cy="50" r="10" fill=${data[i]["codeColor"]} />
                </svg>
                <strong class="me-auto">${data[i]["content"]}</strong>
                <span class="d-flex align-items-center">
                  <small style="padding: 1em;">${formattedDate(
                    data[i]["date"]
                  )}</small>
                  <button id="notification-dismisser" notification-id=${
                    data[i]["id"]
                  } class="btn btn-danger">Dismiss</button>
                </span>
              </div>
              <hr>
              `;
            }
            // Control pill
            document.querySelector("#notifications-pill").style.display = "";
            document.querySelector("#notifications-pill").innerHTML =
              data.length;
            // Control pulse animation
            if (
              localStorage.getItem("SocialHubNotificationsGreenPulse") ===
                "on" ||
              localStorage.getItem("SocialHubNotificationsLength") !=
                data.length
            ) {
              localStorage.setItem("SocialHubNotificationsGreenPulse", "on");
              localStorage.setItem("SocialHubNotificationsLength", data.length);
              document.querySelector(
                "#notifications_icon_pulse"
              ).style.display = "";
            } else {
              localStorage.setItem("SocialHubNotificationsGreenPulse", "off");
              document.querySelector(
                "#notifications_icon_pulse"
              ).style.display = "none";
            }
            catchNotifications();
          } else {
            notificationsModal.innerHTML = `
          <div id="no-history-message">
            <p class="bg-info m-3 p-3 rounded-5">Your notifications will appear here once arrive!</p>
          </div>`;
            // Control pill
            document.querySelector("#notifications-pill").style.display =
              "none";
            // Control pulse animation
            localStorage.setItem("SocialHubNotificationsGreenPulse", "off");
            localStorage.setItem("SocialHubNotificationsLength", 0);
            document.querySelector("#notifications_icon_pulse").style.display =
              "none";
          }
          document
            .querySelector("#notificationsModal")
            .addEventListener("click", () => {
              // Control pulse animation
              localStorage.setItem("SocialHubNotificationsGreenPulse", "off");
              document.querySelector(
                "#notifications_icon_pulse"
              ).style.display = "none";
            });
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }
}
getNotifications();

function formattedDate(notificationDate) {
  let targetDate = new Date(notificationDate);
  let currentDate = new Date();
  let timeDifference = targetDate - currentDate;

  // Calculate time difference in seconds, minutes, hours, and days
  let secondsDifference = Math.floor(Math.abs(timeDifference) / 1000);
  let minutesDifference = Math.floor(secondsDifference / 60);
  let hoursDifference = Math.floor(minutesDifference / 60);

  if (secondsDifference < 60) {
    return "now";
  } else if (minutesDifference < 60) {
    return `${minutesDifference} minute${
      minutesDifference !== 1 ? "s" : ""
    } ago`;
  } else if (hoursDifference < 24) {
    return `${hoursDifference} hour${hoursDifference !== 1 ? "s" : ""} ago`;
  } else {
    return notificationDate;
  }
}

function deleteNotifications(id) {
  fetch("/manage_notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "DELETE",
      content: "",
      id: id,
      codeColor: "",
    }),
  })
    .then((response) => response.json())
    .then(() => {
      getNotifications();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function catchNotifications() {
  let notificationDismissers = document.querySelectorAll(
    "#notification-dismisser"
  );

  if (notificationDismissers) {
    setTimeout(() => {
      notificationDismissers.forEach((btn) => {
        btn.addEventListener("click", () => {
          deleteNotifications(btn.getAttribute("notification-id"));
        });
      });
    }, 500);

    // Clear notifications
    let clearNotifications = document.createElement("span");
    clearNotifications.innerHTML = `<button id="clear-notifications" class="btn btn-outline-danger">Clear All</button>`;
    document
      .querySelector(".notifications-modal-body")
      .appendChild(clearNotifications);
    document
      .querySelector("#clear-notifications")
      .addEventListener("click", () => {
        notificationDismissers.forEach((btn) => {
          deleteNotifications(btn.getAttribute("notification-id"));
        });
      });

    return notificationDismissers.length;
  }
}
catchNotifications();
