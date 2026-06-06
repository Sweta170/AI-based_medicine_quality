import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Pill, ShoppingBag, FileText, Bell, User, ShieldAlert } from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();

  const getLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case 'superadmin':
        return [
          {
            name: 'User Control Panel',
            path: '/superadmin',
            icon: Users,
          },
        ];
      case 'pharmacist':
        return [
          {
            name: 'Inventory Manager',
            path: '/pharmacist',
            icon: Pill,
          },
        ];
      case 'customer':
        return [
          {
            name: 'Dashboard',
            path: '/customer/dashboard',
            icon: LayoutDashboard,
          },
          {
            name: 'Medicine Shop',
            path: '/customer/shop',
            icon: ShoppingBag,
          },
          {
            name: 'Invoice History',
            path: '/customer/bills',
            icon: FileText,
          },
          {
            name: 'Medication Reminders',
            path: '/customer/reminders',
            icon: Bell,
          },
          {
            name: 'My Profile',
            path: '/customer/profile',
            icon: User,
          },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <aside className="w-56 bg-slate-100 dark:bg-[#111827] border-r border-slate-200 dark:border-slate-700/40 flex flex-col h-[calc(100vh-48px)] p-4 transition-colors duration-200">
      {/* Navigation Links */}
      <div className="flex-1 space-y-1">
        <div className="px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-1">
          Navigation
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 border ${
                  isActive
                    ? 'bg-blue-50 dark:bg-brand/15 text-blue-700 dark:text-sky-400 border-blue-200 dark:border-brand/20 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200 border-transparent'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Status Shield Card */}
      <div className="p-3 bg-white dark:bg-[#1a2438] rounded-xl border border-slate-200 dark:border-slate-700/50 space-y-1.5 shadow-sm transition-colors duration-200">
        <div className="flex items-center gap-1.5 text-[#1A56A0] dark:text-sky-400 font-semibold text-xs">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>Status Shield</span>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
          Logged in session is secured with dual Access & Refresh token rotation.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
