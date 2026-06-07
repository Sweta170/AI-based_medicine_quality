import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20';
      case 'pharmacist':
        return 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20';
      case 'customer':
        return 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20';
      default:
        return 'bg-slate-50 dark:bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-500/20';
    }
  };

  const getRoleLabel = (role) => {
    if (role === 'superadmin') return 'Super Admin';
    if (role === 'pharmacist') return 'Pharmacist';
    return 'Customer';
  };

  return (
    <header className="sticky top-0 z-40 w-full h-12 px-6 flex items-center justify-between bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-700/50 shadow-sm transition-colors duration-200">
      {/* Brand logo + "PHARMADESK" */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-[#1A56A0] flex items-center justify-center shadow-md shadow-blue-500/10">
          <span className="text-sm font-bold text-white">⚕</span>
        </div>
        <div>
          <span className="font-bold text-sm text-slate-900 dark:text-white font-sans tracking-wide">PHARMA</span>
          <span className="text-[#1A56A0] dark:text-sky-400 font-bold text-sm font-sans tracking-wide ml-1">DESK</span>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Avatar + name + email + Role Badge - Hidden on mobile */}
          <div className="hidden sm:flex items-center gap-3 pl-3 pr-3 py-1 rounded-full border border-slate-200/60 dark:border-slate-700/30 bg-slate-50/50 dark:bg-white/5">
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${getRoleBadgeStyle(user.role)}`}>
              {getRoleLabel(user.role)}
            </span>
            <div className="flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">{user.name}</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 leading-none">{user.email}</span>
            </div>
            <div className="w-[28px] h-[28px] rounded-full bg-brand/10 dark:bg-brand/20 border border-brand/20 dark:border-brand/30 flex items-center justify-center text-brand dark:text-sky-400 font-bold text-xs uppercase">
              {user.name.charAt(0)}
            </div>
          </div>

          {/* Theme Toggle Button */}
          <button 
            onClick={toggle} 
            className="p-1.5 rounded-lg transition-colors border border-slate-200/50 dark:border-slate-700/50 dark:bg-slate-800 dark:hover:bg-slate-700 bg-slate-100 hover:bg-slate-200"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Logout Button - Always visible */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors py-1 px-2 sm:px-2.5 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20 whitespace-nowrap"
            title="Logout"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="text-sm font-semibold hidden sm:inline">Logout</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;