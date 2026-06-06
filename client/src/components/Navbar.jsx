import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Activity } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'pharmacist':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'customer':
        return 'bg-brand-500/10 text-brand-400 border border-brand-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400';
    }
  };

  const getRoleLabel = (role) => {
    if (role === 'superadmin') return 'Super Admin';
    if (role === 'pharmacist') return 'Pharmacist';
    return 'Customer';
  };

  return (
    <header className="glass-panel sticky top-0 z-40 w-full border-b border-white/5 py-4 px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-lg text-white font-sans tracking-wide">AEGIS</span>
          <span className="text-brand-400 font-bold text-lg font-sans tracking-wide ml-1">MEDICINE</span>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-white/5 pl-3 pr-4 py-1.5 rounded-full border border-white/5">
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${getRoleBadgeColor(user.role)}`}>
              {getRoleLabel(user.role)}
            </span>
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-sm font-semibold text-white">{user.name}</span>
              <span className="text-xs text-slate-400">{user.email}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors duration-200 py-1.5 px-3 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
