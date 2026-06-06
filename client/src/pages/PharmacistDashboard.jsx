import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { 
  Pills, Plus, Edit2, Trash2, Search, Filter, 
  AlertTriangle, CheckCircle, HelpCircle, X, Calendar, RefreshCw
} from 'lucide-react';

const PharmacistDashboard = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  
  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // Fetch medicines
  const { data: medicines = [], isLoading, isError, error: fetchError, refetch, isRefetching } = useQuery({
    queryKey: ['medicines'],
    queryFn: async () => {
      const { data } = await api.get('/medicines');
      return data;
    },
  });

  // Create Medicine Mutation
  const createMutation = useMutation({
    mutationFn: async (newMed) => {
      const { data } = await api.post('/medicines', newMed);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['medicines']);
      closeModal();
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to add medicine');
    }
  });

  // Update Medicine Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updatedData }) => {
      const { data } = await api.put(`/medicines/${id}`, updatedData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['medicines']);
      closeModal();
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to update medicine');
    }
  });

  // Delete Medicine Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/medicines/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['medicines']);
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to delete medicine');
    }
  });

  const openAddModal = () => {
    setEditingMedicine(null);
    setName('');
    setCategory('Antibiotic');
    setPrice('');
    setStock('');
    setExpiryDate('');
    setManufacturer('Generic');
    setDescription('');
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (medicine) => {
    setEditingMedicine(medicine);
    setName(medicine.name);
    setCategory(medicine.category);
    setPrice(medicine.price);
    setStock(medicine.stock);
    // Format date to YYYY-MM-DD
    const date = new Date(medicine.expiryDate);
    const formattedDate = date.toISOString().split('T')[0];
    setExpiryDate(formattedDate);
    setManufacturer(medicine.manufacturer || 'Generic');
    setDescription(medicine.description || '');
    setError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingMedicine(null);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name || !category || price === '' || stock === '' || !expiryDate) {
      setError('Please fill in all required fields');
      return;
    }

    const medData = {
      name,
      category,
      price: parseFloat(price),
      stock: parseInt(stock),
      expiryDate,
      manufacturer,
      description
    };

    if (editingMedicine) {
      updateMutation.mutate({ id: editingMedicine._id, updatedData: medData });
    } else {
      createMutation.mutate(medData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this medicine from the inventory database?')) {
      deleteMutation.mutate(id);
    }
  };

  // Stock and Expiring Analytics
  const totalItems = medicines.length;
  const lowStockCount = medicines.filter(m => m.stock > 0 && m.stock <= 10).length;
  const outOfStockCount = medicines.filter(m => m.stock === 0).length;
  
  const isExpired = (dateStr) => {
    return new Date(dateStr) < new Date();
  };
  
  const expiredCount = medicines.filter(m => isExpired(m.expiryDate)).length;

  // Search & Filter Logical Routing
  const filteredMedicines = medicines.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                          (m.manufacturer && m.manufacturer.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = categoryFilter === '' || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(medicines.map(m => m.category))];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Inventory Terminal</h1>
          <p className="text-slate-400 text-sm mt-1 font-sans">
            Manage pharmaceutical stock, track expiry thresholds, and update prices.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="flex items-center justify-center p-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl border border-white/5 transition-all disabled:opacity-50"
            title="Refresh database"
          >
            <RefreshCw className={`w-5 h-5 ${isRefetching ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20"
          >
            <Plus className="w-5 h-5" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-4 right-4 w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-400">
            <Pills className="w-6 h-6" />
          </div>
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Total Catalog</p>
          <p className="text-3xl font-bold text-white mt-2">{isLoading ? '...' : totalItems}</p>
          <div className="mt-4 text-xs text-slate-400">Unique pharmaceutical items</div>
        </div>

        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          {lowStockCount > 0 ? (
            <div className="absolute top-4 right-4 w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
          ) : (
            <div className="absolute top-4 right-4 w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-6 h-6" />
            </div>
          )}
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Low Stock Alerts</p>
          <p className="text-3xl font-bold text-white mt-2">{isLoading ? '...' : lowStockCount}</p>
          <div className="mt-4 text-xs text-slate-400">Quantity equal or below 10 units</div>
        </div>

        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          {outOfStockCount > 0 ? (
            <div className="absolute top-4 right-4 w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400 animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
          ) : (
            <div className="absolute top-4 right-4 w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
              <CheckCircle className="w-6 h-6" />
            </div>
          )}
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Depleted Inventory</p>
          <p className="text-3xl font-bold text-white mt-2">{isLoading ? '...' : outOfStockCount}</p>
          <div className="mt-4 text-xs text-slate-400">Out of stock units</div>
        </div>

        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          {expiredCount > 0 ? (
            <div className="absolute top-4 right-4 w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400 animate-pulse">
              <Calendar className="w-6 h-6" />
            </div>
          ) : (
            <div className="absolute top-4 right-4 w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500">
              <Calendar className="w-6 h-6" />
            </div>
          )}
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Expired Products</p>
          <p className="text-3xl font-bold text-white mt-2">{isLoading ? '...' : expiredCount}</p>
          <div className="mt-4 text-xs text-slate-400">Past legal distribution date</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.02] p-4 rounded-2xl border border-white/5">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search medicine name or manufacturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
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
              {categories.filter(c => !['Antibiotic','Analgesic','Antihistamine','Antiviral','Cardiovascular','Diabetes','Vitamins/Supplements'].includes(c)).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
          </div>
        ) : isError ? (
          <div className="py-20 text-center text-red-400">
            <p>Error checking inventory: {fetchError.message}</p>
          </div>
        ) : filteredMedicines.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <p className="text-base font-medium">No items found matching the filter credentials.</p>
            <button 
              onClick={openAddModal}
              className="mt-4 px-4 py-2 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 rounded-xl border border-brand-500/20 text-sm font-semibold transition-all"
            >
              Add New Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-white/[0.02]">
                  <th className="py-4 px-6">Medicine Detail</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Stock Status</th>
                  <th className="py-4 px-6">Expiry Threshold</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMedicines.map((item) => {
                  const expired = isExpired(item.expiryDate);
                  const lowStock = item.stock <= 10;
                  
                  return (
                    <tr key={item._id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-semibold text-white text-base">{item.name}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{item.manufacturer || 'Generic Manufacturer'}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-white font-semibold">${item.price.toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className={`text-sm font-bold ${
                            item.stock === 0 ? 'text-red-400' : lowStock ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {item.stock} units
                          </span>
                          {item.stock === 0 ? (
                            <span className="text-xs text-red-500 font-medium">Out of stock</span>
                          ) : lowStock ? (
                            <span className="text-xs text-amber-500 font-medium">Restock suggested</span>
                          ) : (
                            <span className="text-xs text-slate-500 font-medium">Healthy</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className={`text-sm ${expired ? 'text-rose-400 font-semibold' : 'text-slate-300'}`}>
                            {new Date(item.expiryDate).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          {expired ? (
                            <span className="text-xs text-rose-500 font-bold">Expired</span>
                          ) : (
                            <span className="text-xs text-slate-500">Valid</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 text-slate-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-lg transition-all border border-transparent hover:border-brand-500/20"
                            title="Edit details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20"
                            title="Delete medicine"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CRUD Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkbg-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl p-6 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Pills className="w-5 h-5 text-brand-400" />
                <span>{editingMedicine ? 'Modify Product Record' : 'Record New Medicine'}</span>
              </h3>
              <button onClick={closeModal} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Medicine Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Paracetamol"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-darkbg-950 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500"
                  >
                    <option value="Antibiotic">Antibiotic</option>
                    <option value="Analgesic">Analgesic</option>
                    <option value="Antihistamine">Antihistamine</option>
                    <option value="Antiviral">Antiviral</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="Diabetes">Diabetes</option>
                    <option value="Vitamins/Supplements">Vitamins/Supplements</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Manufacturer / Vendor
                  </label>
                  <input
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    placeholder="e.g. Pfizer"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="9.99"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="100"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-500 text-sm"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the product indications..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl border border-white/5 text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 text-sm"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : editingMedicine ? (
                    'Update Record'
                  ) : (
                    'Save Record'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacistDashboard;
