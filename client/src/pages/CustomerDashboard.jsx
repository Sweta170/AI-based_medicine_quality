import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { 
  Pills, Search, Filter, ShoppingCart, Trash2, Plus, Minus, 
  CreditCard, CheckCircle, X, ShieldCheck, ShoppingBag
} from 'lucide-react';

const CustomerDashboard = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
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
    queryKey: ['medicines'],
    queryFn: async () => {
      const { data } = await api.get('/medicines');
      return data;
    },
  });

  const handleAddToCart = (medicine) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === medicine._id);
      if (existingItem) {
        if (existingItem.quantity >= medicine.stock) {
          alert(`Cannot add more. Only ${medicine.stock} units available in stock.`);
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
            // Check stock limit on increase
            if (delta > 0 && newQty > item.stock) {
              alert(`Only ${item.stock} units available in stock.`);
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

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    setCheckoutError('');

    if (!address || !phone || !cardNumber || !expiry || !cvv) {
      setCheckoutError('Please enter all billing and shipping information');
      return;
    }

    setIsProcessingCheckout(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessingCheckout(false);
      setLastReceipt({
        id: 'AEGIS-' + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleString(),
        items: [...cart],
        total: calculateTotal(),
        shippingAddress: address,
      });
      setCart([]);
      setCheckoutOpen(false);
      setCheckoutSuccess(true);
    }, 2000);
  };

  const isExpired = (dateStr) => {
    return new Date(dateStr) < new Date();
  };

  // Filter Catalog
  const filteredMedicines = medicines.filter((m) => {
    // Only display medicines that are NOT expired and have stock > 0 (or optionally show out of stock)
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.manufacturer && m.manufacturer.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === '' || m.category === categoryFilter;
    const notExpired = !isExpired(m.expiryDate);
    return matchesSearch && matchesCategory && notExpired;
  });

  const categories = [...new Set(medicines.map((m) => m.category))];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto relative">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Medicine Catalog</h1>
          <p className="text-slate-400 text-sm mt-1">
            Browse verified pharmaceutical inventory, purchase medicines, and get door delivery.
          </p>
        </div>
        <button
          onClick={() => setCartOpen(true)}
          className="relative flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Shopping Cart</span>
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-darkbg-950 animate-bounce">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.02] p-4 rounded-2xl border border-white/5">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search catalog by product name..."
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
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
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
      ) : filteredMedicines.length === 0 ? (
        <div className="py-20 text-center text-slate-400">
          <p className="text-base font-medium">No medicines matching the specifications currently available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredMedicines.map((item) => (
            <div key={item._id} className="glass-card rounded-2xl p-6 flex flex-col justify-between h-64 border border-white/5 hover:border-brand-500/20">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-brand-500/10 text-brand-400 border border-brand-500/20">
                    {item.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {item.manufacturer}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mt-3 leading-tight">{item.name}</h3>
                <p className="text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">
                  {item.description || 'Verified pharmaceutical medicine for general healthcare usage.'}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-4">
                <div>
                  <span className="text-xs text-slate-400 block">Pricing</span>
                  <span className="text-2xl font-bold text-white">${item.price.toFixed(2)}</span>
                </div>

                {item.stock === 0 ? (
                  <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-xl font-bold">
                    Sold Out
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
          ))}
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
                        <p className="text-xs text-slate-500 mt-1">Browse the catalog to add medicines.</p>
                      </div>
                    ) : (
                      cart.map((item) => (
                        <div key={item._id} className="flex gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white text-sm">{item.name}</h4>
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
                                className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {cart.length > 0 && (
                    <div className="border-t border-white/5 p-6 bg-white/[0.01] space-y-4">
                      <div className="flex justify-between items-center text-base font-bold text-white">
                        <span>Grand Total:</span>
                        <span className="text-brand-400 text-xl">${calculateTotal().toFixed(2)}</span>
                      </div>
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
            <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-400" />
                <span>Simulated Checkout Secure Terminal</span>
              </h3>
              <button
                onClick={() => setCheckoutOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {checkoutError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {checkoutError}
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
                    'Confirm Simulation Order'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Checkout Success Modal / Receipt */}
      {checkoutSuccess && lastReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkbg-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl p-6 relative text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4 animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-white">Order Finalized</h3>
            <p className="text-slate-400 text-xs mt-1">Thank you for your order. Here is your transaction receipt.</p>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-6 text-left my-6 space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-400 border-b border-white/5 pb-3">
                <div>
                  <span className="block font-semibold">Transaction ID</span>
                  <span className="font-mono text-slate-200 mt-0.5 block">{lastReceipt.id}</span>
                </div>
                <div className="text-right">
                  <span className="block font-semibold">Timestamp</span>
                  <span className="text-slate-200 mt-0.5 block">{lastReceipt.date}</span>
                </div>
              </div>

              <div>
                <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Purchased Products</span>
                <div className="max-h-36 overflow-y-auto space-y-2 pr-2">
                  {lastReceipt.items.map((item) => (
                    <div key={item._id} className="flex justify-between items-center text-sm">
                      <span className="text-slate-300 font-medium">{item.name} <span className="text-slate-500 text-xs">x{item.quantity}</span></span>
                      <span className="text-white font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
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

            <button
              onClick={() => setCheckoutSuccess(false)}
              className="px-6 py-3 bg-brand-500 hover:bg-brand-400 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-all text-sm w-full"
            >
              Back to Catalog
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
