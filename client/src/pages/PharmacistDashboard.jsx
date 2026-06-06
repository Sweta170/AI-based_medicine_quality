import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  LayoutDashboard, Pill, Plus, Edit2, Trash2, Search, Filter, 
  AlertTriangle, CheckCircle, X, Calendar, RefreshCw, Barcode, 
  Database, Upload, Eye, Bell, Settings, Receipt, Users, LogOut, 
  DollarSign, AlertCircle, ArrowRight, Lock, User, Info, ShieldAlert,
  Menu
} from 'lucide-react';

const getDaysLeft = (expiryDate) => {
  const diffTime = new Date(expiryDate) - new Date();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const PharmacistDashboard = () => {
  const { user: currentUser, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // Layout Tab State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);

  const handleNavClick = (tabName) => {
    setActiveTab(tabName);
    setIsSidebarMobileOpen(false);
  };

  // Search & Filter States
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [expiryStatusFilter, setExpiryStatusFilter] = useState('');
  const [reorderFilter, setReorderFilter] = useState(false);

  // Modal States
  const [medModalOpen, setMedModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [triggerLoading, setTriggerLoading] = useState(null);

  // Single Medicine Form States
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [manufactureDate, setManufactureDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reorderLevel, setReorderLevel] = useState('10');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Antibiotic');
  const [barcode, setBarcode] = useState('');
  const [labelImageUrl, setLabelImageUrl] = useState('');
  const [error, setError] = useState('');

  // Bulk Import Form States
  const [bulkJson, setBulkJson] = useState('');
  const [bulkError, setBulkError] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState('');

  // Inventory Table Sort States
  const [invSortField, setInvSortField] = useState('name');
  const [invSortDirection, setInvSortDirection] = useState('asc');
  const [invSearch, setInvSearch] = useState('');

  // Billing states
  const [billSearch, setBillSearch] = useState('');
  const [billCategory, setBillCategory] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [billItems, setBillItems] = useState([]);
  const [discount, setDiscount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [billError, setBillError] = useState('');
  const [billSuccess, setBillSuccess] = useState('');
  const [isBillingPending, setIsBillingPending] = useState(false);

  // Settings mock profile state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Queries
  // Fetch medicines with general filters
  const { data: medicines = [], isLoading: isMedsLoading, refetch: refetchMeds, isRefetching: isMedsRefetching } = useQuery({
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

  // Fetch all bills (for statistics and charts)
  const { data: bills = [], isLoading: isBillsLoading, refetch: refetchBills } = useQuery({
    queryKey: ['bills'],
    queryFn: async () => {
      const { data } = await api.get('/bills');
      return data;
    },
  });

  // Fetch all customers for billing selections
  const { data: customers = [], isLoading: isCustomersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data } = await api.get('/users/customers');
      return data;
    },
  });

  // Fetch notification history for the pharmacist log
  const { data: logs = [], isLoading: isLogsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['notificationLogs', currentUser?._id],
    queryFn: async () => {
      if (!currentUser?._id) return [];
      const { data } = await api.get(`/notifications/${currentUser._id}`);
      return data;
    },
    enabled: !!currentUser?._id,
  });

  // Mutations
  // Create Medicine Mutation
  const createMedMutation = useMutation({
    mutationFn: async (newMed) => {
      const { data } = await api.post('/medicines', newMed);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['medicines']);
      closeMedModal();
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to add medicine');
    }
  });

  // Update Medicine Mutation
  const updateMedMutation = useMutation({
    mutationFn: async ({ id, updatedData }) => {
      const { data } = await api.put(`/medicines/${id}`, updatedData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['medicines']);
      closeMedModal();
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to update medicine');
    }
  });

  // Delete Medicine Mutation
  const deleteMedMutation = useMutation({
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
      setBulkSuccess(`Successfully imported ${data.insertedCount} items! Skipped ${data.skippedCount} duplicates.`);
      setBulkJson('');
      setTimeout(() => {
        closeBulkModal();
      }, 3000);
    },
    onError: (err) => {
      setBulkError(err.response?.data?.message || 'Failed to import JSON data');
    }
  });

  // Handle Form Openings
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
    setMedModalOpen(true);
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
    setMedModalOpen(true);
  };

  const closeMedModal = () => {
    setMedModalOpen(false);
    setEditingMedicine(null);
    setError('');
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

  // CRUD Submissions
  const handleMedSubmit = (e) => {
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
      updateMedMutation.mutate({ id: editingMedicine._id, updatedData: medData });
    } else {
      createMedMutation.mutate(medData);
    }
  };

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    setBulkError('');
    setBulkSuccess('');

    try {
      const parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) {
        setBulkError('Data must be a JSON array of objects: [ {...}, {...} ]');
        return;
      }
      bulkImportMutation.mutate(parsed);
    } catch (err) {
      setBulkError('Invalid JSON format. Please verify braces and quotation marks.');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this medicine from the inventory database?')) {
      deleteMedMutation.mutate(id);
    }
  };

  // OCR Label Scanning Handler
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

      alert(`OCR Scan Successful!\nConfidence: ${data.confidence.toUpperCase()}\nName: ${data.medicineName || 'N/A'}\nBatch: ${data.batchNumber || 'N/A'}\nExpiry: ${data.expiryDate || 'N/A'}`);
    } catch (err) {
      console.error('OCR scan failed:', err);
      setError(err.response?.data?.message || 'OCR Image parsing failed.');
    } finally {
      setOcrLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Manual Trigger Cron Handler
  const handleTriggerCron = async (cronNumber) => {
    setTriggerLoading(cronNumber);
    try {
      const { data } = await api.post(`/notifications/trigger/${cronNumber}`);
      alert(`Cron triggered successfully!\nDetails: ${data.message}`);
      queryClient.invalidateQueries(['notificationLogs', currentUser?._id]);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to trigger cron job');
    } finally {
      setTriggerLoading(null);
    }
  };

  // Billing Logic
  const handleAddToBill = (med) => {
    setBillItems(prevItems => {
      const existing = prevItems.find(item => item._id === med._id);
      if (existing) {
        if (existing.billQuantity >= med.quantity) {
          alert(`Insufficient stock. Only ${med.quantity} units available.`);
          return prevItems;
        }
        return prevItems.map(item => 
          item._id === med._id ? { ...item, billQuantity: item.billQuantity + 1 } : item
        );
      }
      return [...prevItems, { ...med, billQuantity: 1 }];
    });
  };

  const handleUpdateBillQty = (id, newQty, maxQty) => {
    const qty = parseInt(newQty) || 0;
    if (qty > maxQty) {
      alert(`Insufficient stock. Only ${maxQty} units available.`);
      return;
    }
    setBillItems(prevItems => 
      prevItems.map(item => item._id === id ? { ...item, billQuantity: qty } : item).filter(item => item.billQuantity > 0)
    );
  };

  const handleRemoveFromBill = (id) => {
    setBillItems(prev => prev.filter(item => item._id !== id));
  };

  const calculateBillSubtotal = () => {
    return billItems.reduce((sum, item) => sum + item.price * item.billQuantity, 0);
  };

  const calculateBillTotal = () => {
    const sub = calculateBillSubtotal();
    const disc = parseFloat(discount) || 0;
    return Math.max(0, sub - disc);
  };

  const handleConfirmAndPrintBill = async (e) => {
    e.preventDefault();
    setBillError('');
    setBillSuccess('');

    if (!selectedCustomerId) {
      setBillError('Please select a customer for this bill');
      return;
    }

    if (billItems.length === 0) {
      setBillError('Please add at least one medicine to the bill');
      return;
    }

    // Check if any item is expired
    if (billItems.some(item => item.expiryStatus === 'EXPIRED')) {
      setBillError('Billing Blocked: Cannot submit a bill containing expired medicines.');
      return;
    }

    setIsBillingPending(true);
    try {
      const payload = {
        customerId: selectedCustomerId,
        items: billItems.map(item => ({
          medicineId: item._id,
          quantity: item.billQuantity
        })),
        discount: parseFloat(discount) || 0,
        paymentMethod
      };

      // Create bill
      const { data } = await api.post('/bills', payload);

      setBillSuccess(`Bill ${data.billNumber} created successfully! Starting receipt PDF print.`);
      
      // Reset bill inputs
      setBillItems([]);
      setDiscount('');
      setSelectedCustomerId('');

      // Auto trigger PDF Download
      const response = await api.get(`/bills/${data._id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `invoice-${data.billNumber}.pdf`;
      link.click();

      // Refresh data
      queryClient.invalidateQueries(['medicines']);
      queryClient.invalidateQueries(['bills']);
    } catch (err) {
      console.error(err);
      setBillError(err.response?.data?.message || 'Failed to process checkout bill.');
    } finally {
      setIsBillingPending(false);
    }
  };

  // Password reset handler (mock)
  const handlePasswordReset = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (!currentPassword || !newPassword) {
      setPasswordError('Please fill in password fields');
      return;
    }
    setPasswordSuccess('Password successfully updated (Mock Action)!');
    setCurrentPassword('');
    setNewPassword('');
  };

  // Helper date calculations for stats
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const todayDateStr = new Date().toDateString();

  const totalMedsStockCount = medicines.length;
  const expiredCount = medicines.filter(m => m.expiryStatus === 'EXPIRED').length;
  const expiringThisMonthCount = medicines.filter(m => {
    const exp = new Date(m.expiryDate);
    return exp.getMonth() === currentMonth && exp.getFullYear() === currentYear;
  }).length;

  const billsTodayList = bills.filter(b => new Date(b.createdAt).toDateString() === todayDateStr);
  const billsTodayCount = billsTodayList.length;

  // Chart data calculations
  const getLast7DaysData = () => {
    const data = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStr = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      
      const dayBills = bills.filter(b => new Date(b.createdAt).toDateString() === d.toDateString());
      const revenue = dayBills.reduce((sum, b) => sum + b.total, 0);

      data.push({
        name: dayStr,
        Bills: dayBills.length,
        Revenue: parseFloat(revenue.toFixed(2)),
      });
    }
    return data;
  };

  const chartData = getLast7DaysData();

  // Top 10 Expiring Medicines Soonest
  const top10ExpiringSoonest = [...medicines]
    .filter(m => m.quantity > 0)
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
    .slice(0, 10);

  // Status Badge Colors Helper
  const getExpiryStatusBadge = (status) => {
    switch (status) {
      case 'EXPIRED':
        return 'bg-red-50 text-red-700 border-red-200 border text-[11px] font-extrabold uppercase px-2 py-0.5 rounded';
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-700 border-rose-200 border text-[11px] font-bold uppercase px-2 py-0.5 rounded';
      case 'WARNING':
        return 'bg-orange-50 text-orange-700 border-orange-200 border text-[11px] font-semibold uppercase px-2 py-0.5 rounded';
      case 'CAUTION':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 border text-[11px] font-medium uppercase px-2 py-0.5 rounded';
      case 'SAFE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 border text-[11px] font-semibold uppercase px-2 py-0.5 rounded';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 border text-[11px] px-2 py-0.5 rounded';
    }
  };

  // Inventory Table Filter and Sort
  const handleSort = (field) => {
    if (invSortField === field) {
      setInvSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setInvSortField(field);
      setInvSortDirection('asc');
    }
  };

  const filteredInventory = medicines.filter(m => {
    const q = invSearch.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.genericName.toLowerCase().includes(q) ||
      m.batchNumber.toLowerCase().includes(q)
    );
  });

  const sortedInventory = [...filteredInventory].sort((a, b) => {
    let valA = a[invSortField];
    let valB = b[invSortField];

    if (invSortField === 'expiryDate') {
      valA = new Date(a.expiryDate);
      valB = new Date(b.expiryDate);
    }

    if (valA < valB) return invSortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return invSortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Category listing
  const standardCategories = [
    'Antibiotic', 'Analgesic', 'Antihistamine', 'Antiviral', 
    'Cardiovascular', 'Diabetes', 'Vitamins/Supplements', 'Other'
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0C1628] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarMobileOpen && (
        <div 
          onClick={() => setIsSidebarMobileOpen(false)} 
          className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-xs md:hidden"
        ></div>
      )}

      {/* Fixed Sidebar */}
      <aside className={`w-56 bg-slate-100 dark:bg-[#111827] border-r border-slate-200 dark:border-slate-700/40 flex flex-col fixed inset-y-0 left-0 z-30 transition-transform duration-300 md:translate-x-0 transition-colors duration-200 ${
        isSidebarMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700/40 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#1A56A0] flex items-center justify-center text-white shrink-0">
            <Pill className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white text-sm leading-none tracking-tight">PHARMADESK PORTAL</h1>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-0.5 block">Pharmacist Tier</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1">
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
              activeTab === 'dashboard'
                ? 'bg-blue-50 dark:bg-brand/15 text-blue-700 dark:text-sky-400 border-blue-200 dark:border-brand/20 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200 border-transparent'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => handleNavClick('medicines')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
              activeTab === 'medicines'
                ? 'bg-blue-50 dark:bg-brand/15 text-blue-700 dark:text-sky-400 border-blue-200 dark:border-brand/20 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200 border-transparent'
            }`}
          >
            <Database className="w-4 h-4 shrink-0" />
            <span>Medicines Catalog</span>
          </button>

          <button
            onClick={() => handleNavClick('new-bill')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
              activeTab === 'new-bill'
                ? 'bg-blue-50 dark:bg-brand/15 text-blue-700 dark:text-sky-400 border-blue-200 dark:border-brand/20 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200 border-transparent'
            }`}
          >
            <Receipt className="w-4 h-4 shrink-0" />
            <span>New Bill Builder</span>
          </button>

          <button
            onClick={() => handleNavClick('inventory')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
              activeTab === 'inventory'
                ? 'bg-blue-50 dark:bg-brand/15 text-blue-700 dark:text-sky-400 border-blue-200 dark:border-brand/20 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200 border-transparent'
            }`}
          >
            <Barcode className="w-4 h-4 shrink-0" />
            <span>Inventory Tracker</span>
          </button>

          <button
            onClick={() => handleNavClick('customers')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
              activeTab === 'customers'
                ? 'bg-blue-50 dark:bg-brand/15 text-blue-700 dark:text-sky-400 border-blue-200 dark:border-brand/20 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200 border-transparent'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Customers Sheet</span>
          </button>

          <button
            onClick={() => handleNavClick('notifications')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
              activeTab === 'notifications'
                ? 'bg-blue-50 dark:bg-brand/15 text-blue-700 dark:text-sky-400 border-blue-200 dark:border-brand/20 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200 border-transparent'
            }`}
          >
            <Bell className="w-4 h-4 shrink-0" />
            <span>System Tasks</span>
          </button>

          <button
            onClick={() => handleNavClick('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
              activeTab === 'settings'
                ? 'bg-blue-50 dark:bg-brand/15 text-blue-700 dark:text-sky-400 border-blue-200 dark:border-brand/20 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200 border-transparent'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Profile settings</span>
          </button>
        </nav>

        {/* Footer User Profile Summary */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-700/40 bg-slate-50 dark:bg-slate-900/10 flex items-center justify-between transition-colors duration-200">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-brand/10 dark:bg-brand/20 border border-brand/20 dark:border-brand/30 text-brand dark:text-sky-400 font-bold flex items-center justify-center shrink-0 text-xs">
              {currentUser?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-left overflow-hidden">
              <span className="block font-bold text-xs text-slate-800 dark:text-slate-200 truncate leading-tight">{currentUser?.name}</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 truncate block leading-tight">{currentUser?.email}</span>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 md:pl-56 overflow-y-auto min-h-screen">
        <header className="bg-white dark:bg-[#111827] border-b border-slate-200 dark:border-slate-700/50 py-3 px-6 flex justify-between items-center sticky top-0 z-10 transition-colors duration-200">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSidebarMobileOpen(!isSidebarMobileOpen)}
              className="p-1.5 md:hidden text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg mr-2"
            >
              <Menu className="w-4 h-4" />
            </button>
            <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Pharmadesk Operations</span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-slate-800 dark:text-slate-200 text-[10px] font-extrabold uppercase tracking-widest">{activeTab}</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggle} 
              className="p-1 rounded-lg transition-colors border border-slate-200/55 dark:border-slate-700/50 dark:bg-slate-800 dark:hover:bg-slate-700 bg-slate-100 hover:bg-slate-200 normal-case shrink-0"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
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
                <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <span>Server: <span className="text-emerald-600 dark:text-emerald-400 font-bold">Online</span></span>
            <span>|</span>
            <span>Current Date: <span className="text-slate-800 dark:text-slate-200 font-semibold">{new Date().toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span></span>
          </div>
        </header>

        <div className="p-4 max-w-7xl mx-auto space-y-4">
          {/* TAB 1: DASHBOARD HOME */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm relative overflow-hidden flex items-center justify-between transition-colors duration-200">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Total Medicines</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">{isMedsLoading ? '...' : totalMedsStockCount}</span>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-white/5 text-[#1A56A0] dark:text-sky-400 flex items-center justify-center shrink-0">
                    <Pill className="w-4 h-4" />
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm relative overflow-hidden flex items-center justify-between transition-colors duration-200">
                  <div>
                    <span className="text-red-500 text-[10px] font-bold uppercase tracking-wider block">Expired Batches</span>
                    <span className="text-xl font-bold text-red-600 dark:text-red-400 mt-1 block">{isMedsLoading ? '...' : expiredCount}</span>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-red-50 dark:bg-white/5 text-red-600 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm relative overflow-hidden flex items-center justify-between transition-colors duration-200">
                  <div>
                    <span className="text-orange-500 text-[10px] font-bold uppercase tracking-wider block">Expiring This Month</span>
                    <span className="text-xl font-bold text-orange-600 dark:text-orange-400 mt-1 block">{isMedsLoading ? '...' : expiringThisMonthCount}</span>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-white/5 text-orange-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>

                <div className="bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm relative overflow-hidden flex items-center justify-between transition-colors duration-200">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Bills Created Today</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-white mt-1 block">{isBillsLoading ? '...' : billsTodayCount}</span>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-slate-50 dark:bg-white/5 text-slate-600 flex items-center justify-center shrink-0">
                    <Receipt className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Chart Panel */}
              <div className="bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm transition-colors duration-200">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-250">Sales & Billing History</h3>
                    <p className="text-xs text-slate-455 dark:text-slate-500 mt-0.5">Summary of bills processed over the last 7 calendar days.</p>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-[#1A56A0] dark:text-sky-400 bg-blue-50 dark:bg-white/5 px-2 py-0.5 rounded border border-blue-100 dark:border-slate-700/40">Live feed</span>
                </div>
                {isBillsLoading ? (
                  <div className="py-20 flex justify-center">
                    <span className="w-6 h-6 border-2 border-slate-200 border-t-[#1A56A0] rounded-full animate-spin"></span>
                  </div>
                ) : (
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#334155' : '#f1f5f9'} />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 10 }} />
                        <YAxis tickLine={false} axisLine={false} tick={{ fill: theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 10 }} />
                        <Tooltip 
                          cursor={{ fill: theme === 'dark' ? '#1e293b' : '#f8fafc' }} 
                          contentStyle={theme === 'dark' ? { backgroundColor: '#111827', borderRadius: '8px', border: '1px solid #374151', color: '#f9fafb', fontSize: 11 } : { backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', fontSize: 11 }} 
                        />
                        <Bar dataKey="Bills" fill={theme === 'dark' ? '#38bdf8' : '#1A56A0'} radius={[4, 4, 0, 0]} name="Bills Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Expiring Soonest Table */}
              <div className="bg-white dark:bg-[#1a2438] rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden transition-colors duration-200">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700/50">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span>Top 10 Medicines Expiring Soonest</span>
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Urgent list of active stock batches approaching expiration.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700/50 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-4">Medicine Details</th>
                        <th className="py-2.5 px-4">Batch No</th>
                        <th className="py-2.5 px-4">Expiry Date</th>
                        <th className="py-2.5 px-4">Days Remaining</th>
                        <th className="py-2.5 px-4">Stock level</th>
                        <th className="py-2.5 px-4">Status Badge</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-xs">
                      {isMedsLoading ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-400">Loading medicines...</td>
                        </tr>
                      ) : top10ExpiringSoonest.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-400">No active stock expiring.</td>
                        </tr>
                      ) : (
                        top10ExpiringSoonest.map(m => {
                          const daysRemaining = getDaysLeft(m.expiryDate);
                          return (
                            <tr key={m._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="py-2.5 px-4 font-semibold text-slate-850 dark:text-slate-200">
                                {m.name} <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal block font-sans">Formula: {m.genericName}</span>
                              </td>
                              <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-400">{m.batchNumber}</td>
                              <td className="py-2.5 px-4 text-slate-650 dark:text-slate-400">
                                {new Date(m.expiryDate).toLocaleDateString()}
                              </td>
                              <td className="py-2.5 px-4">
                                <span className={`font-bold ${
                                  daysRemaining <= 30 ? 'text-red-600 dark:text-red-400' :
                                  daysRemaining <= 60 ? 'text-orange-600 dark:text-orange-400' : 'text-slate-700 dark:text-slate-300'
                                }`}>
                                  {daysRemaining <= 0 ? 'Expired' : `${daysRemaining} days`}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 font-medium text-slate-700 dark:text-slate-350">{m.quantity} units</td>
                              <td className="py-2.5 px-4">{getExpiryStatusBadge(m.expiryStatus)}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEDICINES CATALOG (CRUD + OCR + BULK) */}
          {activeTab === 'medicines' && (
            <div className="space-y-4">
              {/* Header Panel */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm transition-colors duration-200">
                <div>
                  <h2 className="font-bold text-sm text-slate-800 dark:text-slate-200">Catalog Database Manager</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Configure pharmaceutical items, upload images for OCR scanning, and import batch files.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => refetchMeds()}
                    disabled={isMedsLoading || isMedsRefetching}
                    className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-605 dark:text-slate-350 rounded-lg transition-all"
                    title="Refresh List"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isMedsRefetching ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={openBulkModal}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Bulk JSON</span>
                  </button>
                  <button
                    onClick={openAddModal}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#1A56A0] hover:bg-[#1A56A0]/90 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-[#1A56A0]/10"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Medicine</span>
                  </button>
                </div>
              </div>

              {/* Filters Toolbar */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white dark:bg-[#1a2438] p-3 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm transition-colors duration-200">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by name, formula, batch..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-[#1A56A0] text-slate-700 dark:text-slate-250 bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="relative">
                  <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-[#1A56A0] text-slate-705 dark:text-slate-250 bg-white dark:bg-slate-900"
                  >
                    <option value="">All Categories</option>
                    {standardCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="relative">
                  <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <select
                    value={expiryStatusFilter}
                    onChange={(e) => setExpiryStatusFilter(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-[#1A56A0] text-slate-705 dark:text-slate-250 bg-white dark:bg-slate-900"
                  >
                    <option value="">All Expiry Statuses</option>
                    <option value="EXPIRED">EXPIRED</option>
                    <option value="CRITICAL">CRITICAL (&le;30d)</option>
                    <option value="WARNING">WARNING (&le;60d)</option>
                    <option value="CAUTION">CAUTION (&le;90d)</option>
                    <option value="SAFE">SAFE (&gt;90d)</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-605 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={reorderFilter}
                      onChange={(e) => setReorderFilter(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-700 text-[#1A56A0] focus:ring-[#1A56A0] w-4 h-4 bg-white dark:bg-slate-900"
                    />
                    <span>Show Reorder Levels (&le; min stock)</span>
                  </label>
                </div>
              </div>

              {/* Table List */}
              <div className="bg-white dark:bg-[#1a2438] rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden transition-colors duration-200">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700/50 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-4">Name & Category</th>
                        <th className="py-2.5 px-4">Batch Details</th>
                        <th className="py-2.5 px-4">Price</th>
                        <th className="py-2.5 px-4">Stock level</th>
                        <th className="py-2.5 px-4">Expiry Info</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-xs">
                      {isMedsLoading ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">Loading medicines...</td>
                        </tr>
                      ) : medicines.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">No medicines found matching criteria.</td>
                        </tr>
                      ) : (
                        medicines.map(med => (
                          <tr key={med._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="py-2.5 px-4">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">{med.name}</span>
                              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mt-0.5">{med.category}</span>
                            </td>
                            <td className="py-2.5 px-4">
                              <span className="text-slate-600 dark:text-slate-400 block">Batch: <span className="font-mono font-semibold">{med.batchNumber}</span></span>
                              <span className="text-slate-450 dark:text-slate-500 block mt-0.5 text-[10px]">Formula: {med.genericName}</span>
                            </td>
                            <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200">${med.price.toFixed(2)}</td>
                            <td className="py-2.5 px-4">
                              <span className={`font-semibold ${med.quantity <= med.reorderLevel ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                {med.quantity} units
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5 font-sans">Min Limit: {med.reorderLevel}</span>
                            </td>
                            <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                              <span className="block">EXP: {new Date(med.expiryDate).toLocaleDateString()}</span>
                              <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">MFG: {new Date(med.manufactureDate).toLocaleDateString()}</span>
                            </td>
                            <td className="py-2.5 px-4">{getExpiryStatusBadge(med.expiryStatus)}</td>
                            <td className="py-2.5 px-4 text-right">
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() => openEditModal(med)}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                                  title="Edit Item"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(med._id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                  title="Delete Item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NEW BILL BUILDER (TWO PANEL) */}
          {activeTab === 'new-bill' && (
            <div className="space-y-4">
              {billSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{billSuccess}</span>
                </div>
              )}
              {billError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs rounded-xl flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-red-605 dark:text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Validation error</span>
                    <span className="text-[11px] leading-relaxed block mt-0.5">{billError}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                {/* Left Panel: Live Search */}
                <div className="lg:col-span-5 bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm space-y-3 transition-colors duration-200">
                  <div className="border-b border-slate-100 dark:border-slate-700/50 pb-2">
                    <h3 className="font-bold text-xs text-[#1A56A0] dark:text-sky-400 uppercase tracking-wider">Medicine Catalog Lookup</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Filter the active product list and click Add to invoice.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search medicines..."
                        value={billSearch}
                        onChange={(e) => setBillSearch(e.target.value)}
                        className="w-full pl-8 pr-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] focus:outline-none focus:border-[#1A56A0] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <select
                      value={billCategory}
                      onChange={(e) => setBillCategory(e.target.value)}
                      className="py-1.5 px-2 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] focus:outline-none focus:border-[#1A56A0] text-slate-705 dark:text-slate-250 bg-white dark:bg-slate-900"
                    >
                      <option value="">All Categories</option>
                      {standardCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Medicines Search Results */}
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {isMedsLoading ? (
                      <div className="py-6 text-center text-xs text-slate-400">Loading medicines...</div>
                    ) : medicines.filter(m => {
                      const q = billSearch.toLowerCase();
                      const cat = billCategory;
                      const matchesSearch = m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q) || m.batchNumber.toLowerCase().includes(q);
                      const matchesCategory = cat ? m.category === cat : true;
                      return matchesSearch && matchesCategory;
                    }).length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">No medicines found.</div>
                    ) : (
                      medicines.filter(m => {
                        const q = billSearch.toLowerCase();
                        const cat = billCategory;
                        const matchesSearch = m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q) || m.batchNumber.toLowerCase().includes(q);
                        const matchesCategory = cat ? m.category === cat : true;
                        return matchesSearch && matchesCategory;
                      }).map(med => {
                        const isStockOut = med.quantity === 0;
                        const isExpired = med.expiryStatus === 'EXPIRED';
                        return (
                          <div 
                            key={med._id} 
                            onClick={() => !isStockOut && !isExpired && handleAddToBill(med)}
                            className={`p-2.5 border border-slate-100 dark:border-slate-700/50 rounded-xl flex items-center justify-between text-xs transition-all ${
                              isStockOut || isExpired 
                                ? 'opacity-55 cursor-not-allowed bg-slate-50 dark:bg-slate-900/20' 
                                : 'hover:border-[#1A56A0]/40 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-800 dark:text-slate-205 block text-xs">{med.name}</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-mono">Batch: {med.batchNumber} | Stock: {med.quantity}</span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Category: {med.category}</span>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1 shrink-0">
                              <span className="font-bold text-slate-805 dark:text-slate-200 text-xs">${med.price.toFixed(2)}</span>
                              {getExpiryStatusBadge(med.expiryStatus)}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right Panel: Invoice Board */}
                <div className="lg:col-span-7 bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm space-y-3 transition-colors duration-200">
                  <div className="border-b border-slate-100 dark:border-slate-700/50 pb-2 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-xs text-[#1A56A0] dark:text-sky-400 uppercase tracking-wider">Invoice Worksheet</h3>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Assemble prescription line items, allocate users, and commit bill.</p>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded text-slate-600 dark:text-slate-350">Pending post</span>
                  </div>

                  {/* Customer Select dropdown */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Assign customer registration *</label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-[#1A56A0] text-slate-700 dark:text-slate-250 bg-white dark:bg-slate-900"
                    >
                      <option value="">Choose registered Customer account...</option>
                      {customers.map(cust => (
                        <option key={cust._id} value={cust._id}>{cust.name} ({cust.email})</option>
                      ))}
                    </select>
                  </div>

                  {/* Expiry Alert banner */}
                  {billItems.some(item => item.expiryStatus === 'EXPIRED') && (
                    <div className="p-3 bg-red-100 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2.5 text-red-800 dark:text-red-400">
                      <AlertCircle className="w-4 h-4 text-red-700 dark:text-red-400 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <span className="font-bold text-xs block">BILLING BLOCKED: EXPIRY VIOLATION</span>
                        <span className="text-[10.5px] leading-relaxed block mt-0.5">One or more selected medicines in this worksheet have expired. The checkout action is disabled by compliance rules. Please remove the expired item.</span>
                      </div>
                    </div>
                  )}

                  {/* Selected Items list */}
                  <div className="border border-slate-100 dark:border-slate-700/50 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700/50 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                          <th className="py-2 px-3">Item Details</th>
                          <th className="py-2 px-3 text-right">Price</th>
                          <th className="py-2 px-3 text-center" style={{ width: '80px' }}>Qty</th>
                          <th className="py-2 px-3 text-right">Total</th>
                          <th className="py-2 px-3 text-right">Remove</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                        {billItems.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-400">Worksheet is empty. Select medicines from the left panel to begin.</td>
                          </tr>
                        ) : (
                          billItems.map(item => (
                            <tr key={item._id} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/20">
                              <td className="py-2 px-3">
                                <span className="font-bold text-slate-805 dark:text-slate-200 block">{item.name}</span>
                                <div className="flex items-center gap-1.5 mt-0.5 shrink-0">
                                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">B.No: {item.batchNumber}</span>
                                  {getExpiryStatusBadge(item.expiryStatus)}
                                </div>
                              </td>
                              <td className="py-2 px-3 text-right font-medium text-slate-700 dark:text-slate-350">${item.price.toFixed(2)}</td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.billQuantity}
                                  onChange={(e) => handleUpdateBillQty(item._id, e.target.value, item.quantity)}
                                  className="w-14 px-1.5 py-1 text-center border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900"
                                />
                              </td>
                              <td className="py-2 px-3 text-right font-bold text-slate-800 dark:text-slate-200">
                                ${(item.price * item.billQuantity).toFixed(2)}
                              </td>
                              <td className="py-2 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFromBill(item._id)}
                                  className="text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 p-1"
                                >
                                  <X className="w-3.5 h-3.5 mx-auto" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary calculations */}
                  {billItems.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl space-y-2 text-xs border border-slate-100 dark:border-slate-700/50">
                      <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                        <span>Items Subtotal:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">${calculateBillSubtotal().toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 gap-4">
                        <span>Flat Invoice Discount ($):</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={discount}
                          onChange={(e) => setDiscount(e.target.value)}
                          className="w-20 px-2 py-1 text-right border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900"
                        />
                      </div>

                      <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                        <span>Payment Method:</span>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none text-xs bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                        >
                          <option value="Card">Card Payment</option>
                          <option value="Cash">Cash Handout</option>
                        </select>
                      </div>

                      <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between items-center text-sm font-extrabold text-[#1A56A0] dark:text-sky-400">
                        <span>Grand Total Billed:</span>
                        <span>${calculateBillTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  {billItems.length > 0 && (
                    <button
                      onClick={handleConfirmAndPrintBill}
                      disabled={isBillingPending || billItems.some(item => item.expiryStatus === 'EXPIRED')}
                      className="w-full py-2.5 bg-[#1A56A0] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isBillingPending ? (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <Receipt className="w-4 h-4" />
                      )}
                      <span>Confirm & Print PDF invoice</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: INVENTORY TRACKER */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              {/* Header card */}
              <div className="bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition-colors duration-200">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Inventory Tracker</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Filter, search, and sort through the full pharmaceutical batches dataset.</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search inventory table..."
                    value={invSearch}
                    onChange={(e) => setInvSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-[#1A56A0] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="bg-white dark:bg-[#1a2438] rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden transition-colors duration-200">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700/50 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                        <th onClick={() => handleSort('name')} className="py-2.5 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors">
                          Medicine Name {invSortField === 'name' && (invSortDirection === 'asc' ? '▲' : '▼')}
                        </th>
                        <th onClick={() => handleSort('batchNumber')} className="py-2.5 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors">
                          Batch No {invSortField === 'batchNumber' && (invSortDirection === 'asc' ? '▲' : '▼')}
                        </th>
                        <th onClick={() => handleSort('expiryDate')} className="py-2.5 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors">
                          Expiry Date {invSortField === 'expiryDate' && (invSortDirection === 'asc' ? '▲' : '▼')}
                        </th>
                        <th onClick={() => handleSort('quantity')} className="py-2.5 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors">
                          Qty Level {invSortField === 'quantity' && (invSortDirection === 'asc' ? '▲' : '▼')}
                        </th>
                        <th onClick={() => handleSort('expiryStatus')} className="py-2.5 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors">
                          Compliance Status {invSortField === 'expiryStatus' && (invSortDirection === 'asc' ? '▲' : '▼')}
                        </th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-xs">
                      {sortedInventory.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-400">No inventory records match query.</td>
                        </tr>
                      ) : (
                        sortedInventory.map(med => (
                          <tr key={med._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/20">
                            <td className="py-2.5 px-4">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">{med.name}</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">Formula: {med.genericName} | {med.category}</span>
                            </td>
                            <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-400">{med.batchNumber}</td>
                            <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                              {new Date(med.expiryDate).toLocaleDateString()}
                            </td>
                            <td className="py-2.5 px-4 font-bold text-slate-705 dark:text-slate-300">{med.quantity} units</td>
                            <td className="py-2.5 px-4">{getExpiryStatusBadge(med.expiryStatus)}</td>
                            <td className="py-2.5 px-4 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setActiveTab('medicines');
                                    openEditModal(med);
                                  }}
                                  className="text-[#1A56A0] dark:text-sky-400 hover:text-blue-800 dark:hover:text-sky-305 font-bold text-xs"
                                >
                                  Edit
                                </button>
                                <span className="text-slate-300 dark:text-slate-700">|</span>
                                <button
                                  onClick={() => handleDelete(med._id)}
                                  className="text-red-505 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-bold text-xs"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CUSTOMERS SHEET */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm transition-colors duration-200">
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Customer Records</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Detailed list of registered customer accounts. Click Create Bill to prepare an invoice.</p>
              </div>

              <div className="bg-white dark:bg-[#1a2438] rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden transition-colors duration-200">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700/50 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                        <th className="py-2.5 px-4">Customer Name</th>
                        <th className="py-2.5 px-4">Email Address</th>
                        <th className="py-2.5 px-4">Account Type</th>
                        <th className="py-2.5 px-4">System Status</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-xs">
                      {isCustomersLoading ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400">Loading customers...</td>
                        </tr>
                      ) : customers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-slate-400">No customer records in MongoDB.</td>
                        </tr>
                      ) : (
                        customers.map(cust => (
                          <tr key={cust._id} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/20">
                            <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200">{cust.name}</td>
                            <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400 font-mono">{cust.email}</td>
                            <td className="py-2.5 px-4">
                              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                {cust.role}
                              </span>
                            </td>
                            <td className="py-2.5 px-4">
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 px-2 py-0.5 rounded">
                                ACTIVE
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <button
                                onClick={() => {
                                  setSelectedCustomerId(cust._id);
                                  setActiveTab('new-bill');
                                }}
                                className="px-3 py-1 bg-blue-50 dark:bg-brand/20 text-[#1A56A0] dark:text-sky-400 hover:bg-blue-100 dark:hover:bg-brand/35 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ml-auto"
                              >
                                <span>Create Bill</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: NOTIFICATIONS CRON MANUAL TASKS */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {/* Cron Triggers Panel */}
              <div className="bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm space-y-3 transition-colors duration-200">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Automated Chron Tasks Panel</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Force trigger daily notification cron routines immediately for verification.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleTriggerCron('1')}
                    disabled={triggerLoading === '1'}
                    className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-205 rounded-xl border border-slate-200 dark:border-slate-700/50 text-xs font-semibold bg-white dark:bg-slate-900/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <div className="text-left">
                      <span className="block font-bold">Cron 1: Expiry Alerts</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">Daily 8:00 AM email report</span>
                    </div>
                    {triggerLoading === '1' ? (
                      <span className="w-4 h-4 border-2 border-[#1A56A0] dark:border-sky-400 border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <RefreshCw className="w-4 h-4 text-[#1A56A0] dark:text-sky-400" />
                    )}
                  </button>

                  <button
                    onClick={() => handleTriggerCron('2')}
                    disabled={triggerLoading === '2'}
                    className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-205 rounded-xl border border-slate-200 dark:border-slate-700/50 text-xs font-semibold bg-white dark:bg-slate-900/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <div className="text-left">
                      <span className="block font-bold">Cron 2: Low Stock Warning</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">Daily 9:00 AM stock alerts</span>
                    </div>
                    {triggerLoading === '2' ? (
                      <span className="w-4 h-4 border-2 border-[#1A56A0] dark:border-sky-400 border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <RefreshCw className="w-4 h-4 text-[#1A56A0] dark:text-sky-400" />
                    )}
                  </button>

                  <button
                    onClick={() => handleTriggerCron('3')}
                    disabled={triggerLoading === '3'}
                    className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-205 rounded-xl border border-slate-200 dark:border-slate-700/50 text-xs font-semibold bg-white dark:bg-slate-900/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <div className="text-left">
                      <span className="block font-bold">Cron 3: SMS Medication Alarms</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">Daily 10:00 AM customer SMS alerts</span>
                    </div>
                    {triggerLoading === '3' ? (
                      <span className="w-4 h-4 border-2 border-[#1A56A0] dark:border-sky-400 border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <RefreshCw className="w-4 h-4 text-[#1A56A0] dark:text-sky-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* System Notification History list */}
              <div className="bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm space-y-3 transition-colors duration-200">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/50 pb-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">My Notification Dispatch History</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Log of notifications and email summaries sent to your account.</p>
                  </div>
                  <button
                    onClick={() => refetchLogs()}
                    disabled={isLogsLoading}
                    className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {isLogsLoading ? (
                    <div className="text-center text-xs text-slate-400 py-6">Loading audit history...</div>
                  ) : logs.length === 0 ? (
                    <div className="text-center text-xs text-slate-400 py-6">No notification logs recorded for your profile.</div>
                  ) : (
                    logs.map(log => (
                      <div key={log._id} className="p-3 border border-slate-100 dark:border-slate-700/50 rounded-xl space-y-2 text-xs bg-slate-50/20 dark:bg-slate-900/20">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {log.type} report
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            log.status === 'sent' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                        <p className="text-slate-650 dark:text-slate-350 font-mono text-[11px] leading-relaxed whitespace-pre-line">{log.message}</p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                          Dispatched: {new Date(log.sentAt).toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PROFILE SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-xl mx-auto space-y-4">
              {/* Account profile */}
              <div className="bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm relative overflow-hidden transition-colors duration-200">
                <div className="flex flex-col sm:flex-row items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-700/50 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-brand/20 border-2 border-blue-100 dark:border-brand/30 flex items-center justify-center text-xl font-bold text-[#1A56A0] dark:text-sky-400 shadow-sm">
                    {currentUser?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">{currentUser?.name}</h3>
                    <span className="text-[10px] font-bold text-[#1A56A0] dark:text-sky-400 bg-blue-50 dark:bg-white/5 px-2 py-0.5 rounded border border-blue-100 dark:border-slate-700/40 uppercase mt-0.5 inline-block">
                      {currentUser?.role} Operations
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[9px] font-bold block">Email address</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 mt-0.5 block">{currentUser?.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[9px] font-bold block">Account Status</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">AUTHORIZED / ACTIVE</span>
                  </div>
                </div>
              </div>

              {/* Password update (mock) */}
              <div className="bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm space-y-3 transition-colors duration-200">
                <div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#1A56A0] dark:text-sky-400" />
                    <span>Change Account Password</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Reset your credential keys below.</p>
                </div>

                {passwordSuccess && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs rounded-xl">
                    {passwordSuccess}
                  </div>
                )}
                {passwordError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs rounded-xl">
                    {passwordError}
                  </div>
                )}

                <form onSubmit={handlePasswordReset} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1A56A0] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1A56A0] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1A56A0] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* SINGLE MEDICINE ADD/EDIT MODAL */}
      {medModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1a2438] w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-2xl p-5 relative max-h-[90vh] overflow-y-auto transition-colors duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-700/50 mb-4">
              <h3 className="font-bold text-sm text-[#1A56A0] dark:text-sky-400 uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-[#1A56A0] dark:text-sky-400" />
                <span>{editingMedicine ? 'Modify Medicine Entry' : 'Register New Medicine'}</span>
              </h3>
              <button onClick={closeMedModal} className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-200">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs rounded-xl">
                {error}
              </div>
            )}

            {/* OCR Scanner upload at top */}
            {!editingMedicine && (
              <div className="mb-4 p-3 bg-blue-50/50 dark:bg-brand/10 border border-blue-100 dark:border-brand/20 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#1A56A0] dark:text-sky-400 flex items-center gap-1.5">
                    <Barcode className="w-4 h-4" />
                    <span>OCR Smart Label Autocomplete</span>
                  </span>
                  {ocrLoading && (
                    <span className="text-[10px] text-[#1A56A0] dark:text-sky-400 font-bold flex items-center gap-1">
                      <span className="w-3 h-3 border border-[#1A56A0] dark:border-sky-400 border-t-transparent rounded-full animate-spin"></span>
                      <span>Scanning label...</span>
                    </span>
                  )}
                </div>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-normal">
                  Upload a label photo. The Tesseract engine will parse the medicine name, batch number, and expiry date.
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleOcrFileChange}
                  disabled={ocrLoading}
                  accept="image/*"
                  className="w-full text-slate-600 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-[#1A56A0]/10 dark:file:bg-brand/20 file:text-[#1A56A0] dark:file:text-sky-400 hover:file:bg-[#1A56A0]/20 dark:hover:file:bg-brand/30 text-[11px] cursor-pointer"
                />
              </div>
            )}

            <form onSubmit={handleMedSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Medicine Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Advil"
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1A56A0] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Generic Name *</label>
                  <input
                    type="text"
                    required
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    placeholder="e.g. Ibuprofen"
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1A56A0] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Manufacturer *</label>
                  <input
                    type="text"
                    required
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    placeholder="e.g. Pfizer"
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1A56A0] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Batch Number *</label>
                  <input
                    type="text"
                    required
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="e.g. B123-EXP"
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1A56A0] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Manufacture Date *</label>
                  <input
                    type="date"
                    required
                    value={manufactureDate}
                    onChange={(e) => setManufactureDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1A56A0] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1A56A0] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="9.99"
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1A56A0] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="100"
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1A56A0] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Min Level *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(e.target.value)}
                    placeholder="10"
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1A56A0] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1A56A0] text-slate-700 dark:text-slate-250 bg-white dark:bg-slate-900"
                  >
                    {standardCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Barcode / Code</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="1234567890"
                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1A56A0] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/50 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeMedModal}
                  className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMedMutation.isPending || updateMedMutation.isPending}
                  className="px-4 py-1.5 bg-[#1A56A0] hover:bg-blue-700 text-white font-bold rounded-lg shadow-md disabled:opacity-50"
                >
                  {createMedMutation.isPending || updateMedMutation.isPending ? 'Saving...' : 'Save Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK IMPORT MODAL */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1a2438] w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-2xl p-5 relative transition-colors duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-700/50 mb-4">
              <h3 className="font-bold text-sm text-[#1A56A0] dark:text-sky-400 uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#1A56A0] dark:text-sky-400" />
                <span>Bulk JSON Batch Import</span>
              </h3>
              <button onClick={closeBulkModal} className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-200">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {bulkSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs rounded-xl">
                {bulkSuccess}
              </div>
            )}
            {bulkError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs rounded-xl">
                {bulkError}
              </div>
            )}

            <form onSubmit={handleBulkSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Paste JSON Array *</label>
                <textarea
                  rows={8}
                  required
                  value={bulkJson}
                  onChange={(e) => setBulkJson(e.target.value)}
                  placeholder='[
  {
    "name": "Panadol 500mg",
    "genericName": "Paracetamol",
    "manufacturer": "GSK",
    "batchNumber": "PAN-001",
    "manufactureDate": "2026-01-01",
    "expiryDate": "2028-01-01",
    "price": 4.5,
    "quantity": 500,
    "reorderLevel": 50,
    "category": "Analgesic"
  }
]'
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1A56A0] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 font-mono text-[10.5px] leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/50 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeBulkModal}
                  className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkImportMutation.isPending}
                  className="px-4 py-1.5 bg-[#1A56A0] hover:bg-blue-700 text-white font-bold rounded-lg shadow-md disabled:opacity-50"
                >
                  {bulkImportMutation.isPending ? 'Processing...' : 'Run Import'}
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
