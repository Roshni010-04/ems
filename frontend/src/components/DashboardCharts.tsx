import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { DashboardStats } from "../types";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const DashboardCharts: React.FC<{ stats: DashboardStats }> = ({ stats }) => {
  const deptData = stats.byDepartment.map((d) => ({ name: d._id || "Unassigned", count: d.count }));
  const roleData = stats.byRole.map((r) => ({ name: r._id, value: r.count }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
        <h3 className="font-semibold mb-4">Employees by Department</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={deptData}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
        <h3 className="font-semibold mb-4">Employees by Role</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={roleData} dataKey="value" nameKey="name" outerRadius={90} label>
              {roleData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardCharts;
