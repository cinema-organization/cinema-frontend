// src/components/AdminProtectedRoute.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({ children }) => {
  const { user, isLoggedIn } = useSelector((state) => state.auth);

  // si pas connecté OU rôle n'est pas admin → redirection vers login
  if (!isLoggedIn || !user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
