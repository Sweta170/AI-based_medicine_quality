import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Pills, ShoppingBag, ShieldAlert, FileText, Bell, User } from 'lucide-react';

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
            icon: Pills,
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
    <aside className="w-64 bg-darkbg-950/80 border-r border-white/5 flex flex-col h-[calc(100vh-73px)] p-4">
      <div className="flex-1 space-y-2">
        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Navigation
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                  isActive
                    ? 'bg-brand-500/10 text-brand-400 border-brand-500/20 shadow-md shadow-brand-500/5'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-2">
        <div className="flex items-center gap-2 text-brand-400 font-semibold text-sm">
          <LayoutDashboard className="w-4 h-4" />
          <span>Status Shield</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Logged in session is secured with dual Access & Refresh token rotation.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
