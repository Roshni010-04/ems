import React from "react";
import { DashboardStats } from "../types";

const Card: React.FC<{ label: string; value: number; color: string; icon: string }> = ({
  label,
  value,
  color,
  icon,
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  </div>
);

const DashboardCards: React.FC<{ stats: DashboardStats }> = ({ stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <Card
      label="Total Employees"
      value={stats.totalEmployees}
      color="bg-blue-100 dark:bg-blue-900/40"
      icon="👥"
    />
    <Card
      label="Active Employees"
      value={stats.activeEmployees}
      color="bg-green-100 dark:bg-green-900/40"
      icon="✅"
    />
    <Card
      label="Inactive Employees"
      value={stats.inactiveEmployees}
      color="bg-red-100 dark:bg-red-900/40"
      icon="🚫"
    />
    <Card
      label="Departments"
      value={stats.departmentCount}
      color="bg-purple-100 dark:bg-purple-900/40"
      icon="🏢"
    />
  </div>
);

export default DashboardCards;
