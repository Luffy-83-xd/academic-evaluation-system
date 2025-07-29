import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ roles }) => {
  const { isAuthenticated, user } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if the route is restricted by role
  if (roles && !roles.includes(user.role)) {
    // Redirect to a 'not authorized' page or back to a safe route
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; // Renders the child route's element
};

export default ProtectedRoute;