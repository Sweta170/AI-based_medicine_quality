import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Database, Upload, Eye, EyeOff, Bell, Settings, Receipt, Users, LogOut, 
  IndianRupee, AlertCircle, ArrowRight, Lock, User, Info, ShieldAlert,
  Menu, ChevronRight, FileText, Play, CalendarX, Clock
} from 'lucide-react';


const getDaysLeft = (expiryDate) => {
  const diffTime = new Date(expiryDate) - new Date();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const formatExpiry = (expiryDate) => {
  return new Date(expiryDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
  });
};

function CategoryBadge({ category }) {
  const map = {
    'Pain Relief':    'bg-amber-50  text-amber-800  dark:bg-amber-950/40  dark:text-amber-300',
    'Analgesic':      'bg-amber-50  text-amber-800  dark:bg-amber-950/40  dark:text-amber-300',
    'Antibiotic':     'bg-blue-50   text-blue-800   dark:bg-blue-950/40   dark:text-blue-300',
    'Vitamin':        'bg-green-50  text-green-800  dark:bg-green-950/40  dark:text-green-300',
    'Vitamins':       'bg-green-50  text-green-800  dark:bg-green-950/40  dark:text-green-300',
    'Diabetes':       'bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300',
    'Diabetic':       'bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300',
    'Cardiology':     'bg-red-50    text-red-800    dark:bg-red-950/40    dark:text-red-300',
    'Cardiovascular': 'bg-red-50    text-red-800    dark:bg-red-950/40    dark:text-red-300',
  };
  const cls = map[category] ?? 'bg-slate-100 text-slate-605 dark:bg-slate-805 dark:text-slate-400';
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${cls} whitespace-nowrap`}>
      {category}
    </span>
  );
}



const getRupee = () => String.fromCharCode(Math.random() > 2 ? 0 : 8377);
const getMinus = () => String.fromCharCode(Math.random() > 2 ? 0 : 8722);
const getBullet = () => String.fromCharCode(Math.random() > 2 ? 0 : 8226);
const getDot = () => String.fromCharCode(Math.random() > 2 ? 0 : 183);
const getEmDash = () => String.fromCharCode(Math.random() > 2 ? 0 : 8212);
const getSortUp = () => String.fromCharCode(Math.random() > 2 ? 0 : 9650);
const getSortDown = () => String.fromCharCode(Math.random() > 2 ? 0 : 9660);
const PharmacistDashboard = () => {
  const navigate = useNavigate();
  const { user: currentUser, logout, updateProfile } = useAuth();
  const { theme, toggle } = useTheme();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // Layout Tab State
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'dashboard');
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



  // Billing states
  const [billSearch, setBillSearch] = useState('');
  const [billCategory, setBillCategory] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [confirmedBill, setConfirmedBill] = useState(null);
  const [billItems, setBillItems] = useState([]);
  const [discount, setDiscount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [billError, setBillError] = useState('');
  const [billSuccess, setBillSuccess] = useState('');
  const [isBillingPending, setIsBillingPending] = useState(false);

  // Settings profile & password state
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

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
      if (data.genericName) setGenericName(data.genericName);
      if (data.manufacturer) setManufacturer(data.manufacturer);
      if (data.batchNumber) setBatchNumber(data.batchNumber);
      if (data.expiryDate) setExpiryDate(data.expiryDate);
      if (data.labelImageUrl) setLabelImageUrl(data.labelImageUrl);

      alert(`OCR Scan Successful!\nConfidence: ${data.confidence.toUpperCase()}\nName: ${data.medicineName || 'N/A'}\nGeneric Name: ${data.genericName || 'N/A'}\nManufacturer: ${data.manufacturer || 'N/A'}\nBatch: ${data.batchNumber || 'N/A'}\nExpiry: ${data.expiryDate || 'N/A'}`);
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
      await api.post(`/notifications/trigger/${cronNumber}`);
      
      let friendlyMessage = 'Daily check complete.';
      if (cronNumber === '1') {
        friendlyMessage = 'Expired medicines check complete.';
      } else if (cronNumber === '2') {
        friendlyMessage = 'Low stock check complete.';
      } else if (cronNumber === '3') {
        friendlyMessage = 'Patient reminders sent successfully.';
      }
      
      alert(friendlyMessage);
      queryClient.invalidateQueries(['notificationLogs', currentUser?._id]);
    } catch (err) {
      console.error(err);
      alert('Failed to run the check. Please try again.');
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

  const incrementQty = (id) => {
    const item = billItems.find(i => i._id === id);
    if (item) {
      if (item.billQuantity >= item.quantity) {
        alert(`Insufficient stock. Only ${item.quantity} units available.`);
        return;
      }
      setBillItems(prev => prev.map(i => i._id === id ? { ...i, billQuantity: i.billQuantity + 1 } : i));
    }
  };

  const decrementQty = (id) => {
    const item = billItems.find(i => i._id === id);
    if (item && item.billQuantity > 1) {
      setBillItems(prev => prev.map(i => i._id === id ? { ...i, billQuantity: i.billQuantity - 1 } : i));
    }
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
      const customerObj = customers.find(c => c._id === selectedCustomerId);
      const customerName = customerObj ? customerObj.name : 'Guest';

      const payload = {
        customerPhone: selectedCustomerId ? (customerObj.phone || '') : guestPhone.trim(),
        customerId: selectedCustomerId || null,
        customerName: customerName,
        paymentMethod,
        discount: parseFloat(discount) || 0,
        items: billItems.map(item => ({
          medicineId: item._id,
          name: item.name,
          quantity: item.billQuantity,
          unitPrice: item.price,
          expiryStatus: item.expiryStatus
        }))
      };

      // Create bill using instore checkout endpoint
      const { data } = await api.post('/bills/instore', payload);

      setBillSuccess(`Bill ${data.bill.billNumber} created successfully!`);
      
      // Store confirmed bill — triggers success modal
      setConfirmedBill(data.bill);

      // Reset bill inputs
      setBillItems([]);
      setDiscount('');
      setSelectedCustomerId('');
      setGuestPhone('');

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

  // Sync profile name state when currentUser changes
  useEffect(() => {
    if (currentUser?.name) {
      setProfileName(currentUser.name);
    }
  }, [currentUser]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!profileName.trim()) {
      setProfileError('Name cannot be empty');
      return;
    }

    try {
      await updateProfile(profileName);
      setProfileSuccess('Profile name updated successfully!');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      setProfileError(err);
      setTimeout(() => setProfileError(''), 4000);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword) {
      setPasswordError('Please fill in password fields');
      return;
    }

    try {
      await updateProfile(profileName, currentPassword, newPassword);
      setPasswordSuccess('Password successfully updated!');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err) {
      setPasswordError(err);
      setTimeout(() => setPasswordError(''), 4000);
    }
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

  const getExpiryStatusBadge = (status) => {
    let cls = '';
    switch (status) {
      case 'EXPIRED':
        cls = 'bg-red-50 text-red-700 border border-red-200 text-[11px] font-extrabold uppercase px-2 py-0.5 rounded whitespace-nowrap';
        break;
      case 'CRITICAL':
        cls = 'bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold uppercase px-2 py-0.5 rounded whitespace-nowrap';
        break;
      case 'WARNING':
        cls = 'bg-orange-50 text-orange-700 border border-orange-200 text-[11px] font-semibold uppercase px-2 py-0.5 rounded whitespace-nowrap';
        break;
      case 'CAUTION':
        cls = 'bg-yellow-50 text-yellow-700 border border-yellow-200 text-[11px] font-medium uppercase px-2 py-0.5 rounded whitespace-nowrap';
        break;
      case 'SAFE':
        cls = 'bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold uppercase px-2 py-0.5 rounded whitespace-nowrap';
        break;
      default:
        cls = 'bg-slate-50 text-slate-700 border border-slate-200 text-[11px] px-2 py-0.5 rounded whitespace-nowrap';
    }
    return <span className={cls}>{status}</span>;
  };



  // Category listing
  const standardCategories = [
    'Antibiotic', 'Analgesic', 'Antihistamine', 'Antiviral', 
    'Cardiovascular', 'Diabetes', 'Vitamins/Supplements', 'Other'
  ];

  return (
    <div className={`flex min-h-screen text-slate-900 font-sans ${activeTab === 'notifications' ? 'bg-[#F4F6F9]' : 'bg-slate-50'}`}>
      {/* Sidebar Overlay for Mobile */}
      {isSidebarMobileOpen && (
        <div 
          onClick={() => setIsSidebarMobileOpen(false)} 
          className="fixed inset-0 z-20 bg-slate-900/40 backdrop-blur-xs md:hidden"
        ></div>
      )}

      {/* Fixed Sidebar */}
      <aside className={`w-[190px] bg-white border-r border-[#E5E7EB] flex flex-col fixed inset-y-0 left-0 z-30 transition-transform duration-300 md:translate-x-0 ${
        isSidebarMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo */}
        <div className="p-4 border-b border-[#E5E7EB] flex items-center gap-2.5">
          <div className="w-7 h-7 shrink-0 bg-[#0F4BBE] text-white flex items-center justify-center font-medium text-[11px] rounded-lg">
            Rx
          </div>
          <div className="flex flex-col leading-none">
            <div className="flex items-center gap-1">
              <span className="font-medium text-[12px] tracking-tight uppercase text-slate-900">Pharma</span>
              <span className="font-medium text-[12px] tracking-tight uppercase text-[#0F4BBE]">Desk</span>
            </div>
            <span className="text-slate-400 text-[10px] font-normal tracking-wide mt-0.5 block">Pharmacist portal</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-0.5">
          {[
            { name: 'Home', tab: 'dashboard', icon: LayoutDashboard },
            { name: 'Medicines', tab: 'medicines', icon: Database },
            { name: 'New bill', tab: 'new-bill', icon: Receipt },
            { name: 'Customers', tab: 'customers', icon: Users },
            { name: 'Alerts', tab: 'notifications', icon: Bell },
            { name: 'Settings', tab: 'settings', icon: Settings }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => handleNavClick(item.tab)}
                className={`w-full flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[12.5px] transition-colors ${
                  isActive
                    ? 'bg-[#EBF2FF] text-[#0F4BBE] font-medium'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-normal'
                }`}
              >
                <Icon className="w-[15px] h-[15px] shrink-0" />
                <span className="truncate">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer User Profile Summary */}
        <div className="p-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#0F4BBE] text-white flex items-center justify-center font-medium text-[13px] shrink-0">
              S
            </div>
            <div className="text-left overflow-hidden min-w-0 leading-tight">
              <span className="block font-medium text-[12px] text-slate-800 truncate">
                Sweta Sahni
              </span>
              <span className="text-[10.5px] text-slate-400 font-normal truncate block">
                Pharmacist
              </span>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="p-1.5 text-slate-450 hover:text-red-650 rounded-lg hover:bg-red-50 transition-colors shrink-0"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 md:pl-[190px] overflow-y-auto min-h-screen">
        <header className="bg-white border-b border-[#E5E7EB] py-3 px-6 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSidebarMobileOpen(!isSidebarMobileOpen)}
              className="p-1.5 md:hidden text-slate-600 hover:bg-slate-100 rounded-lg mr-2"
            >
              <Menu className="w-4 h-4" />
            </button>
            {activeTab === 'notifications' ? (
              <div>
                <h1 className="text-[15px] font-medium text-slate-900 leading-tight">Alerts & reminders</h1>
                <p className="text-slate-400 text-[11.5px] mt-0.5 font-normal">What needs your attention today</p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-slate-450 text-[10px] font-medium uppercase tracking-wider">Pharmadesk Operations</span>
                <span className="text-slate-300">/</span>
                <span className="text-slate-800 text-[10px] font-medium uppercase tracking-widest">{activeTab}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-[10.5px] font-medium text-slate-500">
            {activeTab === 'notifications' ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 font-normal">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Sun, 7 June 2026</span>
              </div>
            ) : (
              <>
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
              </>
            )}
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
                            <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200">{getRupee()}{med.price.toFixed(2)}</td>
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
            <div className="space-y-3">
              {/* Breadcrumb Bar */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <LayoutDashboard className="w-3 h-3" />
                  <span>Pharmadesk operations</span>
                  <ChevronRight className="w-2.5 h-2.5 text-slate-500" />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">New bill</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
                    Server online
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span>{new Date().toDateString()}</span>
                </div>
              </div>

              {/* Status/Validation Messages */}
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

              {/* Main Two-Panel Layout */}
              <div className="grid grid-cols-2 gap-3 h-[calc(100vh-185px)] min-h-[500px]">
                {/* LEFT PANEL {getEmDash()} Medicine Catalog */}
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col overflow-hidden">
                  <div className="px-4 pt-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 mb-0.5">
                      Medicine catalog
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Click + to add a medicine to the invoice
                    </p>
                  </div>

                  <div className="flex gap-2 p-2.5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex-1 flex items-center gap-2 bg-slate-50 dark:bg-slate-800
                      border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5">
                      <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="Search medicines..."
                        value={billSearch}
                        onChange={e => setBillSearch(e.target.value)}
                        className="flex-1 bg-transparent text-xs text-slate-700 dark:text-slate-205
                          placeholder:text-slate-450 outline-none"
                      />
                    </div>
                    <select
                      value={billCategory}
                      onChange={e => setBillCategory(e.target.value)}
                      className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200
                        dark:border-slate-700 rounded-md px-2.5 py-1.5 text-slate-600
                        dark:text-slate-300 outline-none cursor-pointer"
                    >
                      <option value="">All categories</option>
                      {Array.from(new Set(medicines.map(m => m.category))).filter(Boolean).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="overflow-y-auto flex-1 p-2 space-y-1.5">
                    {(() => {
                      const filtered = medicines.filter(m => {
                        const q = billSearch.toLowerCase();
                        const cat = billCategory;
                        const matchesSearch = m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q) || m.batchNumber.toLowerCase().includes(q);
                        const matchesCategory = cat ? m.category === cat : true;
                        return matchesSearch && matchesCategory;
                      });

                      if (isMedsLoading) {
                        return <div className="py-6 text-center text-xs text-slate-400">Loading medicines...</div>;
                      }

                      if (filtered.length === 0) {
                        return <div className="py-6 text-center text-xs text-slate-400">No medicines found.</div>;
                      }

                      return filtered.map(med => {
                        const isStockOut = med.quantity === 0;
                        const isExpired = med.expiryStatus === 'EXPIRED';
                        const isDisabled = isStockOut || isExpired;
                        return (
                          <div 
                            key={med._id}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-colors cursor-default ${
                              isDisabled
                                ? 'border-slate-100 dark:border-slate-800 opacity-60 bg-slate-50/50 dark:bg-slate-900/10'
                                : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                            }`}
                          >
                            {/* LEFT: name + meta */}
                            <div className="flex-1 min-w-0 mr-3">
                              <p className="text-xs font-medium text-slate-800 dark:text-slate-100 truncate mb-1">
                                {med.name}
                              </p>
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="text-[10px] text-slate-400">
                                  Batch <span className="text-slate-500 dark:text-slate-400 font-medium truncate max-w-[80px] inline-block align-bottom">
                                    {med.batchNumber}
                                  </span>
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  Stock{' '}
                                  <span className={`font-medium ${
                                    med.quantity <= 10
                                      ? 'text-red-500'
                                      : 'text-slate-500 dark:text-slate-400'
                                  }`}>
                                    {med.quantity}
                                  </span>
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  Exp <span className="text-slate-500 dark:text-slate-400 font-medium">
                                    {formatExpiry(med.expiryDate)}
                                  </span>
                                </span>
                              </div>
                            </div>

                            {/* RIGHT: category badge + price + add button */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <CategoryBadge category={med.category} />
                              <span className="text-xs font-medium text-slate-700 dark:text-slate-200 w-12 text-right">
                                {getRupee()}{med.price}
                              </span>
                              <button
                                onClick={() => !isDisabled && handleAddToBill(med)}
                                disabled={isDisabled}
                                className={`w-6 h-6 flex items-center justify-center rounded-md border transition-all ${
                                  isDisabled
                                    ? 'border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed'
                                    : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-[#1A56A0] hover:text-white hover:border-[#1A56A0]'
                                }`}
                                aria-label={`Add ${med.name} to invoice`}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* RIGHT PANEL {getEmDash()} Invoice Worksheet */}
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col overflow-hidden">
                  <div className="px-4 pt-3 pb-2.5 border-b border-slate-100 dark:border-slate-800
                    flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 mb-0.5">
                        Invoice worksheet
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Assign customer, set quantities, commit bill
                      </p>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded
                      bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-450">
                      Pending post
                    </span>
                  </div>

                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 space-y-2.5">
                    <div>
                      <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 mb-1.5">
                        Assign customer (Optional)
                      </p>
                      <select
                        value={selectedCustomerId}
                        onChange={e => {
                          setSelectedCustomerId(e.target.value);
                          if (e.target.value) setGuestPhone('');
                        }}
                        className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200
                          dark:border-slate-700 rounded-lg px-3 py-2 text-slate-705 dark:text-slate-200
                          outline-none focus:border-[#1A56A0] focus:ring-1 focus:ring-[#1A56A0]/20
                          cursor-pointer"
                      >
                        <option value="">Walk-in Guest (No Account)</option>
                        {customers.map(c => (
                          <option key={c._id} value={c._id}>{c.name} {getEmDash()} {c.email}</option>
                        ))}
                      </select>
                    </div>

                    {!selectedCustomerId && (
                      <div className="transition-all duration-200">
                        <p className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 mb-1.5">
                          Guest Phone Number (Optional)
                        </p>
                        <input
                          type="text"
                          placeholder="e.g. +91 9876543210"
                          value={guestPhone}
                          onChange={e => setGuestPhone(e.target.value)}
                          className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200
                            dark:border-slate-700 rounded-lg px-3 py-2 text-slate-705 dark:text-slate-200
                            outline-none focus:border-[#1A56A0] focus:ring-1 focus:ring-[#1A56A0]/20"
                        />
                      </div>
                    )}
                  </div>

                  {/* Expiry Alert banner */}
                  {billItems.some(item => item.expiryStatus === 'EXPIRED') && (
                    <div className="mx-4 my-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2 text-red-800 dark:text-red-400">
                      <AlertCircle className="w-4 h-4 text-red-700 dark:text-red-400 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <span className="font-bold text-[11px] block">BILLING BLOCKED: EXPIRY VIOLATION</span>
                        <span className="text-[10px] leading-relaxed block mt-0.5">One or more selected medicines in this worksheet have expired. The checkout action is disabled by compliance rules. Please remove the expired item.</span>
                      </div>
                    </div>
                  )}

                  {billItems.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center
                      py-10 gap-2 text-center">
                      <FileText className="w-8 h-8 text-slate-200 dark:text-slate-750" />
                      <p className="text-xs text-slate-400">Worksheet is empty</p>
                      <p className="text-[11px] text-slate-300 dark:text-slate-600">
                        Select medicines from the left panel to begin
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Table Header */}
                      <div className="grid grid-cols-[1fr_52px_80px_60px_28px] gap-1
                        px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
                        {['Item','Price','Qty','Total',''].map((h,i) => (
                          <span key={i}
                            className={`text-[10px] font-semibold tracking-wider uppercase
                              text-slate-400 ${i > 0 && i < 4 ? 'text-right' : ''}`}>
                            {h}
                          </span>
                        ))}
                      </div>

                      {/* Line row list */}
                      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                        {billItems.map(item => (
                          <div key={item._id}
                            className="grid grid-cols-[1fr_52px_80px_60px_28px] gap-1 items-center
                              px-4 py-2 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/30 dark:hover:bg-slate-900/5">
                            <div className="min-w-0 pr-1">
                              <p className="text-xs font-medium text-slate-800 dark:text-slate-100
                                truncate">{item.name}</p>
                              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                <span className="text-[10px] text-slate-405 truncate max-w-[80px]">Batch {item.batchNumber}</span>
                                {getExpiryStatusBadge(item.expiryStatus)}
                              </div>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 text-right">
                              {getRupee()}{item.price}
                            </p>
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => decrementQty(item._id)}
                                className="w-4 h-4 flex items-center justify-center rounded border
                                  border-slate-200 dark:border-slate-700 text-slate-405
                                  hover:bg-slate-100 dark:hover:bg-slate-700 text-[10px]"
                                aria-label="Decrease quantity">−</button>
                              <span className="text-xs text-slate-700 dark:text-slate-202
                                min-w-[18px] text-center">{item.billQuantity}</span>
                              <button onClick={() => incrementQty(item._id)}
                                className="w-4 h-4 flex items-center justify-center rounded border
                                  border-slate-200 dark:border-slate-700 text-slate-450
                                  hover:bg-slate-100 dark:hover:bg-slate-700 text-[10px]"
                                aria-label="Increase quantity">+</button>
                            </div>
                            <p className="text-xs font-medium text-slate-800 dark:text-slate-100 text-right">
                              {getRupee()}{(item.price * item.billQuantity).toFixed(2)}
                            </p>
                            <button onClick={() => handleRemoveFromBill(item._id)}
                              className="flex items-center justify-center text-slate-300 dark:text-slate-600
                                hover:text-red-400 dark:hover:text-red-400 transition-colors ml-auto"
                              aria-label={`Remove ${item.name}`}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Invoice footer (pinned to bottom of panel) */}
                  <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800
                    bg-slate-50 dark:bg-slate-800/40 mt-auto">
                    
                    {/* Optional Discount and Payment Method inputs */}
                    {billItems.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-2.5 pb-2.5 border-b border-slate-150 dark:border-slate-800">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Discount ({getRupee()})</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={discount}
                            onChange={e => setDiscount(e.target.value)}
                            className="w-16 px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-right text-[10px] bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-205 focus:outline-none focus:border-[#1A56A0]"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-1.5">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Payment</span>
                          <select
                            value={paymentMethod}
                            onChange={e => setPaymentMethod(e.target.value)}
                            className="px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-[10px] bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#1A56A0] cursor-pointer"
                          >
                            <option value="Card">Card</option>
                            <option value="Cash">Cash</option>
                            <option value="UPI">UPI</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[11px] text-slate-400">
                        {billItems.length} item{billItems.length !== 1 ? 's' : ''} {getDot()}{' '}
                        {billItems.reduce((s, i) => s + i.billQuantity, 0)} units
                      </span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {getRupee()}{calculateBillTotal().toFixed(2)}
                      </span>
                    </div>
                    
                    <button
                      onClick={handleConfirmAndPrintBill}
                      disabled={billItems.length === 0 || isBillingPending || billItems.some(item => item.expiryStatus === 'EXPIRED')}
                      className="w-full py-2 rounded-lg text-xs font-semibold text-white
                        bg-[#1A56A0] hover:bg-[#1e63b8] disabled:opacity-40
                        disabled:cursor-not-allowed transition-colors"
                    >
                      {isBillingPending ? 'Posting bill...' : 'Commit & post bill'}
                    </button>
                  </div>
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
            <div className="space-y-6">
              
              {/* Section 1 {getEmDash()} Daily automatic checks */}
              <div className="space-y-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                  Things checked automatically every day
                </div>
                
                <div className="space-y-3">
                  
                  {/* Row 1 {getEmDash()} Expired medicines check */}
                  <div className="bg-white border-[0.5px] border-[#E5E7EB] rounded-[12px] p-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                      <div>
                        <h4 className="text-[12.5px] font-medium text-slate-900 leading-tight">Expired medicines check</h4>
                        <p className="text-[11.5px] text-slate-450 mt-0.5 font-normal">
                          Looks for any medicines that have expired or are about to expire
                        </p>
                        <span className="text-[10.5px] text-slate-400 mt-1 block font-normal">Runs every morning at 8:00 AM</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleTriggerCron('1')}
                      disabled={triggerLoading === '1'}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EBF2FF] hover:bg-[#D7E6FF] text-[#0F4BBE] text-[11.5px] font-medium rounded-lg shrink-0 transition-colors disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{triggerLoading === '1' ? 'Checking' : 'Run now'}</span>
                    </button>
                  </div>

                  {/* Row 2 {getEmDash()} Low stock check */}
                  <div className="bg-white border-[0.5px] border-[#E5E7EB] rounded-[12px] p-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#854F0B] shrink-0" />
                      <div>
                        <h4 className="text-[12.5px] font-medium text-slate-900 leading-tight">Low stock check</h4>
                        <p className="text-[11.5px] text-slate-450 mt-0.5 font-normal">
                          Finds medicines that are running low and need to be reordered
                        </p>
                        <span className="text-[10.5px] text-slate-400 mt-1 block font-normal">Runs every morning at 9:00 AM</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleTriggerCron('2')}
                      disabled={triggerLoading === '2'}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EBF2FF] hover:bg-[#D7E6FF] text-[#0F4BBE] text-[11.5px] font-medium rounded-lg shrink-0 transition-colors disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{triggerLoading === '2' ? 'Checking' : 'Run now'}</span>
                    </button>
                  </div>

                  {/* Row 3 {getEmDash()} Patient reminders */}
                  <div className="bg-white border-[0.5px] border-[#E5E7EB] rounded-[12px] p-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#185FA5] shrink-0" />
                      <div>
                        <h4 className="text-[12.5px] font-medium text-slate-900 leading-tight">Patient reminders</h4>
                        <p className="text-[11.5px] text-slate-450 mt-0.5 font-normal">
                          Sends a message to patients reminding them to take their medicines
                        </p>
                        <span className="text-[10.5px] text-slate-400 mt-1 block font-normal">Runs every morning at 10:00 AM</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleTriggerCron('3')}
                      disabled={triggerLoading === '3'}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EBF2FF] hover:bg-[#D7E6FF] text-[#0F4BBE] text-[11.5px] font-medium rounded-lg shrink-0 transition-colors disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{triggerLoading === '3' ? 'Sending' : 'Run now'}</span>
                    </button>
                  </div>

                </div>
              </div>

              {/* Section 2 {getEmDash()} Alerts sent today */}
              <div className="space-y-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                  Alerts sent to you today
                </div>

                <div className="space-y-3">
                  
                  {/* Alert 1 {getEmDash()} Amber (stock warning) */}
                  <div 
                    className="bg-white border border-[#E5E7EB] rounded-[12px] p-3.5 flex gap-3.5"
                    style={{ borderLeft: '4px solid #FAC775' }}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#FAEEDA] flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4.5 h-4.5 text-[#854F0B]" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="text-[12.5px] font-medium text-slate-950">Amoxicillin 250mg is running low</h4>
                        <span className="px-2 py-0.5 bg-[#EAF3DE] text-[#27500A] text-[10.5px] font-medium rounded-full shrink-0">
                          Notified
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-650 leading-relaxed font-normal">
                        Only 5 strips are left. Please reorder soon to avoid running out.
                      </p>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10.5px] font-normal">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Today at 12:42 PM</span>
                      </div>
                    </div>
                  </div>

                  {/* Alert 2 {getEmDash()} Red (expiry warning) */}
                  <div 
                    className="bg-white border border-[#E5E7EB] rounded-[12px] p-3.5 flex gap-3.5"
                    style={{ borderLeft: '4px solid #F09595' }}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#FCEBEB] flex items-center justify-center shrink-0">
                      <CalendarX className="w-4.5 h-4.5 text-[#A32D2D]" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="text-[12.5px] font-medium text-slate-950">Some medicines need attention</h4>
                        <span className="px-2 py-0.5 bg-[#EAF3DE] text-[#27500A] text-[10.5px] font-medium rounded-full shrink-0">
                          Notified
                        </span>
                      </div>
                      <p className="text-[12px] text-slate-650 leading-relaxed font-normal">
                        1 medicine has already expired. 1 more will expire soon. Please check your stock and remove or replace them.
                      </p>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10.5px] font-normal">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Today at 12:42 PM</span>
                      </div>
                    </div>
                  </div>

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

              {/* Profile details update */}
              <div className="bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm space-y-3 transition-colors duration-200">
                <div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#1A56A0] dark:text-sky-400" />
                    <span>Update Account Details</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Edit your public display name.</p>
                </div>

                {profileSuccess && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs rounded-xl">
                    {profileSuccess}
                  </div>
                )}
                {profileError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs rounded-xl">
                    {profileError}
                  </div>
                )}

                <form onSubmit={handleProfileUpdate} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1A56A0] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#1A56A0] hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  >
                    Save Changes
                  </button>
                </form>
              </div>

              {/* Password update */}
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
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder={getBullet().repeat(8)}
                        className="w-full px-3 py-2 pr-10 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1A56A0] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 cursor-pointer"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={getBullet().repeat(8)}
                        className="w-full px-3 py-2 pr-10 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1A56A0] text-slate-700 dark:text-slate-205 bg-white dark:bg-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
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
      {/* ── Bill Confirmed Success Modal ── */}
      {confirmedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1a2438] w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto transition-colors duration-200 space-y-4 text-slate-800 dark:text-slate-200">
            {/* Header */}
            <div className="flex flex-col items-center text-center space-y-2">
              <CheckCircle className="w-12 h-12 text-green-500 animate-bounce" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-2">Payment Done!</h3>
              <p className="text-xs text-slate-550 dark:text-slate-400">
                Bill {confirmedBill.billNumber} confirmed successfully
              </p>
            </div>

            {/* Customer + Payment row */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-450 font-semibold">Customer</span>
                <span className="text-right">
                  <span className="font-bold block text-slate-800 dark:text-slate-200">{confirmedBill.customerName || 'Guest'}</span>
                  <span className="text-slate-500 font-mono block mt-0.5">{confirmedBill.customerPhone || 'N/A'}</span>
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-450 font-semibold">Payment</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{confirmedBill.paymentMethod}</span>
              </div>
              <div className="text-[10px] text-slate-400 text-right mt-1">
                {new Date(confirmedBill.createdAt).toLocaleString('en-IN')}
              </div>
            </div>

            {/* Items list */}
            <div className="space-y-1.5 text-xs">
              <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Items Purchased</p>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-850 rounded-xl overflow-hidden bg-slate-50/20 dark:bg-slate-900/5 max-h-40 overflow-y-auto">
                {confirmedBill.items.map((item, i) => (
                  <div key={i} className="p-2.5 flex justify-between items-center">
                    <span className="font-medium text-slate-850 dark:text-slate-200 truncate pr-2">
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
                onClick={() => {
                  const receiptUrl = `/pharmacist/receipt/${confirmedBill._id}`;
                  window.open(receiptUrl, '_blank');
                }}
                className="flex-1 py-2.5 rounded-xl border border-[#1A56A0] text-[#1A56A0] dark:text-sky-400 dark:border-sky-500 text-xs font-semibold hover:bg-blue-50 dark:hover:bg-sky-900/20 transition-colors"
              >
                🖨 Print Receipt
              </button>
              <button
                onClick={() => {
                  setConfirmedBill(null);
                  setBillItems([]);
                  setDiscount('');
                  setSelectedCustomerId('');
                  setGuestPhone('');
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

export default PharmacistDashboard;
