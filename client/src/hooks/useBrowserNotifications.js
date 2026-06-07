import { useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

/**
 * Parse a time string like "04:30 PM" to an object containing 24-hour hour and minute.
 */
const parseTime = (timeStr) => {
  if (!timeStr) return { hour: 10, minute: 0 };
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return { hour: 10, minute: 0 };

  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'AM' && hour === 12) hour = 0;
  else if (period === 'PM' && hour !== 12) hour += 12;

  return { hour, minute };
};

/**
 * Custom hook that checks active reminders every 60s and fires browser
 * notifications when the current hour matches a reminder's scheduled time.
 * Also logs each browser notification to the backend for the Dispatch Log.
 */
const useBrowserNotifications = () => {
  const { user } = useAuth();
  const firedRef = useRef(new Set()); // Track which reminders fired this hour

  // Fetch active reminders
  const { data: reminders = [] } = useQuery({
    queryKey: ['reminders', user?._id],
    queryFn: async () => {
      const { data } = await api.get(`/notifications/reminders/customer/${user._id}`);
      return data;
    },
    enabled: !!user?._id,
    staleTime: 60000, // Re-fetch at most once per minute
  });

  // Log a browser notification to the backend
  const logToBackend = useCallback(async (medicineName) => {
    try {
      await api.post('/notifications/browser-log', { medicineName });
    } catch (err) {
      console.error('[BrowserNotif] Failed to log:', err.message);
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    const result = await Notification.requestPermission();
    return result;
  }, []);

  useEffect(() => {
    if (!user?._id) return;
    if (!('Notification' in window)) return;

    const checkReminders = () => {
      if (Notification.permission !== 'granted') return;

      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Reset fired set when the hour/minute changes
      const minuteKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${currentHour}-${currentMinute}`;
      
      // Clean old keys from the set (from previous minutes/hours)
      for (const key of firedRef.current) {
        if (!key.startsWith(minuteKey)) {
          firedRef.current.delete(key);
        }
      }

      const activeReminders = reminders.filter((r) => r.isActive);

      for (const reminder of activeReminders) {
        const { hour: reminderHour, minute: reminderMinute } = parseTime(reminder.time);
        const fireKey = `${minuteKey}-${reminder._id}`;

        if (reminderHour === currentHour && reminderMinute === currentMinute && !firedRef.current.has(fireKey)) {
          firedRef.current.add(fireKey);

          // Show browser notification
          try {
            const notif = new Notification('💊 Pharmadesk Reminder', {
              body: `Time to take your ${reminder.medicineName}. Keep healthy!`,
              icon: '/favicon.ico',
              tag: `reminder-${reminder._id}`,
              requireInteraction: true,
            });

            notif.onclick = () => {
              window.focus();
              notif.close();
            };

            // Auto-close after 30 seconds
            setTimeout(() => notif.close(), 30000);
          } catch (err) {
            console.error('[BrowserNotif] Failed to show notification:', err);
          }

          // Log to backend dispatch log
          logToBackend(reminder.medicineName);
        }
      }
    };

    // Run immediately on mount
    checkReminders();

    // Check every 60 seconds
    const interval = setInterval(checkReminders, 60 * 1000);

    return () => clearInterval(interval);
  }, [user?._id, reminders, logToBackend]);

  return { requestPermission };
};

export default useBrowserNotifications;
