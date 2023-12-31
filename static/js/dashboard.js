import "./dashboardCharts.js";
import "./dashboardTable.js";

// logics to close dashboard announcement
if (localStorage.getItem("SocialHubDashboardAccouncement") === "false") {
  document.querySelector("#dashboard-announcement-container").style.display =
    "none";
} else {
  document.querySelector("#dashboard-announcement-container").style.display =
    "flex";
}

let closeDashboardAnnouncementButton = document.querySelector(
  "#close-dashboard-announcement-button"
);

if (closeDashboardAnnouncementButton) {
  closeDashboardAnnouncementButton.addEventListener("click", () => {
    document.querySelector("#dashboard-announcement-container").style.display =
      "none";
    localStorage.setItem("SocialHubDashboardAccouncement", false);
  });
}
