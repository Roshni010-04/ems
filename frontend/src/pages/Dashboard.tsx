import React, { useEffect, useState } from "react";
import { DashboardStats } from "../types";
import { fetchDashboardStats } from "../api/employees";
import DashboardCards from "../components/DashboardCards";
import DashboardCharts from "../components/DashboardCharts";

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400">Loading dashboard...</p>;
  if (!stats) return <p className="text-red-400">Failed to load dashboard data.</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Dashboard</h2>
      <DashboardCards stats={stats} />
      <DashboardCharts stats={stats} />
    </div>
  );
};

export default Dashboard;
