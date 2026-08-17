import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedAdminRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    if (!token) return <Navigate to="/admin" replace />;
    return children;
};

export default ProtectedAdminRoute;