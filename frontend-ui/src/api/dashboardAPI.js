const BASE_URL = "http://127.0.0.1:8000";

export const fetchDashboardSummary = async () => {
  const response = await fetch(`${BASE_URL}/api/dashboard/summary/`);

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard summary");
  }

  return await response.json();
};

