import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import useBrowserNotifications from './hooks/useBrowserNotifications';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import SuperadminDashboard from './pages/SuperadminDashboard';
import PharmacistDashboard from './pages/PharmacistDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import CustomerShop from './pages/CustomerShop';
import CustomerBills from './pages/CustomerBills';
import CustomerReminders from './pages/CustomerReminders';
import CustomerProfile from './pages/CustomerProfile';
import LandingPage from './pages/LandingPage';

// Browser notification activator — runs the reminder checker for customers
const BrowserNotificationProvider = ({ children }) => {
  const { user } = useAuth();
  // Only activate for customers
  if (user?.role === 'customer') {
    useBrowserNotifications();
  }
  return children;
};

// Dashboard Layout wrapper
const DashboardLayout = () => {
  return (
    <BrowserNotificationProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0C1628] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
        <Navbar />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto pb-14 md:pb-0">
            <Outlet />
          </main>
        </div>
      </div>
    </BrowserNotificationProvider>
  );
};

// Root Redirect component to direct users to their home dashboard
const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0C1628] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
        <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-800 border-t-[#1A56A0] rounded-full animate-spin"></div>
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
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Pharmacist Dashboard (No DashboardLayout wrapper to use custom white medical layout) */}
      <Route
        path="/pharmacist"
        element={
          <ProtectedRoute allowedRoles={['pharmacist', 'superadmin']}>
            <PharmacistDashboard />
          </ProtectedRoute>
        }
      />

      {/* Customer Shop / Medicine Marketplace (No DashboardLayout wrapper to use dedicated marketplace layout) */}
      <Route
        path="/customer/shop"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <BrowserNotificationProvider>
              <CustomerShop />
            </BrowserNotificationProvider>
          </ProtectedRoute>
        }
      />


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
          path="/customer"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <Navigate to="/customer/dashboard" replace />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />



        <Route
          path="/customer/bills"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerBills />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/bills/:id"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerBills />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/reminders"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerReminders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer/profile"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerProfile />
            </ProtectedRoute>
          }
        />
      </Route>


      {/* Wildcard Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
