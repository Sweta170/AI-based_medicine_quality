import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-darkbg-950">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-brand-500/20 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-brand-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
