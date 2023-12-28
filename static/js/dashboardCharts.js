import { fetchDashboardData } from "./dashboardData.js";
import { displayUpToDateTable } from "./dashboardTable.js";
import { socket } from "./socketio_init.js";

let typeChart = null;
let statusChart = null;
let connectedUsers = 0;
const ctx = document.getElementById("type-chart");

async function getDashboardData() {
  try {
    return await fetchDashboardData();
  } catch (error) {
    console.error(error);
  }
}

function destroyOldCharts() {
  if (typeChart) {
    typeChart.destroy();
  }

  if (statusChart) {
    statusChart.destroy();
  }
}

function createDoughnutChart(dashboardData) {
  const freeUsers = dashboardData["users"].filter(
    (user) => user["premium"] === 0
  );
  const premiumUsers = dashboardData["users"].filter(
    (user) => user["premium"] === 1
  );

  const data = {
    labels: ["Free", "Premium"],
    datasets: [
      {
        label: "Users amount",
        data: [freeUsers.length, premiumUsers.length],
        backgroundColor: ["#ffc234", "#ff436b"],
        hoverOffset: 4,
      },
    ],
  };

  typeChart = new Chart(ctx, {
    type: "doughnut",
    data: data,
  });
}

function createBarChart(dashboardData) {
  let data = {
    labels: ["Total Accounts", "Currently Connected"],
    datasets: [
      {
        label: "Number of Accounts",
        data: [dashboardData["users"].length],
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Currently Connected Users",
        data: [, connectedUsers],
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  let ctx = document.getElementById("status-chart").getContext("2d");

  statusChart = new Chart(ctx, {
    type: "bar",
    data: data,
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
      },
    },
  });
}

// Update charts that new account created
socket.on("new_account", () => {
  showCharts();
});

// Update charts that another user connected to the app
socket.on("new_connection", (data) => {
  connectedUsers = data["connected_users"];
  showCharts(data["connected_users_ids"]);
});

// Function to check tab visibility
function checkTabVisibility() {
  const isTabVisible = !document.hidden;
  socket.emit("tab_visibility", isTabVisible);
}

// Event listeners for visibility changes
document.addEventListener("visibilitychange", checkTabVisibility);

// Initial check when the page is loaded
checkTabVisibility();

function showCharts(args) {
  const spinners = document.getElementsByClassName("charts-spinner");

  if (document.querySelector(".charts-container")) {
    destroyOldCharts();

    Array.from(spinners).forEach((spinner) => {
      spinner.style.display = "block";
    });

    getDashboardData().then((dashboardData) => {
      Array.from(spinners).forEach((spinner) => {
        spinner.style.display = "none";
      });
      ctx.style.display = "";

      createDoughnutChart(dashboardData);
      createBarChart(dashboardData);
      displayUpToDateTable(args);
    });
  }
}
