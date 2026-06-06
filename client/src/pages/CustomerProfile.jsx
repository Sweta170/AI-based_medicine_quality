import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar } from 'lucide-react';

const CustomerProfile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-4 p-4 max-w-xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-slate-800 dark:text-slate-200 tracking-tight">Customer Profile</h1>
        <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
          Review your account registration metadata and system authority keys.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm relative overflow-hidden transition-colors duration-200">
        <div className="flex flex-col sm:flex-row items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-700/50">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-brand/20 border-2 border-blue-100 dark:border-brand/30 flex items-center justify-center text-[#1A56A0] dark:text-sky-400 text-xl font-bold shadow-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">{user?.name}</h2>
            <span className="text-[10px] px-2 py-0.5 rounded border border-blue-100 dark:border-brand/30 font-bold bg-blue-50 dark:bg-white/5 text-[#1A56A0] dark:text-sky-400 uppercase tracking-wider mt-0.5 inline-block">
              {user?.role} Portal tier
            </span>
          </div>
        </div>

        <div className="pt-4 space-y-4">
          <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Full Name</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Email Address</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Role Authority</span>
              <span className="font-semibold text-[#1A56A0] dark:text-sky-400 font-mono text-[11px]">Role: {user?.role?.toUpperCase()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Account Status</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">ACTIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
