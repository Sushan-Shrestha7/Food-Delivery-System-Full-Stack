import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { StoreContext } from "../../../content/storeContext";

const ProtectedAdminRoute = ({ children }) => {
  const { token, isAdmin } = useContext(StoreContext);
  if (!token || !isAdmin) return <Navigate to="/admin" replace />;
  return children;
};

export default ProtectedAdminRoute;
