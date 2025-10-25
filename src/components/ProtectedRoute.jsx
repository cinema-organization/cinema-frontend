// src/components/ProtectedRoute.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { user, isLoggedIn } = useSelector((state) => state.auth);

  // si pas connecté OU rôle n'est pas client → redirection vers login
  if (!isLoggedIn || !user || user.role !== "client") {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
