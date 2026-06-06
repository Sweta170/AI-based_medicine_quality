import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  Pill, Search, Filter, ShoppingCart, Trash2, Plus, Minus, 
  CreditCard, CheckCircle, X, ShieldAlert, ShoppingBag, AlertCircle, Download
} from 'lucide-react';

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

  const categories = [...new Set(medicines.map((m) => m.category))];

  return (
    <div className="space-y-4 p-4 max-w-7xl mx-auto relative transition-colors duration-200">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Medicine Marketplace</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            Browse verified pharmaceuticals, examine expiry levels, and buy medicines.
          </p>
        </div>
        <button
          onClick={() => setCartOpen(true)}
          className="relative flex items-center gap-1.5 px-3 py-1.5 bg-[#1A56A0] hover:bg-[#1A56A0]/95 text-white font-semibold rounded-lg shadow-sm transition-all text-xs"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>My Cart</span>
          {cart.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full border-2 border-white dark:border-[#0C1628]">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-[#1a2438] p-3 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm transition-colors duration-200">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            placeholder="Search catalog by name, generic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0C1628] border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#1A56A0] dark:focus:border-sky-400 text-xs transition-colors duration-200"
          />
        </div>

        <div className="relative w-full sm:w-44">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0C1628] border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#1A56A0] dark:focus:border-sky-400 appearance-none transition-colors duration-200"
          >
            <option value="" className="bg-white dark:bg-[#1a2438]">All Categories</option>
            <option value="Antibiotic" className="bg-white dark:bg-[#1a2438]">Antibiotic</option>
            <option value="Analgesic" className="bg-white dark:bg-[#1a2438]">Analgesic</option>
            <option value="Antihistamine" className="bg-white dark:bg-[#1a2438]">Antihistamine</option>
            <option value="Antiviral" className="bg-white dark:bg-[#1a2438]">Antiviral</option>
            <option value="Cardiovascular" className="bg-white dark:bg-[#1a2438]">Cardiovascular</option>
            <option value="Diabetes" className="bg-white dark:bg-[#1a2438]">Diabetes</option>
            <option value="Vitamins/Supplements" className="bg-white dark:bg-[#1a2438]">Vitamins/Supplements</option>
            <option value="Other" className="bg-white dark:bg-[#1a2438]">Other</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 dark:text-slate-500">
            <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <div className="w-6 h-6 border-2 border-slate-200 dark:border-slate-700 border-t-[#1A56A0] rounded-full animate-spin"></div>
        </div>
      ) : isError ? (
        <div className="py-20 text-center text-red-500 dark:text-red-400 text-xs">
          <p>Failed loading catalog: {error.message}</p>
        </div>
      ) : medicines.length === 0 ? (
        <div className="py-20 text-center text-slate-550 dark:text-slate-500">
          <p className="text-xs font-semibold">No medicines matching specifications currently available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {medicines.map((item) => {
            const expired = item.expiryStatus === 'EXPIRED';
            const critical = item.expiryStatus === 'CRITICAL';
            
            return (
              <div key={item._id} className={`bg-white dark:bg-[#1a2438] rounded-xl p-4 flex flex-col justify-between h-64 border transition-all duration-200 shadow-sm hover:shadow-md ${
                expired ? 'bg-rose-50/20 dark:bg-rose-900/10 border-rose-200 dark:border-rose-900/30' : 'border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600'
              }`}>
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-[#1A56A0]/10 text-[#1A56A0] dark:bg-sky-500/10 dark:text-sky-400 border border-[#1A56A0]/20 dark:border-sky-500/20">
                      {item.category}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      expired ? 'bg-red-550/10 text-red-650 dark:text-red-400 border border-red-500/20' :
                      critical ? 'bg-rose-550/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50'
                    }`}>
                      {item.expiryStatus}
                    </span>
                  </div>
                  
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-tight flex flex-col">
                    <span>{item.name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium italic mt-0.5 font-sans">Formula: {item.genericName}</span>
                  </h3>
                  
                  <p className="text-slate-500 dark:text-slate-500 text-[10px] mt-1 font-medium">
                    Brand: {item.manufacturer} | Batch: {item.batchNumber}
                  </p>
                  
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                    {item.description || 'Verified pharmaceutical medicine for general healthcare usage.'}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-3 border-t border-slate-150 dark:border-slate-700/50 pt-3">
                  <div>
                    <span className="text-[10px] text-slate-405 dark:text-slate-500 block">Unit Price</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">${item.price.toFixed(2)}</span>
                  </div>

                  {item.quantity === 0 ? (
                    <span className="text-[10px] bg-red-505/10 text-red-650 dark:text-red-400 border border-red-500/20 px-2 py-1 rounded font-bold">
                      Out of Stock
                    </span>
                  ) : expired ? (
                    <span className="text-[9px] bg-red-500/10 text-red-655 dark:text-red-400 border border-red-550/20 px-2 py-1 rounded font-extrabold" title="Expired items cannot be added to bills">
                      EXPIRED - BLOCKED
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="px-3 py-1.5 bg-[#1A56A0] hover:bg-[#1A56A0]/95 text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1"
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

      {/* Shopping Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 dark:bg-black/60 backdrop-blur-xs">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md">
                <div className="flex h-full flex-col bg-white dark:bg-[#131b2e] border-l border-slate-205 dark:border-slate-800 shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <ShoppingCart className="w-4.5 h-4.5 text-[#1A56A0] dark:text-sky-400" />
                      <span>Shopping Cart</span>
                    </h2>
                    <button
                      onClick={() => setCartOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                    >
                      <X className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                      <div className="h-full flex flex-col justify-center items-center text-center text-slate-400">
                        <ShoppingBag className="w-10 h-10 text-slate-400 dark:text-slate-600 mb-3 animate-bounce" />
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">Your cart is empty</p>
                        <p className="text-xs text-slate-500 mt-0.5">Browse catalog to select items.</p>
                      </div>
                    ) : (
                      cart.map((item) => {
                        const expired = item.expiryStatus === 'EXPIRED';
                        return (
                          <div key={item._id} className={`flex gap-3 p-3 bg-slate-50 dark:bg-[#1a2438] border rounded-xl transition-colors ${
                            expired ? 'border-red-200 bg-red-500/5 dark:border-red-905/20' : 'border-slate-200 dark:border-slate-700/50'
                          }`}>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                                <span>{item.name}</span>
                                {expired && (
                                  <span className="text-[9px] bg-red-500/20 text-red-655 border border-red-500/30 px-1.5 rounded font-extrabold animate-pulse">
                                    EXPIRED
                                  </span>
                                )}
                              </h4>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{item.category}</p>
                              <span className="text-[#1A56A0] dark:text-sky-400 text-xs font-bold mt-1.5 inline-block">${item.price.toFixed(2)}</span>
                            </div>

                            <div className="flex flex-col justify-between items-end">
                              <button
                                onClick={() => handleRemoveFromCart(item._id)}
                                className="text-slate-400 hover:text-red-550 dark:hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-0.5">
                                <button
                                  onClick={() => handleUpdateQuantity(item._id, -1)}
                                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-bold text-slate-900 dark:text-white min-w-4 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => handleUpdateQuantity(item._id, 1)}
                                  disabled={expired}
                                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-202 dark:hover:bg-slate-700 rounded disabled:opacity-30"
                                >
                                  <Plus className="w-3 h-3" />
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
                    <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-[#1a2438]/30 space-y-3">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-900 dark:text-white">
                        <span>Grand Total:</span>
                        <span className="text-[#1A56A0] dark:text-sky-400 text-base">${calculateTotal().toFixed(2)}</span>
                      </div>
                      
                      {cart.some(item => item.expiryStatus === 'EXPIRED') && (
                        <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 text-[10px] rounded-lg flex items-start gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>Your cart contains expired items. Checkout will be blocked by system rules.</span>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setCartOpen(false);
                          setCheckoutOpen(true);
                        }}
                        className="w-full py-2 bg-[#1A56A0] hover:bg-[#1A56A0]/95 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 text-xs"
                      >
                        <CreditCard className="w-4 h-4" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1a2438] w-full max-w-sm rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-xl p-4 relative transition-colors duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-150 dark:border-slate-700/50 mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CreditCard className="w-4.5 h-4.5 text-[#1A56A0] dark:text-sky-400" />
                <span>Simulated Billing Portal</span>
              </h3>
              <button
                onClick={() => setCheckoutOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {checkoutError && (
              <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 text-[11px] flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold">System Validation Blocked</span>
                  <span className="text-[10px] leading-relaxed">{checkoutError}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleCheckoutSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                  Shipping Address *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Medical Lane, Cityville"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0C1628] border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#1A56A0] dark:focus:border-sky-400 text-xs transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                  Contact Phone *
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0C1628] border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#1A56A0] dark:focus:border-sky-400 text-xs transition-colors duration-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                  Mock Card Number *
                </label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4111 2222 3333 4444"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0C1628] border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#1A56A0] dark:focus:border-sky-400 text-xs transition-colors duration-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                    Expiry *
                  </label>
                  <input
                    type="text"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0C1628] border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#1A56A0] dark:focus:border-sky-400 text-xs transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                    CVV *
                  </label>
                  <input
                    type="password"
                    required
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="•••"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0C1628] border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#1A56A0] dark:focus:border-sky-400 text-xs transition-colors duration-200"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-150 dark:border-slate-700/50 flex gap-2 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setCheckoutOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingCheckout}
                  className="px-4 py-1.5 bg-[#1A56A0] hover:bg-[#1A56A0]/95 text-white font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 text-xs flex items-center justify-center min-w-28"
                >
                  {isProcessingCheckout ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Confirm Checkout'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Checkout Success Modal / Receipt */}
      {checkoutSuccess && lastReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1a2438] w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-xl p-5 relative text-center transition-colors duration-200">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 mb-3">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Invoice Settled</h3>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Checkout complete. Decremented inventory quantities matching billing items.</p>

            <div className="bg-slate-50 dark:bg-[#0C1628] border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 text-left my-4 space-y-3">
              <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 border-b border-slate-150 dark:border-slate-705/40 pb-2">
                <div>
                  <span className="block font-semibold">Invoice ID</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 mt-0.5 block">{lastReceipt.billNumber}</span>
                </div>
                <div className="text-right">
                  <span className="block font-semibold">Processed Time</span>
                  <span className="text-slate-800 dark:text-slate-200 mt-0.5 block">{lastReceipt.date}</span>
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Billing Items</span>
                <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
                  {lastReceipt.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-xs text-slate-700 dark:text-slate-300">
                      <span className="font-medium">{item.name} <span className="text-slate-400 text-[10px]">x{item.quantity}</span></span>
                      <span className="font-semibold text-slate-900 dark:text-white font-mono">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-150 dark:border-slate-700/50 pt-2.5">
                <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Shipping Terminal Address</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{lastReceipt.shippingAddress}</p>
              </div>

              <div className="flex justify-between items-center border-t border-slate-150 dark:border-slate-700/50 pt-2.5 text-xs font-bold text-slate-900 dark:text-white">
                <span>Grand Total Charged</span>
                <span className="text-[#1A56A0] dark:text-sky-400 text-sm font-mono">${lastReceipt.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleDownloadPDF(lastReceipt.id, lastReceipt.billNumber)}
                className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-250 dark:border-slate-700 text-slate-800 dark:text-white font-semibold rounded-lg transition-all text-xs flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={() => setCheckoutSuccess(false)}
                className="flex-1 py-1.5 bg-[#1A56A0] hover:bg-[#1A56A0]/95 text-white font-semibold rounded-lg shadow-sm transition-all text-xs font-sans"
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

export default CustomerShop;
