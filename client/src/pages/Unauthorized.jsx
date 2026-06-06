import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ChevronLeft } from 'lucide-react';

const Unauthorized = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (!user) {
      navigate('/login');
    } else {
      if (user.role === 'superadmin') navigate('/superadmin');
      else if (user.role === 'pharmacist') navigate('/pharmacist');
      else navigate('/customer');
    }
  };

  return (
    <div className="min-h-[calc(100vh-48px)] flex items-center justify-center px-4 transition-colors duration-200">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 mb-4 animate-pulse">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">Access Denied</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mb-6 leading-relaxed">
          Your current credentials do not grant access to this secure terminal. This event has been logged for security auditing.
        </p>

        <button
          onClick={handleGoBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-205 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-lg border border-slate-200 dark:border-slate-700/50 transition-all text-xs"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Return to Safety</span>
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
