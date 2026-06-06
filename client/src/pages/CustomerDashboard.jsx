import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Activity, ShoppingBag, Bell, FileText, Calendar, 
  AlertTriangle, DollarSign, ArrowRight, ShieldCheck, HeartPulse
} from 'lucide-react';

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ninetyDaysFromNow = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);

    const uniqueMeds = {};
    bills.forEach((bill) => {
      bill.items.forEach((item) => {
        // Look for medicines that are expiring soon based on their static status or date
        // Since we store status in item:
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
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Welcome banner */}
      <div className="glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl -z-10"></div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Welcome Back,</span>
            <span className="text-brand-400">{user?.name}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            This is your Aegis patient dashboard. Here you can monitor your prescription billing, check medication alerts, and toggle SMS reminders.
          </p>
        </div>
        <Link
          to="/customer/shop"
          className="px-6 py-3 bg-brand-500 hover:bg-brand-400 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/10 hover:shadow-brand-500/25 transition-all text-sm w-max flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Browse Medicine Shop</span>
        </Link>
      </div>

      {/* Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-4 right-4 w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Purchases This Month</p>
          <p className="text-3xl font-bold text-white mt-2">
            {billsLoading ? '...' : `$${totalPurchasesThisMonth.toFixed(2)}`}
          </p>
          <div className="mt-4 text-xs text-slate-400 flex items-center gap-1.5">
            <span className="text-slate-300">Total orders: </span>
            <span className="text-brand-400 font-bold">{bills.length}</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-4 right-4 w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-400">
            <Bell className="w-6 h-6" />
          </div>
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">SMS Reminders</p>
          <p className="text-3xl font-bold text-white mt-2">
            {remindersLoading ? '...' : activeRemindersCount}
          </p>
          <div className="mt-4 text-xs text-slate-400 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">Enabled</span> alerts active daily
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-4 right-4 w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400">
            <HeartPulse className="w-6 h-6" />
          </div>
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Expiring Stock Items</p>
          <p className="text-3xl font-bold text-white mt-2">
            {billsLoading ? '...' : expiringMeds.length}
          </p>
          <div className="mt-4 text-xs text-slate-400">Medicines requiring attention</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Expiring Soon Items (Highlighted Orange) */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400 animate-bounce" />
            <span>Medication Expiry Advisories</span>
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            The following medicines from your purchase history are approaching expiration. Do not ingest past the expiration date.
          </p>

          {billsLoading ? (
            <div className="py-8 flex justify-center">
              <div className="w-8 h-8 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
            </div>
          ) : expiringMeds.length === 0 ? (
            <div className="py-8 text-center bg-white/[0.01] rounded-2xl border border-white/5 text-slate-500 text-sm font-medium">
              No expiring medicines in your prescription record.
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {expiringMeds.map((med, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex justify-between items-center gap-4"
                >
                  <div>
                    <h4 className="font-bold text-orange-400 text-sm">{med.name}</h4>
                    <span className="text-xs text-slate-400 mt-1 block">
                      Status: <span className="font-semibold text-slate-300">{med.expiryStatus}</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Total Qty Purchased</span>
                    <span className="text-sm font-bold text-slate-200">{med.qtyPurchased} units</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shortcuts / Quick Actions */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-400" />
            <span>Dashboard Shortcuts</span>
          </h2>

          <div className="space-y-3">
            <Link
              to="/customer/reminders"
              className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-semibold text-sm text-white">Medication Reminders</span>
                  <span className="text-xs text-slate-400">Configure daily SMS alarms</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/customer/bills"
              className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-semibold text-sm text-white">Invoice History</span>
                  <span className="text-xs text-slate-400">Manage, view details, and download PDF receipts</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              to="/customer/profile"
              className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-semibold text-sm text-white">My Portal Profile</span>
                  <span className="text-xs text-slate-400">View personal detail metadata</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
