import { fetchDashboardData } from "./dashboardData.js";
import { displayUpToDateTable } from "./dashboardTable.js";

let typeChart = null;
let statusChart = null;
const ctx = document.getElementById("type-chart");
const socket = io.connect(
  "https://" + window.location.hostname + ":" + location.port
);

async function getDashboardData() {
  try {
    return await fetchDashboardData();
  } catch (error) {
    console.error(error);
  }
}

getDashboardData().then((dashboardData) => {
  if (document.querySelector(".charts-container")) {
    createDoughnutChart(dashboardData);
    createBarChart(dashboardData);
  }
});

// Update charts that new account created
socket.on("new_account", () => {
  getDashboardData().then((dashboardData) => {
    if (document.querySelector(".charts-container")) {
      createDoughnutChart(dashboardData);
      createBarChart(dashboardData);
      displayUpToDateTable();
    }
  });
});

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
        backgroundColor: ["#0dcaf0", "#dc3545"],
        hoverOffset: 4,
      },
    ],
  };

  if (typeChart) {
    typeChart.destroy();
  }

  typeChart = new Chart(ctx, {
    type: "doughnut",
    data: data,
  });
}

function createBarChart(dashboardData) {
  // Update charts that another user connected to the app
  socket.on("update_users", (connectedUsers) => {
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
          data: [, connectedUsers["count"] - 1],
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    };

    let ctx = document.getElementById("status-chart").getContext("2d");

    if (statusChart) {
      statusChart.destroy();
    }

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
  });
}
