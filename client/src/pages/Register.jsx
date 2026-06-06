import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register, user } = useAuth();

  // State variables exactly as required by the spec
  const [firstName, setFirstName]           = useState('');
  const [lastName, setLastName]             = useState('');
  const [email, setEmail]                   = useState('');
  const [phone, setPhone]                   = useState('');
  const [role, setRole]                     = useState('customer');
  const [shopName, setShopName]             = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass]             = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [errors, setErrors]                 = useState({});
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [apiError, setApiError]             = useState('');

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

  // Auto-redirect on active login session
  useEffect(() => {
    if (user) {
      if (user.role === 'superadmin') navigate('/superadmin');
      else if (user.role === 'pharmacist') navigate('/pharmacist');
      else navigate('/customer');
    }
  }, [user, navigate]);

  // Dynamic helper to calculate password strength
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200', textClass: 'text-slate-400' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-red-500', textClass: 'text-red-500' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500', textClass: 'text-amber-500' };
      case 3:
        return { score: 3, label: 'Good', color: 'bg-blue-500', textClass: 'text-blue-500' };
      case 4:
        return { score: 4, label: 'Strong', color: 'bg-green-500', textClass: 'text-green-500' };
      default:
        return { score: 0, label: 'Very Weak', color: 'bg-red-500', textClass: 'text-red-500' };
    }
  };

  const strength = getPasswordStrength(password);

  // Clear field-level error as soon as user types
  const handleInputChange = (field, value, setter) => {
    setter(value);
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Run all field checks and return error map
  const validate = () => {
    const errs = {};
    if (!firstName.trim()) errs.firstName = 'Required';
    if (!lastName.trim()) errs.lastName = 'Required';
    
    if (!email.trim()) {
      errs.email = 'Required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Enter a valid email';
    }
    
    if (!phone.trim()) errs.phone = 'Required';
    if (!role) errs.role = 'Please select a role';
    
    if (role === 'pharmacist' && !shopName.trim()) {
      errs.shopName = 'Shop name is required for pharmacists';
    }
    
    if (!password) {
      errs.password = 'Required';
    } else if (password.length < 6) {
      errs.password = 'At least 6 characters';
    }
    
    if (!confirmPassword) {
      errs.confirmPassword = 'Required';
    } else if (confirmPassword !== password) {
      errs.confirmPassword = 'Passwords do not match';
    }
    
    return errs;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setIsSubmitting(true);
    setApiError('');
    try {
      // Concatenate name for AuthContext; pass shopName only for pharmacists
      await register(
        `${firstName} ${lastName}`,
        email,
        password,
        role,
        phone,
        role === 'pharmacist' ? shopName : undefined
      );
      // AuthContext sets user → useEffect above handles redirect
    } catch (err) {
      setApiError(err?.message || err || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    'Fill in your details and choose your role',
    'Your account is created instantly',
    'Sign in and access your dashboard',
  ];

  return (
    <div className="min-h-screen flex font-sans">
      {/* Inject custom Shimmer style for submit button */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .shimmer-btn::after {
          position: absolute;
          top: 0; right: 0; bottom: 0; left: 0;
          transform: translateX(-100%);
          background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.15) 20%,
            rgba(255, 255, 255, 0.3) 60%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmer 2.5s infinite;
          content: '';
        }
      `}</style>

      {/* LEFT PANEL — Decorative (45% width, hidden on mobile) */}
      <div className="hidden md:flex md:w-[45%] flex-col justify-between bg-[#0C1628] p-12 relative overflow-hidden">
        {/* Subtle grid lines background overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

        {/* Glow Orbs */}
        <div className="absolute w-64 h-64 -top-16 -left-16 bg-blue-600/20 rounded-full blur-[60px] pointer-events-none"></div>
        <div className="absolute w-52 h-52 -bottom-8 -right-10 bg-teal-400/10 rounded-full blur-[60px] pointer-events-none"></div>

        {/* Brand Mark */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1A56A0] flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-xl font-bold text-white">⚕</span>
          </div>
          <div>
            <span className="block font-bold text-lg tracking-tight text-white">Pharmadesk</span>
            <span className="block text-[9px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">
              Pharmacy Management System
            </span>
          </div>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 my-auto py-12 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
            <span>Join the platform</span>
          </div>
          <h1 className="font-['Sora'] font-extrabold text-4xl lg:text-5xl leading-tight text-white tracking-tight space-y-2">
            <span className="block">Your account,</span>
            <span className="block">your medicines,</span>
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
              all in one place.
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-6 font-medium leading-relaxed">
            Create your account in under a minute and get instant access to your medicine history, dosage guides, and reminders.
          </p>
        </div>

        {/* Three Steps */}
        <div className="relative z-10 space-y-6 max-w-md">
          {/* Vertical Connector Line */}
          <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-800 pointer-events-none z-0"></div>
          
          {steps.map((step, index) => (
            <div key={index} className="flex items-start gap-4 relative z-10">
              <div className="w-8 h-8 rounded-full bg-[#0d1e36] border border-slate-700/60 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                {index + 1}
              </div>
              <span className="text-xs lg:text-sm font-medium text-slate-300 leading-normal pt-1">
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL — Form container (55% width) */}
      <div className="w-full md:w-[55%] bg-white flex flex-col justify-center px-8 py-10 md:px-16 overflow-y-auto">
        <div className="max-w-lg w-full mx-auto">
          {/* Header Block */}
          <div className="mb-8">
            <span className="block text-[10px] font-bold tracking-widest uppercase text-[#1A56A0] mb-1.5">New Account</span>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">Create your account</h2>
            <p className="text-sm text-slate-400 mt-2 font-medium">All fields are required</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* API Error Banner */}
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm font-medium flex items-start gap-2.5">
                <svg className="w-5 h-5 shrink-0 mt-0.5 text-red-500" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{apiError}</span>
              </div>
            )}

            {/* FIELD 1: Full Name (First and Last Name side by side) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value, setFirstName)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#1A56A0] focus:ring-2 focus:ring-blue-500/30 transition-all text-sm ${
                      errors.firstName ? 'border-red-400' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.firstName && (
                  <span className="text-xs text-red-400 mt-1 block font-medium">{errors.firstName}</span>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value, setLastName)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#1A56A0] focus:ring-2 focus:ring-blue-500/30 transition-all text-sm ${
                      errors.lastName ? 'border-red-400' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.lastName && (
                  <span className="text-xs text-red-400 mt-1 block font-medium">{errors.lastName}</span>
                )}
              </div>
            </div>

            {/* FIELD 2: Email Address */}
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => handleInputChange('email', e.target.value, setEmail)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#1A56A0] focus:ring-2 focus:ring-blue-500/30 transition-all text-sm ${
                    errors.email ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.email && (
                <span className="text-xs text-red-400 mt-1 block font-medium">{errors.email}</span>
              )}
            </div>

            {/* FIELD 3: Phone Number */}
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                </div>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => handleInputChange('phone', e.target.value, setPhone)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#1A56A0] focus:ring-2 focus:ring-blue-500/30 transition-all text-sm ${
                    errors.phone ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.phone && (
                <span className="text-xs text-red-400 mt-1 block font-medium">{errors.phone}</span>
              )}
            </div>

            {/* FIELD 4: User Role */}
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">
                User Role
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                </div>
                <select
                  value={role}
                  onChange={(e) => handleInputChange('role', e.target.value, setRole)}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:border-[#1A56A0] focus:ring-2 focus:ring-blue-500/30 transition-all text-sm appearance-none ${
                    errors.role ? 'border-red-400' : 'border-slate-200'
                  }`}
                >
                  <option value="customer">Customer / Patient</option>
                  <option value="pharmacist">Pharmacist</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* Role Pill Selectors */}
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleInputChange('role', 'customer', setRole)}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition-all text-center ${
                    role === 'customer'
                      ? 'border-[#1A56A0] bg-blue-50 text-[#1A56A0] shadow-sm shadow-[#1A56A0]/5'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  Customer / Patient
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('role', 'pharmacist', setRole)}
                  className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition-all text-center ${
                    role === 'pharmacist'
                      ? 'border-[#1A56A0] bg-blue-50 text-[#1A56A0] shadow-sm shadow-[#1A56A0]/5'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  Pharmacist
                </button>
              </div>
              {errors.role && (
                <span className="text-xs text-red-400 mt-1 block font-medium">{errors.role}</span>
              )}
            </div>

            {/* FIELD 5: Pharmacy/Shop Name (Conditional pharmacy field using max-h-0 / max-h-24 transition) */}
            <div className={`transition-all duration-300 overflow-hidden ${role === 'pharmacist' ? 'max-h-28 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
              <div className="pb-5">
                <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">
                  Pharmacy / Shop Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M3 21h18" />
                      <path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1H3" />
                      <path d="M19 21V10.75M5 21V10.75" />
                      <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. MediCare Pharmacy"
                    value={shopName}
                    onChange={(e) => handleInputChange('shopName', e.target.value, setShopName)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#1A56A0] focus:ring-2 focus:ring-blue-500/30 transition-all text-sm ${
                      errors.shopName ? 'border-red-400' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.shopName && (
                  <span className="text-xs text-red-400 mt-1 block font-medium">{errors.shopName}</span>
                )}
              </div>
            </div>

            {/* FIELD 6: Password */}
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => handleInputChange('password', e.target.value, setPassword)}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#1A56A0] focus:ring-2 focus:ring-blue-500/30 transition-all text-sm ${
                    errors.password ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {/* 4-segment password strength bar */}
              <div className="flex gap-1.5 mt-2">
                {[1, 2, 3, 4].map((num) => (
                  <div
                    key={num}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      strength.score >= num ? strength.color : 'bg-slate-100'
                    }`}
                  ></div>
                ))}
              </div>
              {password && (
                <span className={`text-[11px] font-semibold mt-1.5 block transition-colors duration-300 ${strength.textClass}`}>
                  Password Strength: {strength.label}
                </span>
              )}
              {errors.password && (
                <span className="text-xs text-red-400 mt-1 block font-medium">{errors.password}</span>
              )}
            </div>

            {/* FIELD 7: Confirm Password */}
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value, setConfirmPassword)}
                  className={`w-full pl-10 pr-10 py-3 rounded-xl border bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#1A56A0] focus:ring-2 focus:ring-blue-500/30 transition-all text-sm ${
                    errors.confirmPassword ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirm ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="text-xs text-red-400 mt-1 block font-medium">{errors.confirmPassword}</span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: 'linear-gradient(135deg, #1A56A0, #0ea5e9)',
                boxShadow: '0 4px 20px rgba(26,86,160,.35)',
              }}
              className="w-full py-3 px-4 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-6 relative overflow-hidden shimmer-btn"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating account…</span>
                </div>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-[#1A56A0] hover:underline font-bold">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
