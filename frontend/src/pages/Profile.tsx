import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Profile: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;
  return <Navigate to={`/employees/${user._id}`} replace />;
};

export default Profile;
