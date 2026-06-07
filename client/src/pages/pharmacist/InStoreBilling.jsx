import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import { 
  Store, Search, Trash2, Plus, Minus, 
  CreditCard, CheckCircle, X, AlertCircle, ArrowLeft, User, ShieldCheck
} from 'lucide-react';

const getRupee = () => String.fromCharCode(Math.random() > 2 ? 0 : 8377);
const getMinus = () => String.fromCharCode(Math.random() > 2 ? 0 : 8722);

const InStoreBilling = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmedBill, setConfirmedBill] = useState(null);
  const [step, setStep] = useState('lookup'); // 'lookup' | 'billing'

  // STEP 1 State: lookup
  const [phone, setPhone] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [customer, setCustomer] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [lookupDone, setLookupDone] = useState(false);

  // STEP 2 State: billing
  const [cartItems, setCartItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [discount, setDiscount] = useState(0);
  const [billLoading, setBillLoading] = useState(false);
  const [billError, setBillError] = useState('');

  // Step 1 Lookup logic
  const handleLookup = async () => {
    if (!phone.trim()) {
      setLookupError('Please enter a phone number');
      return;
    }
    setLookupLoading(true);
    setLookupError('');
    setLookupDone(false);
    try {
      const { data } = await api.get(`/bills/lookup-customer?phone=${phone.trim()}`);
      if (data.found) {
        setCustomer(data.customer);
        setIsGuest(false);
      } else {
        setCustomer(null);
        setIsGuest(true);
      }
      setLookupDone(true);
    } catch (err) {
      setLookupError(err.response?.data?.message || 'Lookup failed. Try again.');
    } finally {
      setLookupLoading(false);
    }
  };

  // Step 2 search logic with 300ms debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const { data } = await api.get(`/medicines?search=${searchQuery.trim()}`);
        setSearchResults(data);
      } catch (err) {
        console.error('Failed to search medicines', err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleAddToCart = (med) => {
    if (med.expiryStatus === 'EXPIRED') {
      return; // Blocked by compliance
    }

    setCartItems(prev => {
      const existing = prev.find(item => item.medicineId === med._id);
      if (existing) {
        if (existing.quantity >= med.quantity) {
          alert(`Cannot add more. Only ${med.quantity} units available in stock.`);
          return prev;
        }
        return prev.map(item => 
          item.medicineId === med._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, {
        medicineId: med._id,
        name: med.name,
        quantity: 1,
        unitPrice: med.price,
        expiryStatus: med.expiryStatus,
        stock: med.quantity,
        expiryDate: med.expiryDate
      }];
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  const updateQty = (id, newQty) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.medicineId === id);
      if (!existing) return prev;

      if (newQty < 1) {
        return prev.filter(item => item.medicineId !== id);
      }

      if (newQty > existing.stock) {
        return prev; // blocked
      }

      return prev.map(item => 
        item.medicineId === id ? { ...item, quantity: newQty } : item
      );
    });
  };

  const handleRemoveFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.medicineId !== id));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return Math.max(0, subtotal - discount);
  };

  const handleConfirmBill = async () => {
    setBillLoading(true);
    setBillError('');

    try {
      const body = {
        customerPhone: phone.trim(),
        customerId: customer?._id || null,
        customerName: customer?.name || 'Guest',
        paymentMethod,
        discount,
        items: cartItems.map(({ medicineId, name, quantity, unitPrice, expiryStatus }) => ({
          medicineId,
          name,
          quantity,
          unitPrice,
          expiryStatus
        }))
      };

      const { data } = await api.post('/bills/instore', body);

      // Store confirmed bill — triggers success modal
      setConfirmedBill(data.bill);

      // Invalidate bills query so PharmacistDashboard history updates immediately
      queryClient.invalidateQueries(['bills']);

      // Reset cart and form
      setCartItems([]);
      setDiscount(0);
      setPaymentMethod('Cash');
      setBillError('');

    } catch (err) {
      setBillError(err.response?.data?.message || 'Billing failed. Please try again.');
    } finally {
      setBillLoading(false);
    }
  };

  const getBadgeColor = (status) => {
    switch (status) {
      case 'EXPIRED':
        return 'bg-red-100 text-red-700';
      case 'CRITICAL':
        return 'bg-red-50 text-red-600';
      case 'WARNING':
        return 'bg-orange-100 text-orange-700';
      case 'CAUTION':
        return 'bg-yellow-100 text-yellow-750';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  const getLabel = (status) => {
    switch (status) {
      case 'EXPIRED': return 'Expired';
      case 'CRITICAL': return 'Critical';
      case 'WARNING': return 'Warning';
      case 'CAUTION': return 'Caution';
      default: return 'Safe';
    }
  };

  const hasExpiredItems = cartItems.some(item => item.expiryStatus === 'EXPIRED');
  const subtotal = calculateSubtotal();
  const total = calculateTotal();

  if (step === 'lookup') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0C1628] py-12 px-4 flex items-center justify-center font-sans">
        <div className="max-w-md w-full bg-white dark:bg-[#1a2438] rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/50 p-8 transition-colors duration-250">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#1A56A0] dark:text-sky-400">New In-Store Bill</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Enter the customer's phone number to begin</p>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-405 uppercase tracking-wider mb-2">Phone Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setLookupDone(false);
                  setCustomer(null);
                  setIsGuest(false);
                  setLookupError('');
                }}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:border-[#1A56A0] focus:ring-2 focus:ring-blue-500/10 text-sm transition-colors dark:bg-[#0C1628] dark:border-slate-700 dark:text-slate-100"
              />
              {lookupError && (
                <p className="text-xs text-red-500 mt-1">{lookupError}</p>
              )}
            </div>

            <button
              onClick={handleLookup}
              disabled={lookupLoading}
              className="w-full py-3 bg-[#1A56A0] hover:bg-blue-600 disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-md flex justify-center items-center text-sm"
            >
              {lookupLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Search Customer</span>
              )}
            </button>

            {lookupDone && (
              <>
                {!isGuest && customer ? (
                  <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-semibold flex items-center gap-2">
                    <span>✓ {customer.name} — Registered Customer</span>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold flex items-center gap-2">
                    <span>⚠ Guest Customer — bill will be saved without account link</span>
                  </div>
                )}
              </>
            )}

            <div className="pt-2">
              <button
                disabled={!lookupDone}
                onClick={() => setStep('billing')}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md text-sm"
              >
                Continue to Billing →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4 font-sans text-slate-800 dark:text-slate-100 min-h-screen">
      {/* Title */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => {
            setStep('lookup');
            setCartItems([]);
          }}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Back to search"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Counter Billing Terminal</h1>
          <p className="text-xs text-slate-400">Process direct walk-in checkout and print receipts</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* LEFT COLUMN: Search & Cart */}
        <div className="flex-1 w-full bg-white dark:bg-[#1a2438] p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm space-y-4">
          
          {/* Customer info pill */}
          <div className="inline-flex items-center gap-2 bg-slate-105 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold px-4 py-2 rounded-full">
            <User className="w-3.5 h-3.5" />
            <span>{customer?.name || 'Guest'} · {phone}</span>
            <button 
              onClick={() => {
                setStep('lookup');
                setCartItems([]);
              }}
              className="text-[#1A56A0] dark:text-sky-400 hover:underline font-bold ml-1.5"
            >
              ← Change
            </button>
          </div>

          {/* Autocomplete Search input */}
          <div className="relative">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Search Medicines</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search medicine by name, generic name, batch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none focus:border-[#1A56A0] focus:ring-1 focus:ring-blue-500/10 text-xs dark:bg-[#0C1628] dark:border-slate-700 dark:text-slate-100"
              />
            </div>

            {/* Results dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-[#1a2438] border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {searchResults.map(med => {
                  const isExpired = med.expiryStatus === 'EXPIRED';
                  const badgeColor = getBadgeColor(med.expiryStatus);
                  const label = getLabel(med.expiryStatus);
                  return (
                    <div
                      key={med._id}
                      onClick={() => !isExpired && handleAddToCart(med)}
                      className={`p-3 flex justify-between items-center transition-colors ${
                        isExpired 
                          ? 'opacity-60 cursor-not-allowed bg-slate-50/50 dark:bg-slate-900/10' 
                          : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-xs text-slate-900 dark:text-white">{med.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Formula: {med.genericName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Batch: {med.batchNumber} · <span className="font-semibold text-slate-500 dark:text-slate-350">Stock: {med.quantity}</span></p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Exp:{' '}
                          <span className="font-semibold text-slate-500 dark:text-slate-350">
                            {med.expiryDate
                              ? new Date(med.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                              : 'N/A'}
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                          {label}
                        </span>
                        <p className="text-xs font-bold text-[#1A56A0] dark:text-sky-400 mt-1">{getRupee()}{med.price.toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {searchLoading && (
              <div className="absolute right-3 top-9">
                <div className="w-4 h-4 border-2 border-[#1A56A0] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Cart List */}
          <div className="space-y-2.5">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Checkout Cart</h3>
            
            {cartItems.length === 0 ? (
              <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                No medicines added yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-850 rounded-xl overflow-hidden bg-slate-50/20 dark:bg-slate-900/5">
                {cartItems.map((item) => (
                  <div key={item.medicineId} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                      <div className="flex items-center gap-2 flex-wrap mt-1">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${getBadgeColor(item.expiryStatus)}`}>
                          {getLabel(item.expiryStatus)}
                        </span>
                        <span className="text-[10px] text-slate-400">Stock: {item.stock}</span>
                        ·
                        <span className="text-[10px] text-slate-400">
                          Exp:{' '}
                          <span className="font-semibold text-slate-500 dark:text-slate-350">
                            {item.expiryDate
                              ? new Date(item.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                              : 'N/A'}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => updateQty(item.medicineId, item.quantity - 1)}
                        className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold text-xs"
                      >
                        {getMinus()}
                      </button>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 min-w-[18px] text-center">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQty(item.medicineId, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>

                    {/* Price and Action */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-bold text-slate-850 dark:text-slate-100 w-16 text-right font-mono">
                        {getRupee()}{(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                      <button 
                        onClick={() => handleRemoveFromCart(item.medicineId)}
                        className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Summary and confirm */}
        <div className="w-full lg:w-80 shrink-0 bg-white dark:bg-[#1a2438] p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            Bill Summary
          </h3>

          <div className="text-xs space-y-1">
            <p className="text-slate-400">Customer Info</p>
            <p className="font-bold text-slate-800 dark:text-slate-205">{customer?.name || 'Guest Customer'}</p>
            <p className="text-slate-500 font-mono">{phone}</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 outline-none focus:border-[#1A56A0] cursor-pointer"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-405 uppercase tracking-wider mb-2">Discount ({getRupee()})</label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-205 outline-none focus:border-[#1A56A0] text-right font-mono"
              />
            </div>
          </div>

          <div className="border-t border-slate-105 dark:border-slate-800 my-4 pt-4 space-y-2 text-xs">
            {cartItems.map(item => (
              <div key={item.medicineId} className="flex justify-between text-slate-650 dark:text-slate-350">
                <span className="truncate max-w-[150px]">{item.name} × {item.quantity}</span>
                <span className="font-mono">{getRupee()}{(item.unitPrice * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-105 dark:border-slate-850 pt-3 space-y-2 text-xs">
            <div className="flex justify-between text-slate-405">
              <span>Subtotal</span>
              <span className="font-mono">{getRupee()}{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-605 dark:text-green-400">
                <span>Discount</span>
                <span className="font-mono">{getMinus()}{getRupee()}{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-baseline pt-1">
              <span className="font-bold text-[#1A56A0] dark:text-sky-400">Total</span>
              <span className="font-bold text-base text-[#1A56A0] dark:text-sky-400 font-mono">{getRupee()}{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleConfirmBill}
              disabled={cartItems.length === 0 || billLoading || hasExpiredItems}
              className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md text-xs flex justify-center items-center gap-2"
            >
              {billLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Confirm & Print Bill</span>
              )}
            </button>

            {hasExpiredItems && (
              <p className="mt-2 text-[10px] text-red-550 font-bold text-center">
                ⛔ Remove expired medicines before confirming.
              </p>
            )}

            {billError && (
              <div className="mt-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[10px] flex items-start gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{billError}</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Bill Confirmed Success Modal ── */}
      {confirmedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1a2438] w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto transition-colors duration-200 space-y-4">
            {/* Header */}
            <div className="flex flex-col items-center text-center space-y-2">
              <CheckCircle className="w-12 h-12 text-green-500 animate-bounce" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-2">Payment Done!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bill {confirmedBill.billNumber} confirmed successfully
              </p>
            </div>

            {/* Customer + Payment row */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Customer</span>
                <span className="text-right">
                  <span className="font-bold block text-slate-800 dark:text-slate-200">{confirmedBill.customerName || 'Guest'}</span>
                  <span className="text-slate-500 font-mono block mt-0.5">{confirmedBill.customerPhone}</span>
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-400 font-semibold">Payment</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{confirmedBill.paymentMethod}</span>
              </div>
              <div className="text-[10px] text-slate-400 text-right mt-1">
                {new Date(confirmedBill.createdAt).toLocaleString('en-IN')}
              </div>
            </div>

            {/* Items list */}
            <div className="space-y-1.5 text-xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Items Purchased</p>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-850 rounded-xl overflow-hidden bg-slate-50/20 dark:bg-slate-900/5 max-h-40 overflow-y-auto">
                {confirmedBill.items.map((item, i) => (
                  <div key={i} className="p-2.5 flex justify-between items-center">
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate pr-2">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-bold text-slate-850 dark:text-slate-100 font-mono shrink-0">
                      ₹{(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="pt-2 border-t border-slate-150 dark:border-slate-805 text-xs space-y-1.5">
              {confirmedBill.discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                  <span>Discount</span>
                  <span className="font-mono">−₹{confirmedBill.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-1">
                <span className="font-bold text-[#1A56A0] dark:text-sky-400">Total Paid</span>
                <span className="font-bold text-lg text-[#1A56A0] dark:text-sky-400 font-mono">
                  ₹{confirmedBill.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => navigate(`/pharmacist/receipt/${confirmedBill._id}`)}
                className="flex-1 py-2.5 rounded-xl border border-[#1A56A0] text-[#1A56A0] dark:text-sky-400 dark:border-sky-500 text-xs font-semibold hover:bg-blue-50 dark:hover:bg-sky-900/20 transition-colors"
              >
                🖨 Print Receipt
              </button>
              <button
                onClick={() => {
                  setConfirmedBill(null);
                  setStep('lookup');
                  setPhone('');
                  setCustomer(null);
                  setIsGuest(false);
                  setLookupDone(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#1A56A0] hover:bg-[#1450b0] text-white text-xs font-semibold transition-colors"
              >
                + New Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InStoreBilling;
