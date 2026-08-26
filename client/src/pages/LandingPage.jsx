import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function LandingPage() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDashboardPath = (role) => {
    if (role === 'superadmin') return '/superadmin';
    if (role === 'pharmacist') return '/pharmacist';
    return '/customer/dashboard';
  };

  const medicineShowcase = [
    {
      id: 1,
      name: 'Panadol & Amoxicillin Blister Packs',
      category: 'Antibiotics & Analgesics',
      tag: 'Tablets & Blisters',
      type: 'tablets',
      image: '/images/medicine_pills.jpg',
      score: '99.9%',
      status: 'Verified Pure',
      batch: 'LOT-2026-B8',
      price: '₹145.00',
      stock: 'In Stock (420 units)',
      desc: 'High-grade pharmaceutical grade tablets with AI spectrographic purity inspection passed.'
    },
    {
      id: 2,
      name: 'Naturogen Herbal Syrup & Dropper',
      category: 'Respiratory & Cough Care',
      tag: 'Liquid Formulas',
      type: 'syrups',
      image: '/images/syrup_bottles.jpg',
      score: '98.8%',
      status: 'Verified Pure',
      batch: 'LOT-2026-N4',
      price: '₹185.00',
      stock: 'In Stock (180 units)',
      desc: 'Alcohol-free, standardized botanical herbal cough relief formula with purity seal.'
    },
    {
      id: 3,
      name: 'Bio-Active Nanotech Multi-Capsules',
      category: 'Specialty Supplements',
      tag: 'Bio-Active Capsules',
      type: 'capsules',
      image: '/images/capsules_lab.jpg',
      score: '99.5%',
      status: 'AI Lab Certified',
      batch: 'LOT-2026-NV1',
      price: '₹320.00',
      stock: 'In Stock (95 units)',
      desc: 'Precision sustained-release micro-particle formulation tested under automated AI robotics.'
    },
  ];

  const filteredMedicines = activeTab === 'all' 
    ? medicineShowcase 
    : medicineShowcase.filter(m => m.type === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080E1A] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* 1️⃣ NAVBAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 dark:bg-[#080E1A]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-black/5 py-3'
          : 'bg-transparent py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1A56A0] to-[#0ea5e9] flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <span className="text-base font-black text-white">⚕</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center font-extrabold text-sm tracking-tight">
                <span className="text-slate-900 dark:text-white">PHARMA</span>
                <span className="text-[#1A56A0] dark:text-cyan-400 ml-1">DESK</span>
                <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded border border-cyan-500/20">AI</span>
              </div>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 -mt-0.5 font-medium">Quality & Management</span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#hero" className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#1A56A0] dark:hover:text-cyan-400 transition-colors">Home</a>
            <a href="#showcase" className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#1A56A0] dark:hover:text-cyan-400 transition-colors">Medicine Quality</a>
            <a href="#features" className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#1A56A0] dark:hover:text-cyan-400 transition-colors">Core Features</a>
            <a href="#roles" className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#1A56A0] dark:hover:text-cyan-400 transition-colors">For Users</a>
            <a href="#how-it-works" className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#1A56A0] dark:hover:text-cyan-400 transition-colors">Workflow</a>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button 
              onClick={toggle} 
              className="p-2 rounded-xl transition-all border border-slate-200 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
                <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {user ? (
              <Link 
                to={getDashboardPath(user.role)}
                className="text-xs font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-[#1A56A0] to-[#0ea5e9] hover:from-[#154682] hover:to-[#0284c7] text-white transition-all shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-0.5"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login" 
                  className="text-xs font-semibold px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-[#1A56A0] dark:hover:text-cyan-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="text-xs font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-[#1A56A0] to-[#0ea5e9] hover:from-[#154682] hover:to-[#0284c7] text-white transition-all shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 2️⃣ HERO SECTION WITH CINEMATIC IMAGE & HUD OVERLAY */}
      <section id="hero" className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-blue-600/15 via-cyan-500/10 to-emerald-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#1A56A0] dark:text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider">Next-Gen AI Medicine Quality & POS Platform</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
                Intelligent Medicine Quality, <span className="bg-gradient-to-r from-[#1A56A0] via-cyan-500 to-emerald-500 bg-clip-text text-transparent">Zero Compromise</span> Healthcare.
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Empowering pharmacists and patients with automated chemical purity checks, real-time batch expiry alerts, smart prescription POS invoicing, and automated SMS medication reminders.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {user ? (
                  <Link
                    to={getDashboardPath(user.role)}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#1A56A0] to-[#0ea5e9] text-white font-bold text-sm shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                  >
                    <span>Open Dashboard</span>
                    <span>→</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#1A56A0] to-[#0ea5e9] text-white font-bold text-sm shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    >
                      <span>Get Started Free</span>
                      <span>→</span>
                    </Link>
                    <a
                      href="#showcase"
                      className="px-6 py-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all flex items-center gap-2"
                    >
                      <span>Explore Medicines</span>
                      <span className="text-cyan-500">↓</span>
                    </a>
                  </>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex flex-col">
                  <span className="text-lg font-black text-slate-900 dark:text-white">99.8%</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">AI Purity Score</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black text-slate-900 dark:text-white">Instant</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Expiry Detection</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black text-slate-900 dark:text-white">SMS Active</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Patient Reminders</span>
                </div>
              </div>

            </div>

            {/* Right Hero Image with Live Holographic Card Frame */}
            <div className="lg:col-span-6 relative">
              <div className="relative group">
                
                {/* Glow Backdrop */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-1000 -z-10" />

                {/* Main Hero Image Container */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-cyan-500/30 shadow-2xl bg-slate-900">
                  <img 
                    src="/images/hero_pharmacy.jpg" 
                    alt="AI-based medicine quality analysis laboratory" 
                    className="w-full h-[360px] sm:h-[420px] object-cover object-center transform group-hover:scale-102 transition-transform duration-700"
                  />
                  
                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                  {/* Floating Overlay Badge 1: Top Left */}
                  <div className="absolute top-4 left-4 backdrop-blur-md bg-slate-900/80 border border-cyan-400/40 rounded-xl p-2.5 shadow-lg flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">AI Quality Inspection</div>
                      <div className="text-xs font-black text-white">99.8% Purity Verified</div>
                    </div>
                  </div>

                  {/* Floating Overlay Badge 2: Bottom Right */}
                  <div className="absolute bottom-4 right-4 backdrop-blur-md bg-slate-900/85 border border-emerald-400/40 rounded-xl p-3 shadow-xl max-w-[240px]">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold text-slate-300">Batch Inspection</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">PASS</span>
                    </div>
                    <div className="text-xs font-bold text-white truncate">Cefuroxime Axetil 500mg</div>
                    <div className="text-[10px] text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Active ingredient verified
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3️⃣ LIVE MEDICINE SHOWCASE & AI QUALITY CARDS */}
      <section id="showcase" className="py-16 bg-white dark:bg-[#0B1322] border-y border-slate-200 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Verified Medicine Inventory</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Live Medicine Purity & Catalog
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                Every pharmaceutical batch is cataloged, monitored for expiry, and certified with AI quality purity scores before dispensing.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 self-start md:self-auto">
              <button 
                onClick={() => setActiveTab('all')} 
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'all' ? 'bg-[#1A56A0] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                All Products
              </button>
              <button 
                onClick={() => setActiveTab('tablets')} 
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'tablets' ? 'bg-[#1A56A0] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Tablets & Blisters
              </button>
              <button 
                onClick={() => setActiveTab('syrups')} 
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'syrups' ? 'bg-[#1A56A0] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Syrups & Liquids
              </button>
              <button 
                onClick={() => setActiveTab('capsules')} 
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'capsules' ? 'bg-[#1A56A0] text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Capsules
              </button>
            </div>
          </div>

          {/* Medicine Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredMedicines.map((med) => (
              <div 
                key={med.id}
                className="group rounded-2xl bg-slate-50 dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Image Showcase */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
                  <img 
                    src={med.image} 
                    alt={med.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-cyan-300 border border-cyan-400/30 shadow">
                      {med.tag}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/90 text-white shadow">
                    <span>✓</span>
                    <span>AI Score: {med.score}</span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center px-3 py-1.5 rounded-xl bg-slate-950/75 backdrop-blur-md border border-white/10 text-white">
                    <span className="text-[11px] font-medium text-slate-300">Batch: {med.batch}</span>
                    <span className="text-xs font-bold text-emerald-400">{med.status}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1A56A0] dark:text-cyan-400 block mb-1">
                      {med.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight group-hover:text-[#1A56A0] dark:group-hover:text-cyan-400 transition-colors">
                      {med.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      {med.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Standard Unit Price</span>
                      <span className="text-base font-black text-slate-900 dark:text-white">{med.price}</span>
                    </div>
                    <Link
                      to="/login"
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1A56A0]/10 dark:bg-cyan-500/10 text-[#1A56A0] dark:text-cyan-400 hover:bg-[#1A56A0] hover:text-white dark:hover:bg-cyan-500 dark:hover:text-slate-950 transition-all"
                    >
                      View in Catalog →
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4️⃣ VISUAL FEATURE CARDS WITH AUTHENTIC MEDICAL PHOTOGRAPHY */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1A56A0] dark:text-cyan-400">
            End-to-End Pharmacy Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Built for High-Precision Pharmacy Operations
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Discover the 3 integrated pillars of Pharmadesk: Quality Scanning, POS Dispensing, and Patient Adherence.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Feature 1 */}
          <div className="rounded-2xl bg-white dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col">
            <div className="relative h-48 overflow-hidden bg-slate-900">
              <img 
                src="/images/capsules_lab.jpg" 
                alt="AI Medicine Quality Verification" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                  Spectrographic AI Check
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  Automated
                </span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  AI Quality & Batch Safety
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Real-time batch validation analyzes chemical compound consistency, alerts for counterfeit indicators, and tracks batch expiration milestones automatically.
                </p>
              </div>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-cyan-500 font-bold">✓</span> Real-time Purity Verification
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-500 font-bold">✓</span> Color-Coded Expiry Badges
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="rounded-2xl bg-white dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col">
            <div className="relative h-48 overflow-hidden bg-slate-900">
              <img 
                src="/images/pharmacist_counter.jpg" 
                alt="Pharmacist POS & Billing Counter" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Instant POS Invoicing
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Live Sync
                </span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  Prescription Billing & POS
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Pharmacists generate detailed printable invoices with automatic stock deduction, discount calculators, and immediate customer ledger synchronization.
                </p>
              </div>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> PDF Invoicing & Receipt Printing
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Real-Time Stock Balance Update
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="rounded-2xl bg-white dark:bg-[#10192A] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col">
            <div className="relative h-48 overflow-hidden bg-slate-900">
              <img 
                src="/images/medicine_reminder.jpg" 
                alt="SMS & Medication Reminders" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  Daily SMS Dispatches
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Twilio API
                </span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  Automated Medication Reminders
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Never miss a dose. Patients configure customized daily dosage schedules that trigger browser notifications and direct SMS dispatches to mobile phones.
                </p>
              </div>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-amber-500 font-bold">✓</span> Hourly Cron Alarm Triggers
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-500 font-bold">✓</span> Patient Compliance Tracking
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* 5️⃣ DUAL ROLE SECTION (PHARMACISTS & PATIENTS) */}
      <section id="roles" className="py-20 bg-slate-100/70 dark:bg-[#0B1322] border-y border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1A56A0] dark:text-cyan-400">
              Tailored Portals
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Purpose-Built For Both Roles
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* For Customers */}
            <div className="rounded-3xl p-8 bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-cyan-500/10 border border-blue-500/20 text-[#1A56A0] dark:text-cyan-400 flex items-center justify-center text-xl">
                  👤
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">For Patients & Customers</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Take full control of your medication regimen, view verified pharmacy receipts, and ensure you never miss critical treatment doses.
                </p>

                <div className="space-y-2.5 pt-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <span className="text-emerald-500 font-bold">✓</span> Direct access to public medicine shop & online inventory
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-emerald-500 font-bold">✓</span> Personal dashboard with invoice statements & PDF downloads
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-emerald-500 font-bold">✓</span> Configurable daily SMS reminder alarms for your prescriptions
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-emerald-500 font-bold">✓</span> Automated safety advisories for expiring medicines
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link
                  to="/register"
                  className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#1A56A0] dark:hover:bg-cyan-400 transition-all shadow-md"
                >
                  <span>Register as Patient</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* For Pharmacists */}
            <div className="rounded-3xl p-8 bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl">
                  🏪
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">For Pharmacists & Chemists</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Streamline all daily store operations, generate instant GST-compliant bills, track inventory expiration, and monitor sales analytics.
                </p>

                <div className="space-y-2.5 pt-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <span className="text-emerald-500 font-bold">✓</span> High-speed point-of-sale bill generator with auto stock deduction
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-emerald-500 font-bold">✓</span> Batch inventory manager with low-stock and expiry warnings
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-emerald-500 font-bold">✓</span> Sales analytics, revenue charts, and customer purchase logs
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-emerald-500 font-bold">✓</span> Medicine catalog administration & quality verification scoring
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Link
                  to="/register"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1A56A0] to-[#0ea5e9] text-white font-bold text-xs flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                >
                  <span>Register as Pharmacist</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6️⃣ HOW IT WORKS 3-STEP FLOW */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1A56A0] dark:text-cyan-400">
            Simple Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Getting Started in 3 Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          <div className="p-6 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 space-y-3 relative shadow-sm">
            <span className="text-3xl font-black text-slate-300 dark:text-slate-700">01</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Your Account</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Sign up in seconds and choose whether you are a patient/customer or licensed pharmacist.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 space-y-3 relative shadow-sm">
            <span className="text-3xl font-black text-slate-300 dark:text-slate-700">02</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Access Smart Tools</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Pharmacists manage medicine inventory and billing; patients review invoices and configure SMS reminders.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#111C30] border border-slate-200 dark:border-slate-800 space-y-3 relative shadow-sm">
            <span className="text-3xl font-black text-slate-300 dark:text-slate-700">03</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Automate Healthcare</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Enjoy automated quality tracking, real-time safety advisories, and uninterrupted SMS reminders.
            </p>
          </div>

        </div>
      </section>

      {/* 7️⃣ CTA BANNER */}
      <section className="py-16 bg-gradient-to-r from-[#1A56A0] via-blue-700 to-cyan-600 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6 relative z-10">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Ready to Upgrade Your Medicine Management?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto leading-relaxed">
            Join Pharmadesk today. Experience intelligent quality checking, rapid prescription billing, and automated patient reminders.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            {user ? (
              <Link
                to={getDashboardPath(user.role)}
                className="px-8 py-3.5 rounded-xl bg-white text-slate-950 font-extrabold text-sm shadow-2xl hover:bg-slate-100 hover:scale-105 transition-all"
              >
                Access Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-3.5 rounded-xl bg-white text-slate-950 font-extrabold text-sm shadow-2xl hover:bg-slate-100 hover:scale-105 transition-all"
                >
                  Create Free Account
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3.5 rounded-xl bg-blue-900/60 border border-white/20 text-white font-bold text-sm hover:bg-blue-900/80 transition-all"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 8️⃣ MODERN FOOTER */}
      <footer className="py-10 bg-white dark:bg-[#080E1A] border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#1A56A0] flex items-center justify-center text-white text-xs font-bold">
              ⚕
            </div>
            <span className="font-bold text-slate-900 dark:text-white">Pharmadesk AI Medicine Quality System</span>
          </div>
          <div>
            <span>&copy; 2026 Pharmadesk. Final Year Engineering Project. All rights reserved.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
