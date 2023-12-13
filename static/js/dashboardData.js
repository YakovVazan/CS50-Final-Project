export const fetchDashboardData = async () => {
  try {
    const response = await fetch("/app_database");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
