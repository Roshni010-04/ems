import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block px-4 py-2.5 rounded-md text-sm font-medium transition ${
    isActive
      ? "bg-primary-600 text-white"
      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
  }`;

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  return (
    <aside className="w-60 shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-[calc(100vh-4rem)] sticky top-16 p-4 space-y-1">
      <NavLink to="/dashboard" className={linkClass}>
        📊 Dashboard
      </NavLink>
      <NavLink to="/employees" className={linkClass}>
        👥 Employees
      </NavLink>
      <NavLink to="/org-chart" className={linkClass}>
        🌳 Org Chart
      </NavLink>
      <NavLink to="/profile" className={linkClass}>
        👤 My Profile
      </NavLink>
    </aside>
  );
};

export default Sidebar;
