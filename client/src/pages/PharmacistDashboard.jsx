import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { 
  Pills, Plus, Edit2, Trash2, Search, Filter, 
  AlertTriangle, CheckCircle, X, Calendar, RefreshCw, Barcode, Database, Upload, Eye, Bell
} from 'lucide-react';

const PharmacistDashboard = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [expiryStatusFilter, setExpiryStatusFilter] = useState('');
  const [reorderFilter, setReorderFilter] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  
  // Single Form States
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [manufactureDate, setManufactureDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reorderLevel, setReorderLevel] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [barcode, setBarcode] = useState('');
  const [labelImageUrl, setLabelImageUrl] = useState('');
  const [error, setError] = useState('');

  // Bulk Import Form States
  const [bulkJson, setBulkJson] = useState('');
  const [bulkError, setBulkError] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState('');

  // Fetch medicines with filter query parameters
  const { data: medicines = [], isLoading, isError, error: fetchError, refetch, isRefetching } = useQuery({
    queryKey: ['medicines', search, categoryFilter, expiryStatusFilter, reorderFilter],
    queryFn: async () => {
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (expiryStatusFilter) params.status = expiryStatusFilter;
      if (reorderFilter) params.reorder = 'true';

      const { data } = await api.get('/medicines', { params });
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

  // Bulk Import Mutation
  const bulkImportMutation = useMutation({
    mutationFn: async (jsonArray) => {
      const { data } = await api.post('/medicines/bulk', jsonArray);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['medicines']);
      setBulkSuccess(`Successfully imported ${data.insertedCount} items! Skipped ${data.skippedCount} items.`);
      setBulkJson('');
      setTimeout(() => {
        closeBulkModal();
      }, 3000);
    },
    onError: (err) => {
      setBulkError(err.response?.data?.message || 'Failed to import JSON data');
    }
  });

  const openAddModal = () => {
    setEditingMedicine(null);
    setName('');
    setGenericName('');
    setManufacturer('');
    setBatchNumber('');
    setExpiryDate('');
    setManufactureDate('');
    setQuantity('');
    setReorderLevel('10');
    setPrice('');
    setCategory('Antibiotic');
    setBarcode('');
    setLabelImageUrl('');
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (medicine) => {
    setEditingMedicine(medicine);
    setName(medicine.name);
    setGenericName(medicine.genericName);
    setManufacturer(medicine.manufacturer);
    setBatchNumber(medicine.batchNumber);
    setExpiryDate(new Date(medicine.expiryDate).toISOString().split('T')[0]);
    setManufactureDate(new Date(medicine.manufactureDate).toISOString().split('T')[0]);
    setQuantity(medicine.quantity);
    setReorderLevel(medicine.reorderLevel);
    setPrice(medicine.price);
    setCategory(medicine.category);
    setBarcode(medicine.barcode || '');
    setLabelImageUrl(medicine.labelImageUrl || '');
    setError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingMedicine(null);
    setError('');
  };

  const handleOcrFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('labelImage', file);

    setOcrLoading(true);
    setError('');

    try {
      const { data } = await api.post('/medicines/scan-label', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data.medicineName) setName(data.medicineName);
      if (data.batchNumber) setBatchNumber(data.batchNumber);
      if (data.expiryDate) setExpiryDate(data.expiryDate);
      if (data.labelImageUrl) setLabelImageUrl(data.labelImageUrl);

      alert(`OCR Scan Complete!\nConfidence: ${data.confidence.toUpperCase()}\nExtracted Name: ${data.medicineName || 'None'}\nBatch: ${data.batchNumber || 'None'}\nExpiry: ${data.expiryDate || 'None'}`);
    } catch (err) {
      console.error('OCR scan failed:', err);
      setError(err.response?.data?.message || 'OCR image scanning failed. Please try again.');
    } finally {
      setOcrLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const [triggerLoading, setTriggerLoading] = useState(null);

  const handleTriggerCron = async (cronNumber) => {
    setTriggerLoading(cronNumber);
    try {
      const { data } = await api.post(`/notifications/trigger/${cronNumber}`);
      alert(`Cron triggered successfully!\nMessage: ${data.message}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to trigger cron job');
    } finally {
      setTriggerLoading(null);
    }
  };

  const openBulkModal = () => {
    setBulkJson('');
    setBulkError('');
    setBulkSuccess('');
    setBulkModalOpen(true);
  };

  const closeBulkModal = () => {
    setBulkModalOpen(false);
    setBulkError('');
    setBulkSuccess('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name || !genericName || !manufacturer || !batchNumber || !expiryDate || !manufactureDate || price === '' || quantity === '' || reorderLevel === '') {
      setError('Please fill in all required fields');
      return;
    }

    const medData = {
      name,
      genericName,
      manufacturer,
      batchNumber,
      expiryDate,
      manufactureDate,
      quantity: parseInt(quantity),
      reorderLevel: parseInt(reorderLevel),
      price: parseFloat(price),
      category,
      barcode,
      labelImageUrl
    };

    if (editingMedicine) {
      updateMutation.mutate({ id: editingMedicine._id, updatedData: medData });
    } else {
      createMutation.mutate(medData);
    }
  };

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    setBulkError('');
    setBulkSuccess('');

    try {
      const parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) {
        setBulkError('Data must be a JSON array: [ {...}, {...} ]');
        return;
      }
      bulkImportMutation.mutate(parsed);
    } catch (err) {
      setBulkError('Invalid JSON format. Please verify braces and quotes.');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this medicine from the inventory database?')) {
      deleteMutation.mutate(id);
    }
  };

  // Status Badge Helper
  const getExpiryBadgeStyle = (status) => {
    switch (status) {
      case 'EXPIRED':
        return 'bg-red-500/20 text-red-400 border border-red-500/30 font-extrabold animate-pulse';
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold';
      case 'WARNING':
        return 'bg-orange-500/20 text-orange-400 border border-orange-500/20 font-semibold';
      case 'CAUTION':
        return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
      case 'SAFE':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/25';
      default:
        return 'bg-slate-800 text-slate-400';
    }
  };

  // Load standard categories list
  const standardCategories = [
    'Antibiotic', 'Analgesic', 'Antihistamine', 'Antiviral', 
    'Cardiovascular', 'Diabetes', 'Vitamins/Supplements', 'Other'
  ];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Medicine Catalog Management</h1>
          <p className="text-slate-400 text-sm mt-1 font-sans">
            Oversee pharmaceutical batches, record status parameters, and perform bulk JSON imports.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="flex items-center justify-center p-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl border border-white/5 transition-all"
            title="Refresh database"
          >
            <RefreshCw className={`w-5 h-5 ${isRefetching ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openBulkModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl border border-white/10 transition-all font-semibold"
          >
            <Upload className="w-5 h-5" />
            <span>Bulk Import</span>
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

      {/* Scheduled Notifications Cron Trigger Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-400" />
            <span>Automated Tasks & Scheduled Crons</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Force-trigger daily automation routines immediately for verification (SMTP & Twilio integrations).
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleTriggerCron('1')}
            disabled={triggerLoading === '1'}
            className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/5 text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            <div className="text-left font-sans">
              <span className="block text-slate-300">Cron 1: Expiry Alerts</span>
              <span className="text-[10px] text-slate-500 font-medium font-sans">Daily 8:00 AM email report</span>
            </div>
            {triggerLoading === '1' ? (
              <span className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <RefreshCw className="w-4 h-4 text-brand-400" />
            )}
          </button>
          
          <button
            onClick={() => handleTriggerCron('2')}
            disabled={triggerLoading === '2'}
            className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/5 text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            <div className="text-left font-sans">
              <span className="block text-slate-300">Cron 2: Low Stock Warning</span>
              <span className="text-[10px] text-slate-500 font-medium font-sans">Daily 9:00 AM stock alerts</span>
            </div>
            {triggerLoading === '2' ? (
              <span className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <RefreshCw className="w-4 h-4 text-brand-400" />
            )}
          </button>

          <button
            onClick={() => handleTriggerCron('3')}
            disabled={triggerLoading === '3'}
            className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/5 text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            <div className="text-left font-sans">
              <span className="block text-slate-300">Cron 3: SMS Medication Alarms</span>
              <span className="text-[10px] text-slate-500 font-medium font-sans">Daily 10:00 AM customer SMS alerts</span>
            </div>
            {triggerLoading === '3' ? (
              <span className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <RefreshCw className="w-4 h-4 text-brand-400" />
            )}
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/[0.02] p-4 rounded-2xl border border-white/5">
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search name, generic, brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-darkbg-950 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500"
          >
            <option value="">All Categories</option>
            {standardCategories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Expiry Status Dropdown */}
          <select
            value={expiryStatusFilter}
            onChange={(e) => setExpiryStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-darkbg-950 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500"
          >
            <option value="">All Expiry Statuses</option>
            <option value="EXPIRED">EXPIRED (Past Today)</option>
            <option value="CRITICAL">CRITICAL (&le; 30 Days)</option>
            <option value="WARNING">WARNING (&le; 60 Days)</option>
            <option value="CAUTION">CAUTION (&le; 90 Days)</option>
            <option value="SAFE">SAFE (&gt; 90 Days)</option>
          </select>

          {/* Reorder Status Toggle */}
          <button
            onClick={() => setReorderFilter(!reorderFilter)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              reorderFilter
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/25 shadow shadow-amber-500/5'
                : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
          >
            Need Reorder
          </button>
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
            <p>Error checking medicine system: {fetchError.message}</p>
          </div>
        ) : medicines.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <p className="text-base font-medium">No items found matching the filter credentials.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-white/[0.02]">
                  <th className="py-4 px-6">Product Description</th>
                  <th className="py-4 px-6">Batch details</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Stock Level</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Expiry Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {medicines.map((item) => {
                  const isLowStock = item.quantity <= item.reorderLevel;
                  
                  return (
                    <tr key={item._id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-semibold text-white text-base flex items-center gap-2">
                            <span>{item.name}</span>
                            {item.barcode && (
                              <span className="text-[10px] text-slate-500 font-mono flex items-center gap-0.5 bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-700/30">
                                <Barcode className="w-3 h-3" />
                                {item.barcode}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 font-medium italic">
                            Generic: {item.genericName}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Brand: {item.manufacturer}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm">
                          <span className="font-semibold text-slate-300">Batch: </span>
                          <span className="font-mono text-brand-400">{item.batchNumber}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Mfg: {new Date(item.manufactureDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className={`text-sm font-bold ${
                            item.quantity === 0 ? 'text-red-400' : isLowStock ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {item.quantity} units
                          </span>
                          <span className="text-xs text-slate-500 mt-0.5 font-medium">
                            Reorder boundary: {item.reorderLevel}
                          </span>
                          {isLowStock && (
                            <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded mt-1 w-max font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Low Stock Alert
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-white font-semibold">${item.price.toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold w-max text-center ${getExpiryBadgeStyle(item.expiryStatus)}`}>
                            {item.expiryStatus}
                          </span>
                          <span className="text-xs text-slate-400">
                            Exp: {new Date(item.expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkbg-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl p-6 relative overflow-hidden max-h-[90vh] overflow-y-auto">
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
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleOcrFileChange}
                className="hidden"
                accept="image/*"
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 p-3 bg-brand-500/5 border border-brand-500/10 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-brand-400 uppercase tracking-wider block">Intelligent Scanning</span>
                    <span className="text-[10px] text-slate-400">Upload a label photo to extract name, batch, and expiry details.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    disabled={ocrLoading}
                    className="px-3.5 py-1.5 bg-brand-500 hover:bg-brand-400 text-white font-semibold text-xs rounded-xl shadow shadow-brand-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {ocrLoading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{ocrLoading ? 'Scanning...' : 'Scan Label'}</span>
                  </button>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Medicine Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Lipitor"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Generic Formula Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    placeholder="e.g. Atorvastatin Calcium"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Manufacturer *
                  </label>
                  <input
                    type="text"
                    required
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    placeholder="e.g. Pfizer"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Batch Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="e.g. BATCH-99A"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm font-mono"
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
                    {standardCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
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
                    placeholder="12.99"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="200"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Reorder Level Boundary *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value)}
                    placeholder="10"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Manufacture Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={manufactureDate}
                    onChange={(e) => setManufactureDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-500 text-sm"
                  />
                </div>

                <div>
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

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Barcode
                  </label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="e.g. 78910293847"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Label Image URL
                  </label>
                  <input
                    type="text"
                    value={labelImageUrl}
                    onChange={(e) => setLabelImageUrl(e.target.value)}
                    placeholder="https://image-link.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    rows="2"
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

      {/* Bulk Import Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkbg-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-brand-400" />
                <span>Bulk Import JSON Records</span>
              </h3>
              <button onClick={closeBulkModal} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Paste a JSON array containing medicine objects. Duplicate batch numbers will be skipped automatically.
            </p>

            {bulkSuccess && (
              <div className="mb-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                {bulkSuccess}
              </div>
            )}

            {bulkError && (
              <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {bulkError}
              </div>
            )}

            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  JSON Raw Array
                </label>
                <textarea
                  rows="8"
                  required
                  value={bulkJson}
                  onChange={(e) => setBulkJson(e.target.value)}
                  placeholder={`[
  {
    "name": "Aspirin",
    "genericName": "Acetylsalicylic Acid",
    "manufacturer": "Bayer",
    "batchNumber": "ASP-5001",
    "manufactureDate": "2026-01-01",
    "expiryDate": "2028-12-01",
    "quantity": 300,
    "reorderLevel": 20,
    "price": 4.50,
    "category": "Analgesic"
  }
]`}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 text-xs font-mono resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={closeBulkModal}
                  className="px-4 py-2.5 bg-white/5 text-slate-300 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkImportMutation.isPending}
                  className="px-5 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 text-sm"
                >
                  {bulkImportMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Process Bulk Import'
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
