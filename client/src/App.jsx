import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import SuperadminDashboard from './pages/SuperadminDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard';
import CustomerDashboard from './pages/CustomerDashboard';

// Dashboard Layout wrapper
const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-darkbg-950">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Root Redirect component to direct users to their home dashboard
const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-darkbg-950">
        <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'superadmin':
      return <Navigate to="/superadmin" replace />;
    case 'pharmacist':
      return <Navigate to="/pharmacist" replace />;
    case 'customer':
      return <Navigate to="/customer" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Dashboard Routes (Protected) */}
      <Route element={<DashboardLayout />}>
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        <Route
          path="/superadmin"
          element={
            <ProtectedRoute allowedRoles={['superadmin']}>
              <SuperadminDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/pharmacist"
          element={
            <ProtectedRoute allowedRoles={['pharmacist', 'superadmin']}>
              <PharmacistDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/customer"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Root/Index Redirect */}
      <Route path="/" element={<HomeRedirect />} />

      {/* Wildcard Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
