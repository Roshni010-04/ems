import React, { ReactNode } from "react";
import Navbar from "./Layout/Navbar";
import Sidebar from "./Layout/Sidebar";

const AppLayout: React.FC<{ children: ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <Navbar />
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  </div>
);

export default AppLayout;
