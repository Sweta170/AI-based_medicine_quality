import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { Activity, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

// Configure Axios defaults to connect with backend correctly
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
axios.defaults.withCredentials = true;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State variables required exactly by requirements
  const [role, setRole] = useState('pharmacist');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dynamically load the Sora font for the left panel headline
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Sora:wght@600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Form logic requested exactly
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/auth/login', { email, password, role });
      
      // Normalize response data to match expected shape and prevent TypeErrors
      if (res.data && !res.data.user) {
        res.data.user = {
          id: res.data._id || res.data.id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role
        };
      }
      if (res.data && !res.data.refreshToken) {
        res.data.refreshToken = '';
      }

      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      const routes = {
        pharmacist: '/pharmacist',
        superadmin: '/superadmin',
        customer: '/customer/dashboard',
      };
      navigate(routes[res.data.user.role]);
      // Trigger full page reload to update context state from new session
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      {/* LEFT PANEL: Decorative (55% width, hidden on mobile) */}
      <div className="hidden md:flex md:w-[55%] bg-[#0C1628] text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative blur elements inside Left Panel */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#1A56A0]/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Top: Logo & Tagline */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-[#1A56A0] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="block font-bold text-lg tracking-tight text-white">Pharmadesk</span>
            <span className="block text-[9px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">
              PHARMACY MANAGEMENT SYSTEM
            </span>
          </div>
        </div>

        {/* Centre: Main Sora font headline */}
        <div className="my-auto py-12 relative z-10 max-w-xl">
          <h1 className="font-['Sora'] font-extrabold text-4xl lg:text-5xl leading-tight text-white tracking-tight space-y-2">
            <span className="block">Smart pharmacy</span>
            <span className="block">management,</span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
              built for safety.
            </span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base mt-6 font-medium leading-relaxed">
            Every expiry checked. Every bill validated. Automatically.
          </p>
        </div>

        {/* Bottom: Stat row inside dark-bordered box */}
        <div className="border border-slate-800/80 bg-slate-900/30 backdrop-blur-sm p-6 rounded-2xl relative z-10">
          <div className="grid grid-cols-3 gap-4 divide-x divide-slate-800/80 text-center">
            <div>
              <span className="block text-xl lg:text-2xl font-bold text-white tracking-tight">12,480</span>
              <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
                Medicines Tracked
              </span>
            </div>
            <div>
              <span className="block text-xl lg:text-2xl font-bold text-white tracking-tight">99.8%</span>
              <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
                Expiry Accuracy
              </span>
            </div>
            <div>
              <span className="block text-xl lg:text-2xl font-bold text-white tracking-tight">4,200+</span>
              <span className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
                Bills Generated
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Form Container (45% width, full width on mobile) */}
      <div className="w-full md:w-[45%] bg-white flex flex-col justify-between p-8 md:p-12 overflow-y-auto">
        
        {/* Spacer top for centering content on desktop */}
        <div className="hidden md:block h-6"></div>

        {/* Main Form content wrapper */}
        <div className="max-w-md w-full mx-auto my-auto py-8">
          
          {/* Header */}
          <div className="mb-8">
            <span className="block text-xs font-bold text-[#1A56A0] tracking-widest uppercase mb-1.5">SECURE ACCESS</span>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">Sign in to your account</h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">Select your role to continue</p>
          </div>

          {location.state?.message && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-start gap-3 font-medium animate-fade-in">
              <svg className="w-5 h-5 shrink-0 mt-0.5 text-green-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{location.state.message}</span>
            </div>
          )}

          {/* Role Selector Buttons */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole('pharmacist')}
              className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all text-center ${
                role === 'pharmacist'
                  ? 'border-[#1A56A0] bg-blue-50 text-[#1A56A0] shadow-sm shadow-[#1A56A0]/5'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              Pharmacist
            </button>
            <button
              type="button"
              onClick={() => setRole('superadmin')}
              className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all text-center ${
                role === 'superadmin'
                  ? 'border-[#1A56A0] bg-blue-50 text-[#1A56A0] shadow-sm shadow-[#1A56A0]/5'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all text-center ${
                role === 'customer'
                  ? 'border-[#1A56A0] bg-blue-50 text-[#1A56A0] shadow-sm shadow-[#1A56A0]/5'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              Customer
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-[10px] font-bold text-slate-700 tracking-wider mb-2 uppercase">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#1A56A0] focus:ring-1 focus:ring-[#1A56A0] transition-colors text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-bold text-slate-700 tracking-wider uppercase">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-semibold text-[#1A56A0] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#1A56A0] focus:ring-1 focus:ring-[#1A56A0] transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#1A56A0] hover:bg-[#1A56A0]/95 text-white font-bold rounded-xl transition-all duration-300 shadow-md flex justify-center items-center disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-6"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating…</span>
                </div>
              ) : (
                <span>
                  {role === 'pharmacist' && 'Sign in as Pharmacist'}
                  {role === 'superadmin' && 'Sign in as Admin'}
                  {role === 'customer' && 'Sign in as Customer'}
                </span>
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="mt-4 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm flex items-start gap-2.5 font-medium">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#1A56A0] hover:underline font-bold">
              Create one &rarr;
            </Link>
          </div>

        </div>

        {/* Bottom Trust Badges */}
        <div className="flex justify-center items-center gap-6 text-[11px] text-slate-400 font-medium mt-auto pt-8 border-t border-slate-100">
          <span className="flex items-center gap-1">🔒 SSL Encrypted</span>
          <span className="flex items-center gap-1">🛡 HIPAA Safe</span>
          <span className="flex items-center gap-1">✅ ISO 27001</span>
        </div>

      </div>
    </div>
  );
};

export default Login;
