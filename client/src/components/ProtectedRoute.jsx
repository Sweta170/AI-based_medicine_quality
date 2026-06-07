import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [slowLoad, setSlowLoad] = useState(false);

  // After 4s of loading, show a Render cold-start hint
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setSlowLoad(true), 4000);
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-white">
        {/* Spinner */}
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#0F4BBE] animate-spin" />
        </div>

        <div className="text-center space-y-1.5">
          <p className="text-slate-700 font-semibold text-[15px]">Loading Dashboard...</p>

          {slowLoad ? (
            <div className="space-y-1">
              <p className="text-slate-400 text-[12.5px]">
                🌐 Backend server is waking up — this may take <span className="font-medium text-slate-600">up to 60 seconds</span> on first load.
              </p>
              <p className="text-slate-400 text-[11.5px]">
                Render free tier spins down after inactivity.{' '}
                <button
                  onClick={() => window.location.reload()}
                  className="text-[#0F4BBE] underline hover:text-blue-700 font-medium"
                >
                  Refresh
                </button>{' '}
                if it takes too long.
              </p>
            </div>
          ) : (
            <p className="text-slate-400 text-[12px]">Please wait...</p>
          )}
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

