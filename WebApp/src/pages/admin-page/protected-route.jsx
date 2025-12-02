import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";

export default function ProtectedRoute({ children, requiredRole }) {
  const storedRole = localStorage.getItem("role_id");
  const roleId = storedRole ? parseInt(storedRole, 10) : null;

  if (!storedRole) {
    return <Navigate to="/login-page" replace />;
  }

  if (requiredRole && roleId !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
