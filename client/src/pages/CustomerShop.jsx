import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { NavLink } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutGrid, Store, FileText, Bell, User, 
  ShieldCheck, Search, ShoppingCart, Trash2, Plus, Minus, 
  CreditCard, CheckCircle, X, AlertCircle, Download
} from 'lucide-react';



const getRupee = () => String.fromCharCode(Math.random() > 2 ? 0 : 8377);
const CustomerShop = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Cart states
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  
  // Checkout form states
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [lastReceipt, setLastReceipt] = useState(null);

  // Fetch medicines
  const { data: medicines = [], isLoading, isError, error } = useQuery({
    queryKey: ['medicines', search, categoryFilter],
    queryFn: async () => {
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      const { data } = await api.get('/medicines', { params });
      return data;
    },
  });

  // Derive unique categories from real data for pills + dropdown
  const allCategories = useMemo(() => {
    const cats = new Set();
    medicines.forEach(m => { if (m.category) cats.add(m.category); });
    return Array.from(cats).sort();
  }, [medicines]);

  // Also fetch ALL medicines (unfiltered) once to get complete category list
  const { data: allMedicines = [] } = useQuery({
    queryKey: ['allMedicines'],
    queryFn: async () => {
      const { data } = await api.get('/medicines');
      return data;
    },
    staleTime: 60000,
  });

  const fullCategoryList = useMemo(() => {
    const cats = new Set();
    allMedicines.forEach(m => { if (m.category) cats.add(m.category); });
    return Array.from(cats).sort();
  }, [allMedicines]);

  const handleAddToCart = (medicine) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === medicine._id);
      if (existingItem) {
        if (existingItem.quantity >= medicine.quantity) {
          alert(`Cannot add more. Only ${medicine.quantity} units available in stock.`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item._id === medicine._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...medicine, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id, delta) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item._id === id) {
            const newQty = item.quantity + delta;
            if (delta > 0) {
              const med = medicines.find((m) => m._id === id);
              if (med && newQty > med.quantity) {
                alert(`Cannot add more. Only ${med.quantity} units available in stock.`);
                return item;
              }
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const handleRemoveFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== id));
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setCheckoutError('');

    if (!address || !phone || !cardNumber || !expiry || !cvv) {
      setCheckoutError('Please enter all shipping and mock payment details');
      return;
    }

    setIsProcessingCheckout(true);

    try {
      const payload = {
        customerId: currentUser?._id,
        items: cart.map(item => ({
          medicineId: item._id,
          quantity: item.quantity
        })),
        discount: 0,
        paymentMethod: 'Card'
      };

      const { data } = await api.post('/bills', payload);

      setLastReceipt({
        id: data._id,
        billNumber: data.billNumber,
        date: new Date(data.createdAt).toLocaleString(),
        items: data.items,
        total: data.total,
        shippingAddress: address,
      });

      setCart([]);
      setCheckoutOpen(false);
      setCheckoutSuccess(true);
      queryClient.invalidateQueries(['medicines']);
    } catch (err) {
      console.error('Checkout error:', err);
      const serverMessage = err.response?.data?.message || 'Checkout process encountered an error';
      setCheckoutError(serverMessage);
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const handleDownloadPDF = async (billId, billNumber) => {
    try {
      const response = await api.get(`/bills/${billId}/pdf`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `invoice-${billNumber}.pdf`;
      link.click();
    } catch (error) {
      console.error('PDF download error:', error);
      alert('Failed to download invoice PDF.');
    }
  };

  const CATEGORY_COLORS = {
    'Pain Relief':          { bg: '#FCEBEB', text: '#791F1F' },
    'Antibiotics':          { bg: '#E6F1FB', text: '#0C447C' },
    'Antibiotic':           { bg: '#E6F1FB', text: '#0C447C' },
    'Cough & Cold':         { bg: '#EEEDFE', text: '#3C3489' },
    'Allergy':              { bg: '#FAEEDA', text: '#633806' },
    'Cardiovascular':       { bg: '#FDE8E8', text: '#9B1C1C' },
    'Cardiology':           { bg: '#FDE8E8', text: '#9B1C1C' },
    'Diabetes':             { bg: '#FEF3C7', text: '#92400E' },
    'Vitamins':             { bg: '#D1FAE5', text: '#065F46' },
    'Vitamins/Supplements': { bg: '#D1FAE5', text: '#065F46' },
    'Antiviral':            { bg: '#EDE9FE', text: '#5B21B6' },
    'Analgesic':            { bg: '#FCEBEB', text: '#791F1F' },
    'Antihistamine':        { bg: '#FAEEDA', text: '#633806' },
    'Other':                { bg: '#F3F4F6', text: '#374151' },
  };

  const getCategoryStyle = (category) => {
    const c = CATEGORY_COLORS[category];
    if (c) return { backgroundColor: c.bg, color: c.text };
    return { backgroundColor: '#F3F4F6', color: '#374151' };
  };

  const navLinks = [
    { name: 'Dashboard', path: '/customer/dashboard', icon: LayoutGrid },
    { name: 'Medicine Shop', path: '/customer/shop', icon: Store },
    { name: 'Invoice History', path: '/customer/bills', icon: FileText },
    { name: 'Medication Reminders', path: '/customer/reminders', icon: Bell },
    { name: 'My Profile', path: '/customer/profile', icon: User }
  ];

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const userName = currentUser?.name || 'Customer';
  const userEmail = currentUser?.email || '';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen w-screen bg-[#F4F6F9] font-sans antialiased text-slate-800 overflow-hidden">
      
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex w-[188px] shrink-0 bg-white border-r border-[#E5E7EB] flex flex-col justify-between p-4 h-full z-10 select-none">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2.5 pb-5 border-b border-slate-100 mb-5">
            <div className="w-7 h-7 shrink-0 bg-[#0F4BBE] text-white flex items-center justify-center font-bold text-[11px] rounded-lg">
              Rx
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-[12px] tracking-tight uppercase text-slate-900">Pharma</span>
              <span className="font-extrabold text-[12px] tracking-tight uppercase text-[#0F4BBE]">Desk</span>
            </div>
          </div>

          {/* Section label */}
          <div className="px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1.5">
            MENU
          </div>

          {/* Navigation */}
          <nav className="space-y-0.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[12.5px] transition-colors ${
                      isActive
                        ? 'bg-[#EBF2FF] text-[#0F4BBE] font-bold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium'
                    }`
                  }
                >
                  <Icon className="w-[15px] h-[15px] shrink-0" />
                  <span className="truncate">{link.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="bg-[#DEF7EC] border border-[#BCF0DA] p-2.5 rounded-lg flex items-start gap-2 text-[#03543F]">
          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="text-[10px] leading-snug font-medium">
            Secured with dual token rotation
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-14 bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-slate-800 flex md:hidden justify-around items-center z-50 shadow-lg px-1">
        {navLinks.map((link) => {
          const Icon = link.icon;
          let shortName = link.name;
          if (link.name === 'User Control Panel') shortName = 'Users';
          if (link.name === 'Inventory Manager') shortName = 'Inventory';
          if (link.name === 'Medication Reminders') shortName = 'Reminders';
          if (link.name === 'Invoice History') shortName = 'Bills';
          if (link.name === 'My Profile') shortName = 'Profile';
          if (link.name === 'Medicine Shop') shortName = 'Shop';

          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-sky-400 font-semibold'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
                }`
              }
            >
              <Icon className="w-4.5 h-4.5 mb-0.5 shrink-0" />
              <span className="text-[9px] tracking-tight truncate max-w-[65px]">{shortName}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        
        {/* Topbar */}
        <header className="bg-white border-b border-[#E5E7EB] px-5 py-3 flex items-center justify-between shrink-0">
          <div className="min-w-0">
            <h1 className="text-[16px] font-semibold text-slate-900 leading-tight">Medicine Marketplace</h1>
            <p className="text-slate-400 text-[11.5px] mt-0.5 truncate">Browse verified pharmaceuticals and manage your orders</p>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-4">
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-[12px] font-bold text-slate-800 truncate max-w-[140px]">{userName}</span>
              <span className="text-[10.5px] text-slate-400 font-medium truncate max-w-[180px]">{userEmail}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#0F4BBE] text-white flex items-center justify-center font-bold text-[13px] shrink-0">
              {userInitial}
            </div>

            <button
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 px-3 py-[7px] bg-[#0F4BBE] hover:bg-[#0D3FA6] text-white font-semibold rounded-lg text-[12px] transition-colors shrink-0"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>My Cart</span>
              {cartCount > 0 && (
                <span className="bg-white/25 text-white text-[10px] font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-5 pb-20 md:pb-5 space-y-4">
          
          {/* Search + Dropdown */}
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search by name, formula, brand…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white border border-[#D1D5DB] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F4BBE] text-[12.5px] transition-colors"
              />
            </div>

            <div className="relative w-44 shrink-0">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#D1D5DB] text-slate-700 text-[12.5px] focus:outline-none focus:border-[#0F4BBE] appearance-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {fullCategoryList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
                <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setCategoryFilter('')}
                className={`px-3 py-[5px] rounded-full text-[11.5px] font-semibold transition-colors border whitespace-nowrap ${
                  categoryFilter === ''
                    ? 'bg-[#0F4BBE] text-white border-[#0F4BBE]'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                All
              </button>
              {fullCategoryList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-[5px] rounded-full text-[11.5px] font-semibold transition-colors border whitespace-nowrap ${
                    categoryFilter === cat
                      ? 'bg-[#0F4BBE] text-white border-[#0F4BBE]'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Showing {medicines.length} {medicines.length === 1 ? 'medicine' : 'medicines'}
            </p>
          </div>

          {/* Card Grid */}
          {isLoading ? (
            <div className="py-24 flex justify-center">
              <div className="w-8 h-8 border-[3px] border-slate-200 border-t-[#0F4BBE] rounded-full animate-spin"></div>
            </div>
          ) : isError ? (
            <div className="py-24 text-center text-red-600 text-xs">
              <p>Failed loading catalog: {error.message}</p>
            </div>
          ) : medicines.length === 0 ? (
            <div className="py-24 text-center text-slate-400">
              <p className="text-xs font-semibold">No medicines matching your search or filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3">
              {medicines.map((item) => {
                const isLowStock = item.quantity <= 10;
                const catStyle = getCategoryStyle(item.category);
                return (
                  <div 
                    key={item._id} 
                    className="bg-white rounded-xl p-3.5 flex flex-col border border-[#E5E7EB] hover:border-slate-300 transition-colors duration-150"
                  >
                    {/* Top: category + safe */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className="text-[9px] px-2 py-[3px] rounded-full font-bold uppercase whitespace-nowrap leading-none"
                        style={catStyle}
                      >
                        {item.category}
                      </span>
                      <span className="text-[10px] font-semibold text-[#03543F] bg-[#DEF7EC] px-2 py-[3px] rounded-full whitespace-nowrap leading-none flex items-center gap-0.5 shrink-0">
                        ✓ Safe
                      </span>
                    </div>
                    
                    {/* Name + formula */}
                    <h3 className="text-[13px] font-semibold text-slate-900 leading-snug truncate" title={item.name}>
                      {item.name}
                    </h3>
                    <p className="text-[11px] italic text-[#0F4BBE] font-medium mt-0.5 truncate" title={item.genericName}>
                      {item.genericName}
                    </p>
                    
                    {/* Metadata */}
                    <div className="text-[11px] mt-2.5 space-y-[5px] flex-1">
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-400 shrink-0">Brand</span>
                        <span className="font-medium text-slate-700 truncate text-right" title={item.manufacturer}>{item.manufacturer}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-400 shrink-0">Batch</span>
                        <span className="font-medium text-slate-700 truncate text-right" title={item.batchNumber}>{item.batchNumber}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-400 shrink-0">Stock</span>
                        {isLowStock ? (
                          <span className="text-[#854F0B] font-bold">{item.quantity} — Low</span>
                        ) : (
                          <span className="font-medium text-slate-700">{item.quantity}</span>
                        )}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-[#E5E7EB] my-2.5"></div>

                    {/* Price + Add */}
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider leading-none">UNIT PRICE</span>
                        <span className="text-[17px] font-semibold text-slate-900 leading-tight mt-0.5 block">{getRupee()}{item.price.toFixed(2)}</span>
                      </div>

                      {item.quantity === 0 ? (
                        <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded-lg font-bold">
                          Out of Stock
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="px-3 py-[6px] bg-[#0F4BBE] hover:bg-[#0D3FA6] text-white font-semibold text-[12px] rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ─── Shopping Cart Drawer ─── */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/30">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md">
                <div className="flex h-full flex-col bg-white border-l border-[#E5E7EB]">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB]">
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-[#0F4BBE]" />
                      Shopping Cart
                    </h2>
                    <button onClick={() => setCartOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                      <div className="h-full flex flex-col justify-center items-center text-center">
                        <ShoppingCart className="w-10 h-10 text-slate-200 mb-3" />
                        <p className="text-sm font-bold text-slate-600">Your cart is empty</p>
                        <p className="text-xs text-slate-400 mt-0.5">Browse catalog to select items.</p>
                      </div>
                    ) : (
                      cart.map((item) => (
                        <div key={item._id} className="flex gap-3 p-3 bg-slate-50 border border-[#E5E7EB] rounded-xl">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 text-xs truncate">{item.name}</h4>
                            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{item.category}</p>
                            <span className="text-[#0F4BBE] text-xs font-extrabold mt-1.5 inline-block">{getRupee()}{item.price.toFixed(2)}</span>
                          </div>

                          <div className="flex flex-col justify-between items-end shrink-0">
                            <button onClick={() => handleRemoveFromCart(item._id)} className="text-slate-300 hover:text-red-500 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="flex items-center gap-1.5 bg-white rounded-lg border border-[#E5E7EB] p-0.5">
                              <button onClick={() => handleUpdateQuantity(item._id, -1)} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-slate-900 min-w-[16px] text-center">{item.quantity}</span>
                              <button onClick={() => handleUpdateQuantity(item._id, 1)} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {cart.length > 0 && (
                    <div className="border-t border-[#E5E7EB] p-4 bg-slate-50 space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-900">
                        <span>Grand Total:</span>
                        <span className="text-[#0F4BBE] text-base">{getRupee()}{calculateTotal().toFixed(2)}</span>
                      </div>
                      <button
                        onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}
                        className="w-full py-2 bg-[#0F4BBE] hover:bg-[#0D3FA6] text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs"
                      >
                        <CreditCard className="w-4 h-4" />
                        Proceed to Checkout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Checkout Modal ─── */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white w-full max-w-sm rounded-xl border border-[#E5E7EB] p-5 relative">
            <div className="flex justify-between items-center pb-3 border-b border-[#E5E7EB] mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#0F4BBE]" />
                Simulated Billing Portal
              </h3>
              <button onClick={() => setCheckoutOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {checkoutError && (
              <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <div>
                  <span className="font-bold block">System Validation Blocked</span>
                  <span className="text-[10px] leading-relaxed">{checkoutError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleCheckoutSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Shipping Address *</label>
                <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Medical Lane, Cityville"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F4BBE] text-xs" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Phone *</label>
                <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 019-2834"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F4BBE] text-xs" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Mock Card Number *</label>
                <input type="text" required value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="4111 2222 3333 4444"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F4BBE] text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Expiry *</label>
                  <input type="text" required value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F4BBE] text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">CVV *</label>
                  <input type="password" required value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="•••"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-[#D1D5DB] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0F4BBE] text-xs" />
                </div>
              </div>
              <div className="pt-3 border-t border-[#E5E7EB] flex gap-2 justify-end">
                <button type="button" onClick={() => setCheckoutOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors">Cancel</button>
                <button type="submit" disabled={isProcessingCheckout}
                  className="px-4 py-1.5 bg-[#0F4BBE] hover:bg-[#0D3FA6] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 text-xs flex items-center justify-center min-w-[110px]">
                  {isProcessingCheckout ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Confirm Checkout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Receipt Modal ─── */}
      {checkoutSuccess && lastReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white w-full max-w-md rounded-xl border border-[#E5E7EB] p-5 relative text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#DEF7EC] border border-[#BCF0DA] text-[#03543F] mb-3">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Invoice Settled</h3>
            <p className="text-slate-400 text-[11px] mt-0.5">Checkout complete. Inventory decremented.</p>

            <div className="bg-slate-50 border border-[#E5E7EB] rounded-xl p-4 text-left my-4 space-y-3">
              <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-[#E5E7EB] pb-2">
                <div>
                  <span className="block font-semibold">Invoice ID</span>
                  <span className="font-mono text-slate-800 mt-0.5 block">{lastReceipt.billNumber}</span>
                </div>
                <div className="text-right">
                  <span className="block font-semibold">Processed</span>
                  <span className="text-slate-800 mt-0.5 block">{lastReceipt.date}</span>
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Billing Items</span>
                <div className="max-h-24 overflow-y-auto space-y-1.5">
                  {lastReceipt.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-xs text-slate-700">
                      <span className="font-medium truncate mr-2">{item.name} <span className="text-slate-400 text-[10px]">x{item.quantity}</span></span>
                      <span className="font-semibold text-slate-900 font-mono shrink-0">{getRupee()}{(item.unitPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#E5E7EB] pt-2.5">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Shipping Address</span>
                <p className="text-xs text-slate-700 font-medium">{lastReceipt.shippingAddress}</p>
              </div>

              <div className="flex justify-between items-center border-t border-[#E5E7EB] pt-2.5 text-xs font-bold text-slate-900">
                <span>Grand Total</span>
                <span className="text-[#0F4BBE] text-sm font-mono">{getRupee()}{lastReceipt.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => handleDownloadPDF(lastReceipt.id, lastReceipt.billNumber)}
                className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 border border-[#E5E7EB] text-slate-700 font-semibold rounded-lg transition-colors text-xs flex items-center justify-center gap-1.5">
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
              <button onClick={() => setCheckoutSuccess(false)}
                className="flex-1 py-1.5 bg-[#0F4BBE] hover:bg-[#0D3FA6] text-white font-semibold rounded-lg transition-colors text-xs">
                Back to Catalog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerShop;
