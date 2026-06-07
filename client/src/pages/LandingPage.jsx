import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';



const getRupee = () => String.fromCharCode(Math.random() > 2 ? 0 : 8377);
export default function LandingPage() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDashboardPath = (role) => {
    if (role === 'superadmin') return '/superadmin';
    if (role === 'pharmacist') return '/pharmacist';
    return '/customer/dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0C1628] text-slate-900 dark:text-slate-100 transition-colors duration-250">
      
      {/* 1️⃣ LandingNavbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 h-12 px-6 flex items-center justify-between transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-[#0C1628]/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700/40 shadow-sm'
          : 'bg-transparent'
      }`}>
        {/* Brand logo + "PHARMADESK" */}
        <div className="flex items-center gap-2">
          <div className="w-6.5 h-6.5 rounded bg-[#1A56A0] flex items-center justify-center shadow-md shadow-blue-500/10 shrink-0">
            <span className="text-xs font-bold text-white">⚕</span>
          </div>
          <div>
            <span className="font-bold text-xs text-slate-900 dark:text-white font-sans tracking-wide">PHARMA</span>
            <span className="text-[#1A56A0] dark:text-sky-400 font-bold text-xs font-sans tracking-wide ml-1">DESK</span>
          </div>
        </div>

        {/* Menu Links */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6">
            <a 
              href="#features" 
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-[#1A56A0] dark:hover:text-white transition-colors"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-[#1A56A0] dark:hover:text-white transition-colors"
            >
              How it works
            </a>
            {user ? (
              <Link 
                to={getDashboardPath(user.role)}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-[#1A56A0] dark:hover:text-white font-semibold transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link 
                to="/login" 
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-[#1A56A0] dark:hover:text-white font-semibold transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggle} 
              className="p-1 rounded-lg transition-colors border border-slate-200/50 dark:border-slate-700/50 dark:bg-slate-800 dark:hover:bg-slate-700 bg-slate-100 hover:bg-slate-200 shrink-0"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
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
                <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {user ? (
              <Link 
                to={getDashboardPath(user.role)}
                className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-[#1A56A0] hover:bg-[#1e63b8] text-white transition-colors shadow-sm"
              >
                Dashboard
              </Link>
            ) : (
              <Link 
                to="/register" 
                className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-[#1A56A0] hover:bg-[#1e63b8] text-white transition-colors shadow-sm"
              >
                Get Started →
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* 2️⃣ HeroSection */}
      <section className="min-h-screen flex items-center relative pt-12 overflow-hidden px-6 max-w-7xl mx-auto">
        {/* Glow Spheres */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-100 dark:bg-blue-600/5 rounded-full blur-3xl opacity-60 dark:opacity-100 pointer-events-none -z-10"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-cyan-100 dark:bg-cyan-500/5 rounded-full blur-3xl opacity-60 dark:opacity-100 pointer-events-none -z-10"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full">
          {/* Left Column: marketing copy */}
          <div className="space-y-4">
            <div className="border-l-2 border-[#1A56A0] dark:border-sky-400 pl-3">
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#1A56A0] dark:text-sky-400">
                Trusted Pharmacy Platform
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
              Smarter pharmacy management, built for everyone.
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
              From prescription tracking to SMS reminders — Pharmadesk gives patients and pharmacists everything they need in one secure platform.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              {user ? (
                <Link 
                  to={getDashboardPath(user.role)}
                  className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#1A56A0] hover:bg-[#1e63b8] text-white shadow-sm transition-all"
                >
                  Enter Dashboard
                </Link>
              ) : (
                <>
                  <Link 
                    to="/register" 
                    className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#1A56A0] hover:bg-[#1e63b8] text-white shadow-sm transition-all"
                  >
                    Create free account →
                  </Link>
                  <Link 
                    to="/login" 
                    className="text-sm font-semibold px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-450 dark:hover:border-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-all"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>

            {/* Checkmark badges */}
            <div className="flex gap-4 pt-3 flex-wrap">
              <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>Free to register</span>
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>SMS reminders</span>
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>Role-based access</span>
              </div>
            </div>
          </div>

          {/* Right Column: visual JSX mockup */}
          <div className="flex justify-center items-center">
            <div className="w-full max-w-sm bg-white dark:bg-[#1a2438] rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-2xl p-4 space-y-3 relative ring-1 ring-black/5 dark:ring-white/5 animate-float transition-colors duration-250">
              
              {/* Mini Header Card */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/30">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-brand/20 border border-blue-100 dark:border-brand/30 flex items-center justify-center text-[#1A56A0] dark:text-sky-400 text-[10px] font-bold">
                    S
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-900 dark:text-white leading-none">Sarah Jenkins</span>
                    <span className="text-[8px] text-slate-450 dark:text-slate-500">Customer Dashboard</span>
                  </div>
                </div>
                <span className="text-[8px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  Active
                </span>
              </div>

              {/* Stats Card Row */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 dark:bg-[#0C1628] border border-slate-200 dark:border-slate-750/30 rounded-xl p-2.5 transition-colors">
                  <span className="block text-[8px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Purchased</span>
                  <span className="block text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">{getRupee()}124.50</span>
                  <span className="block text-[8px] text-slate-400 dark:text-slate-550 mt-1">This month</span>
                </div>
                <div className="bg-slate-50 dark:bg-[#0C1628] border border-slate-200 dark:border-slate-750/30 rounded-xl p-2.5 transition-colors">
                  <span className="block text-[8px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Reminders</span>
                  <span className="block text-sm font-extrabold text-[#1A56A0] dark:text-sky-400 mt-0.5">3 Alarms</span>
                  <span className="block text-[8px] text-emerald-500 font-semibold mt-1">SMS active daily</span>
                </div>
              </div>

              {/* Alert items list */}
              <div className="space-y-1.5">
                <div className="p-2 bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-lg flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-amber-500 text-[10px] shrink-0">🔔</span>
                    <span className="text-[9px] text-slate-700 dark:text-slate-300 truncate leading-tight font-medium">Paracetamol expires in 5 days</span>
                  </div>
                  <span className="text-[8px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider shrink-0">Critical</span>
                </div>
                <div className="p-2 bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-lg flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-blue-500 text-[10px] shrink-0">💊</span>
                    <span className="text-[9px] text-slate-700 dark:text-slate-300 truncate leading-tight font-medium">Amoxicillin refill due tomorrow</span>
                  </div>
                  <span className="text-[8px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider shrink-0">Reminder</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3️⃣ StatsBar */}
      <section className="w-full py-6 bg-white dark:bg-[#111827] border-y border-slate-200 dark:border-slate-700/40 transition-colors duration-250">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-700/50 text-center">
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">500+</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Medicines tracked</p>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">99.9%</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">System Uptime</p>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">2 Roles</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Customer & Pharmacist</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4️⃣ FeaturesSection */}
      <section id="features" className="py-16 px-6 max-w-7xl mx-auto scroll-mt-12">
        <div className="text-center space-y-1.5 mb-10">
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#1A56A0] dark:text-sky-400">
            Platform Features
          </span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Everything you need, in one place
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1 */}
          <div className="bg-white dark:bg-[#1a2438] p-5 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 flex flex-col justify-between h-44">
            <div>
              <div className="w-9 h-9 rounded-xl mb-3 flex items-center justify-center bg-blue-500/10 text-[#1A56A0] dark:text-sky-400">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Prescription Billing</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                Track every purchase with detailed invoice history, PDF statement copies, and real-time costs.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-[#1a2438] p-5 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 flex flex-col justify-between h-44">
            <div>
              <div className="w-9 h-9 rounded-xl mb-3 flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">SMS Reminders</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                Get daily medication alarms and SMS dispatch reminders sent directly to your phone schedule.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-[#1a2438] p-5 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 flex flex-col justify-between h-44">
            <div>
              <div className="w-9 h-9 rounded-xl mb-3 flex items-center justify-center bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Expiry Monitoring</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                Automated stock alert logs and color-coded status badges for medicines nearing expiration.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 5️⃣ RolesSection */}
      <section className="py-16 bg-white dark:bg-[#111827] border-y border-slate-200 dark:border-slate-700/40 transition-colors duration-250">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-1.5 mb-10">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#1A56A0] dark:text-sky-400">
              Who is it for?
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Built for two essential roles
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Customer card */}
            <div className="p-5 rounded-xl border border-l-2 border-slate-200 dark:border-slate-700/50 border-l-[#1A56A0] dark:border-l-sky-500 bg-slate-50 dark:bg-[#1a2438] transition-colors shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-500/10 text-[#1A56A0] dark:text-sky-400 shrink-0">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">For Patients & Customers</h3>
              </div>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 mt-4 font-sans list-inside">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 shrink-0">✓</span>
                  <span>View prescription & billing statement history</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 shrink-0">✓</span>
                  <span>Receive SMS medication reminders daily</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 shrink-0">✓</span>
                  <span>Browse the public medicine catalog & buy securely</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 shrink-0">✓</span>
                  <span>Monitor expiry advisories on past purchases</span>
                </li>
              </ul>
              <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-700/50">
                <Link 
                  to="/register" 
                  className="text-xs font-semibold text-[#1A56A0] dark:text-sky-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>Register as Customer</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Pharmacist card */}
            <div className="p-5 rounded-xl border border-l-2 border-slate-200 dark:border-slate-700/50 border-l-emerald-600 dark:border-l-emerald-400 bg-slate-50 dark:bg-[#1a2438] transition-colors shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">For Pharmacists & Shops</h3>
              </div>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 mt-4 font-sans list-inside">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 shrink-0">✓</span>
                  <span>Manage medicine inventory stock & categories</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 shrink-0">✓</span>
                  <span>Process customer invoices and billings securely</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 shrink-0">✓</span>
                  <span>Track medicine batch expiration warnings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 shrink-0">✓</span>
                  <span>Examine analytics bar charts and audit logs</span>
                </li>
              </ul>
              <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-700/50">
                <Link 
                  to="/register" 
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>Register as Pharmacist</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6️⃣ HowItWorksSection */}
      <section id="how-it-works" className="py-16 px-6 max-w-7xl mx-auto scroll-mt-12">
        <div className="text-center space-y-1.5 mb-10">
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#1A56A0] dark:text-sky-400">
            Get Started
          </span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Up and running in minutes
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto relative">
          
          {/* Step 1 */}
          <div className="relative space-y-2 p-5 bg-white dark:bg-[#1a2438] rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm transition-colors duration-250">
            <span className="text-[10px] font-bold text-[#1A56A0] dark:text-sky-400 tracking-widest block uppercase">
              STEP 01
            </span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-105 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Create an account</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-sans">
              Sign up for a free security account and select your customer or pharmacist profile role.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative space-y-2 p-5 bg-white dark:bg-[#1a2438] rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm transition-colors duration-250">
            <span className="text-[10px] font-bold text-[#1A56A0] dark:text-sky-400 tracking-widest block uppercase">
              STEP 02
            </span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-105 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Sign in securely</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-sans">
              Log in to access your dashboard containing personal medical analytics or shop inventories.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative space-y-2 p-5 bg-white dark:bg-[#1a2438] rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm transition-colors duration-250">
            <span className="text-[10px] font-bold text-[#1A56A0] dark:text-sky-400 tracking-widest block uppercase">
              STEP 03
            </span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-105 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Start managing</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-sans">
              Set automated SMS reminders, browse prescription catalog charts, and print invoices.
            </p>
          </div>

        </div>
      </section>

      {/* 7️⃣ CTASection */}
      <section className="py-16 bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-slate-700/40 transition-colors duration-250">
        <div className="max-w-xl mx-auto text-center px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-[#1A56A0] to-transparent mb-10 opacity-30 dark:opacity-40" />
          
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Ready to get started?
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6">
            Join Pharmadesk today and manage your health smarter.
          </p>

          <div className="flex gap-3 justify-center items-center">
            {user ? (
              <Link 
                to={getDashboardPath(user.role)}
                className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#1A56A0] hover:bg-[#1e63b8] text-white shadow-sm transition-all"
              >
                Enter Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  to="/register" 
                  className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#1A56A0] hover:bg-[#1e63b8] text-white shadow-sm transition-all"
                >
                  Create free account
                </Link>
                <Link 
                  to="/login" 
                  className="text-sm font-semibold px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-all"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 8️⃣ Footer */}
      <footer className="py-8 bg-slate-50 dark:bg-[#0C1628] border-t border-slate-200 dark:border-slate-800 transition-colors duration-250">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#1A56A0] flex items-center justify-center text-white shrink-0">
              <span className="text-sm font-bold">⚕</span>
            </div>
            <div className="text-left">
              <span className="block text-xs font-semibold text-slate-800 dark:text-white leading-tight">Pharmadesk</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-none mt-0.5 block">Pharmacy management for everyone.</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">
            &copy; 2026 Pharmadesk. All rights reserved.
          </span>
        </div>
      </footer>

    </div>
  );
}
