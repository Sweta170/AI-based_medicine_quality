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
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-6 animate-pulse">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Access Denied</h1>
        <p className="text-slate-400 text-sm mb-8">
          Your current credentials do not grant access to this secure terminal. This event has been logged for security auditing.
        </p>

        <button
          onClick={handleGoBack}
          className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 transition-all text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Return to Safety</span>
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
