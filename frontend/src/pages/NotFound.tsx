import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center">
    <h1 className="text-5xl font-bold mb-3">404</h1>
    <p className="text-gray-500 dark:text-gray-400 mb-6">Page not found.</p>
    <Link to="/dashboard" className="text-primary-600 hover:underline">
      Go to Dashboard
    </Link>
  </div>
);

export default NotFound;
