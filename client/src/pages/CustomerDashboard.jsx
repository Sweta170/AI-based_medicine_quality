import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  Pills, Search, Filter, ShoppingCart, Trash2, Plus, Minus, 
  CreditCard, CheckCircle, X, ShieldAlert, ShoppingBag, AlertCircle, FileText, Download, History, Bell, Phone, Clock
} from 'lucide-react';

const CustomerDashboard = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('shop'); // 'shop', 'history', or 'reminders'
  
  // Search and filter states
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

  // Reminder form states
  const [remMedicineName, setRemMedicineName] = useState('');
  const [remPhoneNumber, setRemPhoneNumber] = useState('');
  const [remTime, setRemTime] = useState('10:00 AM');
  const [reminderError, setReminderError] = useState('');
  const [reminderSuccess, setReminderSuccess] = useState('');

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

  // Fetch customer bills (history)
  const { data: bills = [], isLoading: billsLoading } = useQuery({
    queryKey: ['bills', currentUser?._id],
    queryFn: async () => {
      if (!currentUser?._id) return [];
      const { data } = await api.get(`/bills/customer/${currentUser._id}`);
      return data;
    },
    enabled: activeTab === 'history',
  });

  // Fetch customer reminders
  const { data: reminders = [], isLoading: remindersLoading } = useQuery({
    queryKey: ['reminders', currentUser?._id],
    queryFn: async () => {
      if (!currentUser?._id) return [];
      const { data } = await api.get(`/notifications/reminders/customer/${currentUser._id}`);
      return data;
    },
    enabled: activeTab === 'reminders',
  });

  // Fetch notification history logs for customer
  const { data: notificationLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['notificationLogs', currentUser?._id],
    queryFn: async () => {
      if (!currentUser?._id) return [];
      const { data } = await api.get(`/notifications/${currentUser._id}`);
      return data;
    },
    enabled: activeTab === 'reminders',
  });

  // Mutation to create reminder
  const createReminderMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/notifications/reminders', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reminders', currentUser?._id]);
      setRemMedicineName('');
      setRemPhoneNumber('');
      setReminderSuccess('Reminder registered successfully!');
      setTimeout(() => setReminderSuccess(''), 3000);
    },
    onError: (err) => {
      setReminderError(err.response?.data?.message || 'Failed to create reminder');
      setTimeout(() => setReminderError(''), 3000);
    }
  });

  // Mutation to delete reminder
  const deleteReminderMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/notifications/reminders/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reminders', currentUser?._id]);
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to delete reminder');
    }
  });

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
            if (delta > 0 && newQty > item.quantity) {
              alert(`Only ${item.quantity} units available in stock.`);
              return item;
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

  const handleAddReminder = (e) => {
    e.preventDefault();
    setReminderError('');
    setReminderSuccess('');

    if (!remMedicineName || !remPhoneNumber) {
      setReminderError('Please enter both medicine name and phone number');
      return;
    }

    createReminderMutation.mutate({
      medicineName: remMedicineName,
      phoneNumber: remPhoneNumber,
      time: remTime,
    });
  };

  const handleDeleteReminder = (id) => {
    if (window.confirm('Cancel this SMS medication reminder?')) {
      deleteReminderMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Medicine Marketplace</h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse verified pharmaceuticals, examine expiry levels, and buy medicines.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all font-semibold ${
              activeTab === 'shop'
                ? 'bg-brand-500/10 text-brand-400 border-brand-500/20 shadow'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Go Shopping</span>
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all font-semibold ${
              activeTab === 'history'
                ? 'bg-brand-500/10 text-brand-400 border-brand-500/20 shadow'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <History className="w-5 h-5" />
            <span>Order History</span>
          </button>

          <button
            onClick={() => setActiveTab('reminders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all font-semibold ${
              activeTab === 'reminders'
                ? 'bg-brand-500/10 text-brand-400 border-brand-500/20 shadow'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span>Reminders & Alerts</span>
          </button>
          
          {activeTab === 'shop' && (
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20 animate-glow"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>My Cart</span>
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-darkbg-950">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {activeTab === 'shop' ? (
        <>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.02] p-4 rounded-2xl border border-white/5">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search catalog by name, generic, manufacturer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
              />
            </div>

            <div className="relative w-full md:w-48">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Filter className="w-4 h-4" />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-darkbg-950 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500 appearance-none"
              >
                <option value="">All Categories</option>
                <option value="Antibiotic">Antibiotic</option>
                <option value="Analgesic">Analgesic</option>
                <option value="Antihistamine">Antihistamine</option>
                <option value="Antiviral">Antiviral</option>
                <option value="Cardiovascular">Cardiovascular</option>
                <option value="Diabetes">Diabetes</option>
                <option value="Vitamins/Supplements">Vitamins/Supplements</option>
                <option value="Other">Other</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Grid Content */}
          {isLoading ? (
            <div className="py-20 flex justify-center">
              <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
            </div>
          ) : isError ? (
            <div className="py-20 text-center text-red-400">
              <p>Failed loading catalog: {error.message}</p>
            </div>
          ) : medicines.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <p className="text-base font-medium">No medicines matching specifications currently available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {medicines.map((item) => {
                const expired = item.expiryStatus === 'EXPIRED';
                const critical = item.expiryStatus === 'CRITICAL';
                
                return (
                  <div key={item._id} className={`glass-card rounded-2xl p-6 flex flex-col justify-between h-72 border ${
                    expired ? 'border-red-500/10 hover:border-red-500/20' : 'border-white/5 hover:border-brand-500/20'
                  }`}>
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20">
                          {item.category}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          expired ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          critical ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20' :
                          'bg-slate-800 text-slate-400 border border-slate-700/50'
                        }`}>
                          {item.expiryStatus}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-white mt-3 leading-tight flex flex-col">
                        <span>{item.name}</span>
                        <span className="text-xs text-slate-400 font-medium italic mt-0.5">Formula: {item.genericName}</span>
                      </h3>
                      
                      <p className="text-slate-500 text-xs mt-1.5 font-medium">
                        Brand: {item.manufacturer} | Batch: {item.batchNumber}
                      </p>
                      
                      <p className="text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">
                        {item.description || 'Verified pharmaceutical medicine for general healthcare usage.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-4">
                      <div>
                        <span className="text-xs text-slate-400 block">Unit Price</span>
                        <span className="text-xl font-bold text-white">${item.price.toFixed(2)}</span>
                      </div>

                      {item.quantity === 0 ? (
                        <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-xl font-bold">
                          Out of Stock
                        </span>
                      ) : expired ? (
                        <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1.5 rounded-xl font-extrabold" title="Expired items cannot be added to bills">
                          EXPIRED - BLOCKED
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="px-4 py-2 bg-brand-500 hover:bg-brand-400 text-white font-semibold text-xs rounded-xl shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-all flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : activeTab === 'history' ? (
        /* History Section */
        <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-brand-400" />
              <span>Your Billing Invoices</span>
            </h2>
          </div>

          {billsLoading ? (
            <div className="py-20 flex justify-center">
              <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
            </div>
          ) : bills.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <p className="text-base font-semibold">No order receipts registered under your profile.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-white/[0.02]">
                    <th className="py-4 px-6">Invoice Number</th>
                    <th className="py-4 px-6">Purchase Date</th>
                    <th className="py-4 px-6">Items Count</th>
                    <th className="py-4 px-6">Total Billed</th>
                    <th className="py-4 px-6">Payment</th>
                    <th className="py-4 px-6 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bills.map((bill) => (
                    <tr key={bill._id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-mono text-brand-400 font-semibold">{bill.billNumber}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        {new Date(bill.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        {bill.items.reduce((sum, i) => sum + i.quantity, 0)} units
                      </td>
                      <td className="py-4 px-6 text-white font-bold">${bill.total.toFixed(2)}</td>
                      <td className="py-4 px-6 text-slate-400">{bill.paymentMethod}</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDownloadPDF(bill._id, bill.billNumber)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/20 rounded-lg text-xs font-semibold transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF Invoice</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Reminders Tab */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Create Reminder Form */}
          <div className="glass-card p-6 rounded-3xl border border-white/5 h-max">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-3">
              <Bell className="w-5 h-5 text-brand-400" />
              <span>Set SMS Reminder</span>
            </h2>

            {reminderSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl">
                {reminderSuccess}
              </div>
            )}
            {reminderError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-start gap-1">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{reminderError}</span>
              </div>
            )}

            <form onSubmit={handleAddReminder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Medicine Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Pills className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={remMedicineName}
                    onChange={(e) => setRemMedicineName(e.target.value)}
                    placeholder="e.g. Aspirin 100mg"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Mobile Number (SMS) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={remPhoneNumber}
                    onChange={(e) => setRemPhoneNumber(e.target.value)}
                    placeholder="e.g. +15551234567"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Schedule Time
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Clock className="w-4 h-4" />
                  </div>
                  <select
                    value={remTime}
                    onChange={(e) => setRemTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-darkbg-950 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500"
                  >
                    <option value="08:00 AM">08:00 AM</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM (Twilio Daily Cron)</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="08:00 PM">08:00 PM</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={createReminderMutation.isPending}
                className="w-full py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-1.5"
              >
                {createReminderMutation.isPending ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>Register Reminder</span>
              </button>
            </form>
          </div>

          {/* Active Reminders List & History logs */}
          <div className="md:col-span-2 space-y-6">
            {/* Active Reminders */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-400" />
                <span>Active Medication Timers</span>
              </h3>

              {remindersLoading ? (
                <div className="py-8 flex justify-center">
                  <div className="w-8 h-8 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
                </div>
              ) : reminders.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No active medication alarms set.</p>
              ) : (
                <div className="divide-y divide-white/5 max-h-60 overflow-y-auto pr-2">
                  {reminders.map((r) => (
                    <div key={r._id} className="flex justify-between items-center py-3">
                      <div>
                        <div className="font-semibold text-white text-sm">{r.medicineName}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{r.phoneNumber}</span>
                          <span className="text-slate-600">|</span>
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{r.time}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteReminder(r._id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20"
                        title="Cancel reminder"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notification logs */}
            <div className="glass-panel p-6 rounded-3xl border border-white/5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <History className="w-4 h-4 text-brand-400" />
                <span>System Notification Log History</span>
              </h3>

              {logsLoading ? (
                <div className="py-8 flex justify-center">
                  <div className="w-8 h-8 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
                </div>
              ) : notificationLogs.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center font-medium">No system alerts logged under your profile yet.</p>
              ) : (
                <div className="divide-y divide-white/5 max-h-64 overflow-y-auto pr-2 space-y-1">
                  {notificationLogs.map((log) => (
                    <div key={log._id} className="py-3 flex justify-between items-start gap-4">
                      <div>
                        <div className="text-xs font-semibold px-2 py-0.5 rounded w-max text-center uppercase bg-white/5 border border-white/5 text-slate-300">
                          {log.type}
                        </div>
                        <p className="text-sm text-slate-200 mt-1.5 leading-relaxed">{log.message}</p>
                        <span className="text-[10px] text-slate-500 block mt-1">
                          {new Date(log.sentAt).toLocaleString()}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        log.status === 'sent' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shopping Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md">
                <div className="flex h-full flex-col bg-darkbg-950 border-l border-white/10 shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-brand-400" />
                      <span>Shopping Cart</span>
                    </h2>
                    <button
                      onClick={() => setCartOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {cart.length === 0 ? (
                      <div className="h-full flex flex-col justify-center items-center text-center text-slate-400">
                        <ShoppingBag className="w-12 h-12 text-slate-500 mb-4 animate-bounce" />
                        <p className="text-base font-semibold">Your cart is empty</p>
                        <p className="text-xs text-slate-500 mt-1">Browse catalog to select items.</p>
                      </div>
                    ) : (
                      cart.map((item) => {
                        const expired = item.expiryStatus === 'EXPIRED';
                        return (
                          <div key={item._id} className={`flex gap-4 p-4 bg-white/[0.02] border rounded-2xl ${
                            expired ? 'border-red-500/20 bg-red-500/[0.02]' : 'border-white/5'
                          }`}>
                            <div className="flex-1">
                              <h4 className="font-semibold text-white text-sm flex items-center gap-1.5">
                                <span>{item.name}</span>
                                {expired && (
                                  <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 rounded font-extrabold animate-pulse">
                                    EXPIRED
                                  </span>
                                )}
                              </h4>
                              <p className="text-xs text-slate-400 mt-0.5">{item.category}</p>
                              <span className="text-brand-400 text-sm font-bold mt-2 inline-block">${item.price.toFixed(2)}</span>
                            </div>

                            <div className="flex flex-col justify-between items-end">
                              <button
                                onClick={() => handleRemoveFromCart(item._id)}
                                className="text-slate-500 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                              <div className="flex items-center gap-2 bg-white/5 rounded-lg border border-white/10 p-0.5">
                                <button
                                  onClick={() => handleUpdateQuantity(item._id, -1)}
                                  className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-sm font-bold text-white min-w-4 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => handleUpdateQuantity(item._id, 1)}
                                  disabled={expired}
                                  className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded disabled:opacity-30"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  {cart.length > 0 && (
                    <div className="border-t border-white/5 p-6 bg-white/[0.01] space-y-4">
                      <div className="flex justify-between items-center text-base font-bold text-white">
                        <span>Grand Total:</span>
                        <span className="text-brand-400 text-xl">${calculateTotal().toFixed(2)}</span>
                      </div>
                      
                      {cart.some(item => item.expiryStatus === 'EXPIRED') && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>Your cart contains expired items. Checkout will be blocked by system rules.</span>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setCartOpen(false);
                          setCheckoutOpen(true);
                        }}
                        className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <CreditCard className="w-5 h-5" />
                        <span>Proceed to Checkout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkbg-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-white/10 shadow-2xl p-6 relative">
            <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-400" />
                <span>Simulated Billing Portal</span>
              </h3>
              <button
                onClick={() => setCheckoutOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {checkoutError && (
              <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 shrink-0 text-red-400" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold">System Validation Blocked</span>
                  <span className="text-[11px] leading-relaxed">{checkoutError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Shipping Address *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Medical Lane, Cityville"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Contact Phone *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Mock Card Number *
                </label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4111 2222 3333 4444"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Expiry *
                  </label>
                  <input
                    type="text"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    CVV *
                  </label>
                  <input
                    type="password"
                    required
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="•••"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex gap-2 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setCheckoutOpen(false)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingCheckout}
                  className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 text-sm"
                >
                  {isProcessingCheckout ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Confirm Billing checkout'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Checkout Success Modal / Receipt */}
      {checkoutSuccess && lastReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkbg-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl p-6 relative text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-white">Invoice Settled</h3>
            <p className="text-slate-400 text-xs mt-1">Checkout complete. Decremented inventory quantities matching billing items.</p>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-6 text-left my-6 space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-400 border-b border-white/5 pb-3">
                <div>
                  <span className="block font-semibold">Invoice ID</span>
                  <span className="font-mono text-slate-200 mt-0.5 block">{lastReceipt.billNumber}</span>
                </div>
                <div className="text-right">
                  <span className="block font-semibold">Processed Time</span>
                  <span className="text-slate-200 mt-0.5 block">{lastReceipt.date}</span>
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Billing Items</span>
                <div className="max-h-36 overflow-y-auto space-y-2 pr-2">
                  {lastReceipt.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-slate-300 font-medium">{item.name} <span className="text-slate-500 text-xs">x{item.quantity}</span></span>
                      <span className="text-white font-semibold">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/5 pt-4">
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Shipping Terminal Address</span>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">{lastReceipt.shippingAddress}</p>
              </div>

              <div className="flex justify-between items-center border-t border-white/5 pt-4 text-base font-extrabold text-white">
                <span>Grand Total Charged</span>
                <span className="text-brand-400 text-lg">${lastReceipt.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleDownloadPDF(lastReceipt.id, lastReceipt.billNumber)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 transition-all text-sm flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Invoice</span>
              </button>
              <button
                onClick={() => setCheckoutSuccess(false)}
                className="flex-1 py-3 bg-brand-500 hover:bg-brand-400 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-all text-sm font-sans"
              >
                Back to Catalog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
