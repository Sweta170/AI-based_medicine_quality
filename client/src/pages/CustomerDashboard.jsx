import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Activity, ShoppingBag, Bell, FileText, 
  AlertTriangle, IndianRupee, ArrowRight, ShieldCheck, HeartPulse
} from 'lucide-react';



const getRupee = () => String.fromCharCode(Math.random() > 2 ? 0 : 8377);
const CustomerDashboard = () => {
  const { user } = useAuth();

  // Fetch all bills for this customer
  const { data: bills = [], isLoading: billsLoading } = useQuery({
    queryKey: ['bills', user?._id],
    queryFn: async () => {
      const { data } = await api.get(`/bills/customer/${user._id}`);
      return data;
    },
  });

  // Fetch reminders count
  const { data: reminders = [], isLoading: remindersLoading } = useQuery({
    queryKey: ['reminders', user?._id],
    queryFn: async () => {
      const { data } = await api.get(`/notifications/reminders/customer/${user._id}`);
      return data;
    },
  });

  // Calculations
  const activeRemindersCount = reminders.filter((r) => r.isActive).length;

  // Purchases this month
  const totalPurchasesThisMonth = bills.reduce((sum, bill) => {
    const billDate = new Date(bill.createdAt);
    const currentDate = new Date();
    if (
      billDate.getMonth() === currentDate.getMonth() &&
      billDate.getFullYear() === currentDate.getFullYear()
    ) {
      return sum + bill.total;
    }
    return sum;
  }, 0);

  // Expiring soon medicines (unique from past purchases)
  const getExpiringSoonPurchased = () => {
    const uniqueMeds = {};
    bills.forEach((bill) => {
      bill.items.forEach((item) => {
        if (item.expiryStatus === 'CRITICAL' || item.expiryStatus === 'WARNING' || item.expiryStatus === 'CAUTION') {
          uniqueMeds[item.medicineId] = {
            name: item.name,
            expiryStatus: item.expiryStatus,
            qtyPurchased: (uniqueMeds[item.medicineId]?.qtyPurchased || 0) + item.quantity,
          };
        }
      });
    });

    return Object.values(uniqueMeds);
  };

  const expiringMeds = getExpiringSoonPurchased();

  return (
    <div className="space-y-4 p-4 max-w-7xl mx-auto transition-colors duration-200">
      {/* Welcome banner */}
      <div className="bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Welcome Back,</span>
            <span className="text-[#1A56A0] dark:text-sky-400">{user?.name}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-xl">
            This is your Pharmadesk patient dashboard. Here you can monitor your prescription billing, check medication alerts, and toggle SMS reminders.
          </p>
        </div>
        <Link
          to="/customer/shop"
          className="px-3 py-1.5 bg-[#1A56A0] hover:bg-[#1A56A0]/95 text-white font-semibold rounded-lg shadow-sm transition-all text-xs w-max flex items-center gap-1.5"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Browse Medicine Shop</span>
        </Link>
      </div>

      {/* Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm relative overflow-hidden transition-colors duration-200">
          <div className="absolute top-4 right-4 w-7 h-7 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 dark:text-emerald-400">
            <IndianRupee className="w-4 h-4" />
          </div>
          <p className="text-slate-400 dark:text-slate-550 text-[10px] font-bold uppercase tracking-wider">Purchases This Month</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {billsLoading ? '...' : `${getRupee()}${totalPurchasesThisMonth.toFixed(2)}`}
          </p>
          <div className="mt-3 text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
            <span>Total orders: </span>
            <span className="text-[#1A56A0] dark:text-sky-400 font-bold">{bills.length}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm relative overflow-hidden transition-colors duration-200">
          <div className="absolute top-4 right-4 w-7 h-7 bg-brand/10 rounded-lg flex items-center justify-center text-[#1A56A0] dark:text-sky-400">
            <Bell className="w-4 h-4" />
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">SMS Reminders</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {remindersLoading ? '...' : activeRemindersCount}
          </p>
          <div className="mt-3 text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <span className="text-emerald-500 dark:text-emerald-400 font-semibold">Enabled</span> alerts active daily
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm relative overflow-hidden transition-colors duration-200">
          <div className="absolute top-4 right-4 w-7 h-7 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500 dark:text-amber-400">
            <HeartPulse className="w-4 h-4" />
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Expiring Stock Items</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {billsLoading ? '...' : expiringMeds.length}
          </p>
          <div className="mt-3 text-[10px] text-slate-400 dark:text-slate-500">Medicines requiring attention</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Expiring Soon Items (Highlighted Orange) */}
        <div className="bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm space-y-3 transition-colors duration-200">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400 animate-bounce" />
            <span>Medication Expiry Advisories</span>
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-sans">
            The following medicines from your purchase history are approaching expiration. Do not ingest past the expiration date.
          </p>

          {billsLoading ? (
            <div className="py-8 flex justify-center">
              <div className="w-6 h-6 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
            </div>
          ) : expiringMeds.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 dark:bg-slate-900/10 rounded-xl border border-slate-200 dark:border-slate-700/30 text-slate-500 text-xs font-medium">
              No expiring medicines in your prescription record.
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {expiringMeds.map((med, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-orange-500/5 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl flex justify-between items-center gap-3"
                >
                  <div>
                    <h4 className="font-bold text-orange-600 dark:text-orange-400 text-xs">{med.name}</h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                      Status: <span className="font-semibold text-slate-600 dark:text-slate-300">{med.expiryStatus}</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Total Qty Purchased</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{med.qtyPurchased} units</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shortcuts / Quick Actions */}
        <div className="bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm space-y-3 transition-colors duration-200">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#1A56A0] dark:text-sky-400" />
            <span>Dashboard Shortcuts</span>
          </h2>

          <div className="space-y-2.5">
            <Link
              to="/customer/reminders"
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/60 dark:border-slate-700/30 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-brand/10 flex items-center justify-center text-[#1A56A0] dark:text-sky-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-semibold text-xs text-slate-900 dark:text-white">Medication Reminders</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Configure daily SMS alarms</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-800 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to="/customer/bills"
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/60 dark:border-slate-700/30 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-semibold text-xs text-slate-900 dark:text-white">Invoice History</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Manage, view details, and download PDF receipts</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-800 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to="/customer/profile"
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200/60 dark:border-slate-700/30 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 dark:text-purple-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-semibold text-xs text-slate-900 dark:text-white">My Portal Profile</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">View personal detail metadata</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-800 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
