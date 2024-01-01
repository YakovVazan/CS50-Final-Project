import { socket } from "./socketio_init.js";
import { codeColors } from "./codeColors.js";
import { createToast } from "./toasts.js";
import { createNotification } from "./notifications.js";

let bugsInput = document.querySelector("#bugs-input");
let bugsCheck = document.querySelector("#bugs-check");
let bugsAndFbSender = document.querySelector("#bugs-and-fb-sender");

const fetchReportsData = async () => {
  try {
    const response = await fetch("/fetchReportsData");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
};

if (bugsAndFbSender) {
  bugsAndFbSender.addEventListener("click", () => {
    let data = {
      text: bugsInput.value,
      check: bugsCheck.checked,
    };

    socket.emit("collect-report", data);

    // zero input fields
    bugsInput.value = "";
    bugsCheck.checked = false;

    createToast("Your report was sent successfully.", codeColors["success"]);
  });
}

async function getReportsData() {
  let reportsModalBody = document.querySelector("#reports-modal-body");

  try {
    const data = await fetchReportsData();

    if (data.length <= 0) {
      reportsModalBody.innerHTML = "none!";
    } else {
      document.querySelector("#reports-badge").style.display = "inline";

      // set header
      reportsModalBody.innerHTML = `
      <div id="reports-header">
        <sapn>Content</sapn>
        <span style="width: 185px;">Date</span>
        <span>ID</span>
        <span>Close</span>
      </div>`;

      // add the reports
      data.forEach((report) => {
        reportsModalBody.innerHTML += `
      <div class="report-body" report-id="${report["id"]}">
        <span class="report-content">${report["content"]}</span>
        <span>${report["date"]}</span>
        <span class="reporter-id" title="${
          report["anonymous"] === 0 ? "" : "anon"
        }">${
          report["anonymous"] === 0
            ? report["user_id"]
            : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-ban" viewBox="0 0 16 16">
                <path d="M15 8a6.973 6.973 0 0 0-1.71-4.584l-9.874 9.875A7 7 0 0 0 15 8M2.71 12.584l9.874-9.875a7 7 0 0 0-9.874 9.874ZM16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0"/>
               </svg>`
        }</span>
        <button type="button" class="btn-close reports-closer" aria-label="Close"></button>
      </div>`;
      });

      handleReportsDeletion();
    }
  } catch (error) {
    console.error("Error: ", error);
  }
}

if (window.location.pathname === "/dashboard") {
  getReportsData();
}

function handleReportsDeletion() {
  let allReports = document.querySelectorAll(".reports-closer");

  allReports.forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.parentElement.remove();

      fetch("/delete_report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(btn.parentElement.getAttribute("report-id")),
      });

      if (document.querySelectorAll(".reports-closer").length <= 0) {
        document.querySelector("#reports-modal-body").innerHTML = "none!";
        document.querySelector("#reports-badge").style.display = "none";
      }
    });
  });
}

socket.on("new-report", () => {
  if (document.querySelector("#admin-is-here")) {
    createToast("New report.", codeColors["info"]);
    createNotification("New report.", codeColors["info"]);
  }
  getReportsData();
});
