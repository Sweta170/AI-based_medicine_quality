import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import useBrowserNotifications from '../hooks/useBrowserNotifications';
import { 
  Bell, Phone, Clock, Plus, Trash2, AlertCircle, History, RefreshCw, Pill,
  BellRing, Mail, Globe, MessageSquare
} from 'lucide-react';

const convertTo12Hour = (time24) => {
  if (!time24) return '10:00 AM';
  const [hourStr, minStr] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = minStr;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  
  hour = hour % 12;
  hour = hour ? hour : 12;
  const displayHour = hour < 10 ? `0${hour}` : hour;
  
  return `${displayHour}:${minute} ${ampm}`;
};

const convertTo24Hour = (time12) => {
  if (!time12) return '10:00';
  const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return '10:00';
  
  let hour = parseInt(match[1], 10);
  const minute = match[2];
  const period = match[3].toUpperCase();
  
  if (period === 'AM' && hour === 12) hour = 0;
  else if (period === 'PM' && hour !== 12) hour += 12;
  
  const displayHour = hour < 10 ? `0${hour}` : hour;
  return `${displayHour}:${minute}`;
};

const CustomerReminders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { requestPermission } = useBrowserNotifications();

  // Browser notification permission state
  const [notifPermission, setNotifPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'unsupported'
  );

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

  // Fetch real medicines catalog for select dropdown
  const { data: medicines = [] } = useQuery({
    queryKey: ['medicinesList'],
    queryFn: async () => {
      const { data } = await api.get('/medicines');
      return data;
    },
  });

  // Fetch user profile to get real phone number
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', user?._id],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data;
    },
    enabled: !!user?._id,
  });

  // Auto-fill SMS mobile number once customer profile or user context phone loads
  useEffect(() => {
    const defaultPhone = userProfile?.phone || user?.phone;
    if (defaultPhone) {
      setPhoneNumber(defaultPhone);
    }
  }, [userProfile?.phone, user?.phone]);

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
    if (window.confirm('Delete this reminder? You will no longer receive alerts.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEnableNotifications = async () => {
    const result = await requestPermission();
    setNotifPermission(result);
  };

  const timeOptions = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', 
    '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', 
    '08:00 PM', '10:00 PM'
  ];

  // Dispatch log type badge styling
  const getTypeBadge = (type) => {
    switch (type) {
      case 'Email':
        return {
          icon: Mail,
          className: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
        };
      case 'Browser':
        return {
          icon: Globe,
          className: 'bg-violet-500/10 border-violet-500/20 text-violet-600 dark:text-violet-400',
        };
      case 'SMS':
        return {
          icon: MessageSquare,
          className: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700/50 text-slate-500 dark:text-slate-400',
        };
      default:
        return {
          icon: Bell,
          className: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-300',
        };
    }
  };

  return (
    <div className="space-y-4 p-4 max-w-7xl mx-auto transition-colors duration-200">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Medication Reminders</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
          Configure medication schedules, toggle alerts, and examine alert delivery histories.
        </p>
      </div>

      {/* Browser Notification Permission Banner */}
      {notifPermission !== 'granted' && notifPermission !== 'unsupported' && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700/40 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-800/40 flex items-center justify-center shrink-0">
              <BellRing className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Enable Browser Notifications</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {notifPermission === 'denied'
                  ? 'Notifications are blocked. Please enable them in your browser settings.'
                  : 'Get real-time medicine reminders even when you\'re on another tab.'}
              </p>
            </div>
          </div>
          {notifPermission !== 'denied' && (
            <button
              onClick={handleEnableNotifications}
              className="px-4 py-2 bg-[#1A56A0] hover:bg-[#1A56A0]/90 text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
            >
              Enable Now
            </button>
          )}
        </div>
      )}

      {/* Notification channels info */}
      <div className="flex flex-wrap items-center gap-3 text-[10.5px]">
        <span className="text-slate-400 dark:text-slate-500 font-medium">Active Channels:</span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700/30 font-semibold">
          <Mail className="w-3 h-3" /> Email
        </span>
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full font-semibold ${
          notifPermission === 'granted'
            ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-700/30'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
        }`}>
          <Globe className="w-3 h-3" />
          Browser {notifPermission === 'granted' ? '✓' : '(off)'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Form panel */}
        <div className="bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm h-max transition-colors duration-200">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-150 dark:border-slate-700/50 pb-2">
            <Bell className="w-4 h-4 text-[#1A56A0] dark:text-sky-400" />
            <span>Create Alarm Schedule</span>
          </h2>

          {formSuccess && (
            <div className="mb-3 p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-650 dark:text-emerald-400 text-xs rounded-lg">
              {formSuccess}
            </div>
          )}
          {formError && (
            <div className="mb-3 p-2.5 bg-red-500/10 border border-red-500/20 text-red-650 dark:text-red-400 text-xs rounded-lg flex items-start gap-1">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleCreateReminder} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Medicine Name *
              </label>
              <div className="relative">
                <select
                  required
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0C1628] border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white focus:outline-none focus:border-[#1A56A0] dark:focus:border-sky-400 text-xs transition-colors duration-200"
                >
                  <option value="">Select a medicine...</option>
                  {medicines.length === 0 ? (
                    <option value="" disabled>No medicines in catalog</option>
                  ) : (
                    medicines.map((med) => (
                      <option key={med._id} value={med.name}>
                        {med.name} ({med.genericName})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Mobile Number *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +919876543210"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0C1628] border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#1A56A0] dark:focus:border-sky-400 text-xs transition-colors duration-200"
                />
                {!userProfile?.phone && (
                  <p className="text-[10px] text-amber-600 mt-1.5 leading-normal">
                    Tip: Add your number in <Link to="/customer/profile" className="underline font-semibold text-[#1A56A0] dark:text-sky-400">My Profile</Link> to auto-fill this field.
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Notification Schedule
              </label>
              <input
                type="time"
                required
                value={convertTo24Hour(time)}
                onChange={(e) => setTime(convertTo12Hour(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0C1628] border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#1A56A0] dark:focus:border-sky-400 transition-colors duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full py-2 bg-[#1A56A0] hover:bg-[#1A56A0]/95 text-white font-semibold rounded-lg shadow-sm transition-all text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              <span>Create Alert Alarm</span>
            </button>
          </form>
        </div>

        {/* Reminders List & History logs */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active reminders list */}
          <div className="bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm transition-colors duration-200">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1A56A0] dark:text-sky-400" />
              <span>Medication Alarm Panel</span>
            </h3>

            {remindersLoading ? (
              <div className="py-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-slate-200 dark:border-slate-700 border-t-[#1A56A0] rounded-full animate-spin"></div>
              </div>
            ) : reminders.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center font-medium">No timers configured. Create one using the side card.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700/50 max-h-72 overflow-y-auto pr-2">
                {reminders.map((reminder) => (
                  <div key={reminder._id} className="flex flex-col sm:flex-row justify-between sm:items-center py-2.5 gap-2.5">
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 dark:text-white text-xs">{reminder.medicineName}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{reminder.phoneNumber}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Time Selector */}
                      <input
                        type="time"
                        value={convertTo24Hour(reminder.time)}
                        onChange={(e) => handleTimeChange(reminder, convertTo12Hour(e.target.value))}
                        disabled={updateMutation.isPending && updateMutation.variables?.reminderId === reminder._id}
                        className="bg-slate-50 dark:bg-[#0C1628] border border-slate-200 dark:border-slate-700/60 text-[11px] rounded-lg px-2 py-1 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-[#1A56A0] dark:focus:border-sky-400 disabled:opacity-50 transition-colors duration-200"
                      />

                      {/* Toggle switch (isActive) */}
                      <button
                        onClick={() => handleToggleActive(reminder)}
                        disabled={updateMutation.isPending && updateMutation.variables?.reminderId === reminder._id}
                        className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-all duration-300 disabled:opacity-50 ${
                          reminder.isActive ? 'bg-[#1A56A0] dark:bg-sky-500 justify-end' : 'bg-slate-200 dark:bg-slate-800 justify-start'
                        }`}
                      >
                        <span className="w-4 h-4 bg-white rounded-full shadow-sm"></span>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteReminder(reminder._id)}
                        className="p-1 text-slate-400 hover:text-red-650 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-200 dark:hover:border-red-500/20"
                        title="Delete reminder alarm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delivery logs */}
          <div className="bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm transition-colors duration-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-[#1A56A0] dark:text-sky-400" />
                <span>Medication Alert Dispatch Log</span>
              </h3>
              <button
                onClick={() => refetchLogs()}
                disabled={logsLoading}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-[#0C1628] dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg border border-slate-250 dark:border-slate-700/60 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            {logsLoading ? (
              <div className="py-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-slate-200 dark:border-slate-700 border-t-[#1A56A0] rounded-full animate-spin"></div>
              </div>
            ) : logs.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center font-medium">No alerts generated for your account yet.</p>
            ) : (
              <div className="divide-y divide-slate-150 dark:divide-slate-700/50 max-h-60 overflow-y-auto pr-2">
                {logs.map((log) => {
                  const badge = getTypeBadge(log.type);
                  const TypeIcon = badge.icon;
                  return (
                    <div key={log._id} className="py-2.5 flex justify-between items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${badge.className}`}>
                          <TypeIcon className="w-2.5 h-2.5" />
                          {log.type}
                        </span>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">{log.message}</p>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-0.5">
                          {new Date(log.sentAt).toLocaleString()}
                        </span>
                      </div>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                        log.status === 'sent'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-650 dark:text-red-400 border border-red-500/20'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerReminders;
