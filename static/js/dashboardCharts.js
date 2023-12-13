import { fetchDashboardData } from "./dashboardData.js";

const ctx = document.getElementById("users-chart");

async function getDashboardData() {
  try {
    const dashboardData = await fetchDashboardData();
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

    new Chart(ctx, {
      type: "doughnut",
      data: data,
    });

    // sum of users
    document.getElementById("total-users-number").innerHTML +=
      dashboardData["users"].length;
  } catch (error) {
    console.error(error);
  }
}
getDashboardData();
