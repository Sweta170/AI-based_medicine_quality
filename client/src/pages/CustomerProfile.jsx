import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar, Terminal } from 'lucide-react';

const CustomerProfile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Customer Profile</h1>
        <p className="text-slate-400 text-sm mt-1">
          Review your account registration metadata and system authority keys.
        </p>
      </div>

      {/* Profile Card */}
      <div className="glass-panel rounded-3xl border border-white/5 p-8 relative overflow-hidden">
        {/* Decorative blur sphere */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-brand-500/10 rounded-full blur-3xl -z-10"></div>

        <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-white/5">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white text-3xl font-bold border-2 border-white/10 shadow-xl shadow-brand-500/15">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-2xl font-extrabold text-white">{user?.name}</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20 uppercase tracking-wider">
              {user?.role} Portal tier
            </span>
          </div>
        </div>

        <div className="pt-8 space-y-5">
          <div className="flex items-center gap-4 text-sm text-slate-300">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Full Name</span>
              <span className="font-semibold text-white">{user?.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-300">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Email Address</span>
              <span className="font-semibold text-white">{user?.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-300">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Role Authority</span>
              <span className="font-semibold text-white font-mono text-brand-400">Role: {user?.role?.toUpperCase()}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-slate-300">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Account Status</span>
              <span className="font-semibold text-emerald-400">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
