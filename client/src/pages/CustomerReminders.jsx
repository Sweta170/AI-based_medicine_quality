import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, Phone, Clock, Plus, Trash2, AlertCircle, History, RefreshCw, Pill
} from 'lucide-react';

const CustomerReminders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Form states
  const [medicineName, setMedicineName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [time, setTime] = useState('10:00 AM');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Fetch reminders
  const { data: reminders = [], isLoading: remindersLoading } = useQuery({
    queryKey: ['reminders', user?._id],
    queryFn: async () => {
      const { data } = await api.get(`/notifications/reminders/customer/${user._id}`);
      return data;
    },
  });

  // Fetch notification log history
  const { data: logs = [], isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['notificationLogs', user?._id],
    queryFn: async () => {
      const { data } = await api.get(`/notifications/${user._id}`);
      return data;
    },
  });

  // Create Reminder Mutation
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post('/notifications/reminders', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reminders', user?._id]);
      setMedicineName('');
      setPhoneNumber('');
      setFormSuccess('Reminder alarm successfully added!');
      setTimeout(() => setFormSuccess(''), 3000);
    },
    onError: (err) => {
      setFormError(err.response?.data?.message || 'Failed to register reminder');
      setTimeout(() => setFormError(''), 3000);
    }
  });

  // Update Reminder Mutation (toggling or scheduling)
  const updateMutation = useMutation({
    mutationFn: async ({ reminderId, isActive, time }) => {
      const { data } = await api.put(`/customers/${user._id}/reminders`, {
        reminderId,
        isActive,
        time,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reminders', user?._id]);
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to update reminder settings');
    }
  });

  // Delete Reminder Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/notifications/reminders/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reminders', user?._id]);
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to delete reminder');
    }
  });

  const handleCreateReminder = (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!medicineName || !phoneNumber) {
      setFormError('Required fields missing.');
      return;
    }

    createMutation.mutate({
      medicineName,
      phoneNumber,
      time,
    });
  };

  const handleToggleActive = (reminder) => {
    updateMutation.mutate({
      reminderId: reminder._id,
      isActive: !reminder.isActive,
      time: reminder.time,
    });
  };

  const handleTimeChange = (reminder, newTime) => {
    updateMutation.mutate({
      reminderId: reminder._id,
      isActive: reminder.isActive,
      time: newTime,
    });
  };

  const handleDeleteReminder = (id) => {
    if (window.confirm('Delete this reminder? You will no longer receive daily SMS alerts.')) {
      deleteMutation.mutate(id);
    }
  };

  const timeOptions = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', 
    '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', 
    '08:00 PM', '10:00 PM'
  ];

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Medication Reminders</h1>
        <p className="text-slate-400 text-sm mt-1 font-sans">
          Configure daily SMS medication schedules, toggle alerts, and examine alert delivery histories.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form panel */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 h-max">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-3">
            <Bell className="w-5 h-5 text-brand-400" />
            <span>Create Alarm Schedule</span>
          </h2>

          {formSuccess && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl">
              {formSuccess}
            </div>
          )}
          {formError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-start gap-1">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleCreateReminder} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Medicine Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Pill className="w-4 h-4 hidden" />
                </div>
                <input
                  type="text"
                  required
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  placeholder="e.g. Lipitor 20mg"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                SMS Mobile Number *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +15550192834"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Notification Schedule
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-darkbg-950 border border-white/10 text-white text-sm focus:outline-none focus:border-brand-500"
              >
                {timeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-1.5"
            >
              {createMutation.isPending ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>Create Alert Alarm</span>
            </button>
          </form>
        </div>

        {/* Reminders List & History logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active reminders list */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-brand-400" />
              <span>Medication Alarm Panel</span>
            </h3>

            {remindersLoading ? (
              <div className="py-8 flex justify-center">
                <div className="w-8 h-8 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
              </div>
            ) : reminders.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center font-medium">No SMS timers configured. Create one using the side card.</p>
            ) : (
              <div className="divide-y divide-white/5 space-y-3 max-h-72 overflow-y-auto pr-2">
                {reminders.map((reminder) => (
                  <div key={reminder._id} className="flex flex-col sm:flex-row justify-between sm:items-center py-4 gap-4">
                    <div className="flex-1">
                      <div className="font-semibold text-white text-base">{reminder.medicineName}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>{reminder.phoneNumber}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Time Selector */}
                      <select
                        value={reminder.time}
                        onChange={(e) => handleTimeChange(reminder, e.target.value)}
                        disabled={updateMutation.isPending && updateMutation.variables?.reminderId === reminder._id}
                        className="bg-slate-900 border border-white/15 text-xs rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-brand-500 disabled:opacity-50"
                      >
                        {timeOptions.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>

                      {/* Toggle switch (isActive) */}
                      <button
                        onClick={() => handleToggleActive(reminder)}
                        disabled={updateMutation.isPending && updateMutation.variables?.reminderId === reminder._id}
                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 disabled:opacity-50 ${
                          reminder.isActive ? 'bg-brand-500 justify-end' : 'bg-slate-800 justify-start'
                        }`}
                      >
                        <span className="w-4 h-4 bg-white rounded-full shadow-md"></span>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteReminder(reminder._id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20"
                        title="Delete reminder alarm"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delivery logs */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-4.5 h-4.5 text-brand-400" />
                <span>Medication Alert Dispatch Log</span>
              </h3>
              <button
                onClick={() => refetchLogs()}
                disabled={logsLoading}
                className="p-1.5 bg-white/5 text-slate-400 hover:text-white rounded-lg border border-white/5 hover:border-white/10"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {logsLoading ? (
              <div className="py-8 flex justify-center">
                <div className="w-8 h-8 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
              </div>
            ) : logs.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center font-medium">No alerts generated for your account yet.</p>
            ) : (
              <div className="divide-y divide-white/5 max-h-60 overflow-y-auto pr-2 space-y-1">
                {logs.map((log) => (
                  <div key={log._id} className="py-3 flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white/5 border border-slate-700/50 text-slate-300">
                        {log.type}
                      </span>
                      <p className="text-sm text-slate-300 mt-2 leading-relaxed">{log.message}</p>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        {new Date(log.sentAt).toLocaleString()}
                      </span>
                    </div>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
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
    </div>
  );
};

export default CustomerReminders;
