import "./dashboardCharts.js";
import "./dashboardTable.js";

let dashboardAnnouncementContainer = document.querySelector(
  "#dashboard-announcement-container"
);
let closeDashboardAnnouncementButton = document.querySelector(
  "#close-dashboard-announcement-button"
);

if (dashboardAnnouncementContainer) {
  // logics to close dashboard announcement
  if (localStorage.getItem("SocialHubDashboardAccouncement") === "false") {
    dashboardAnnouncementContainer.style.display = "none";
  } else {
    dashboardAnnouncementContainer.style.display = "flex";
  }

  if (closeDashboardAnnouncementButton) {
    closeDashboardAnnouncementButton.addEventListener("click", () => {
      dashboardAnnouncementContainer.style.display = "none";
      localStorage.setItem("SocialHubDashboardAccouncement", false);
    });
  }
}
