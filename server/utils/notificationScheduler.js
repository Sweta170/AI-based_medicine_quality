import cron from 'node-cron';
import nodemailer from 'nodemailer';
import Medicine from '../models/Medicine.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Reminder from '../models/Reminder.js';
import { checkExpiryStatus } from './expiryCheck.js';

// Setup Nodemailer email transporter
const getEmailTransporter = () => {
  const isSmtpConfigured =
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

  if (isSmtpConfigured) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Ethereal fake SMTP fallback
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'mock_user',
        pass: 'mock_pass',
      },
    });
  }
};

// --- CRON JOB 1: Daily Expiry Report at 8:00 AM ---
export const runExpiryReport = async () => {
  console.log('Running daily medicine expiry check...');
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const msInDay = 24 * 60 * 60 * 1000;
    const ninetyDaysFromNow = new Date(today.getTime() + 90 * msInDay);

    // Find medicines expiring within 90 days (not yet expired)
    const medicines = await Medicine.find({
      expiryDate: { $gte: today, $lte: ninetyDaysFromNow },
    });

    if (medicines.length === 0) {
      console.log('No medicines expiring within 90 days.');
      return { status: 'success', message: 'No expiring medicines found' };
    }

    // Group by status
    const grouped = {
      CRITICAL: [],
      WARNING: [],
      CAUTION: [],
    };

    medicines.forEach((med) => {
      const status = checkExpiryStatus(med.expiryDate);
      const diffTime = new Date(med.expiryDate).getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / msInDay);
      const item = { med, diffDays };

      if (status === 'CRITICAL') grouped.CRITICAL.push(item);
      else if (status === 'WARNING') grouped.WARNING.push(item);
      else if (status === 'CAUTION') grouped.CAUTION.push(item);
    });

    // Find all pharmacists
    const pharmacists = await User.find({ role: 'pharmacist' });
    if (pharmacists.length === 0) {
      console.log('No pharmacists registered to receive expiry report.');
      return { status: 'success', message: 'No pharmacists found' };
    }

    // Build HTML table content
    let htmlContent = `
      <h2 style="color: #0f172a; font-family: sans-serif;">Pharmadesk Expiry Warning Report</h2>
      <p style="color: #475569; font-family: sans-serif;">The following medicines are expiring within 90 days. Please review stocks.</p>
    `;

    const addGroupTable = (title, items, color) => {
      if (items.length === 0) return '';
      let tableHtml = `
        <h3 style="color: ${color}; font-family: sans-serif; margin-top: 20px;">${title} (${items.length} items)</h3>
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; font-family: sans-serif; width: 100%; text-align: left; border-color: #cbd5e1;">
          <tr style="background-color: #f8fafc; color: #334155;">
            <th>Medicine Name</th>
            <th>Batch No</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Expiry Date</th>
            <th>Days Remaining</th>
          </tr>
      `;

      items.forEach(({ med, diffDays }) => {
        tableHtml += `
          <tr>
            <td><strong>${med.name}</strong><br><span style="font-size: 11px; color: #64748b;">${med.genericName}</span></td>
            <td><code>${med.batchNumber}</code></td>
            <td>${med.category}</td>
            <td>${med.quantity}</td>
            <td>${new Date(med.expiryDate).toLocaleDateString()}</td>
            <td style="color: ${color}; font-weight: bold;">${diffDays} days</td>
          </tr>
        `;
      });

      tableHtml += `</table>`;
      return tableHtml;
    };

    htmlContent += addGroupTable('CRITICAL (Expiring &le; 30 Days)', grouped.CRITICAL, '#ef4444');
    htmlContent += addGroupTable('WARNING (Expiring &le; 60 Days)', grouped.WARNING, '#f97316');
    htmlContent += addGroupTable('CAUTION (Expiring &le; 90 Days)', grouped.CAUTION, '#eab308');

    htmlContent += `
      <p style="font-size: 11px; color: #64748b; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
        Pharmadesk Medicine System - Scheduled Automation Report
      </p>
    `;

    const medSummary = medicines.map((m) => {
      const status = checkExpiryStatus(m.expiryDate);
      const diffTime = new Date(m.expiryDate).getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / msInDay);
      return `- ${m.name} (Batch: ${m.batchNumber}) [${status}]: ${diffDays} days remaining.`;
    }).join('\n');

    const detailedMessage = `Daily Expiry Report:\n${medSummary}`;

    const transporter = getEmailTransporter();

    // Send emails to all pharmacists
    for (const pharmacist of pharmacists) {
      try {
        const isEthereal = transporter.options.host === 'smtp.ethereal.email';
        
        const mailOptions = {
          from: `"Pharmadesk Notifications" <${process.env.SMTP_USER || 'no-reply@pharmadesk.com'}>`,
          to: pharmacist.email,
          subject: '⚠️ Daily Expiry Report - Pharmadesk Pharmacy',
          html: htmlContent,
        };

        if (isEthereal) {
          console.log(`[MOCK EMAIL] Sent to ${pharmacist.email}: Expiry Report`);
        } else {
          await transporter.sendMail(mailOptions);
        }

        // Log Notification in DB
        await Notification.create({
          recipientId: pharmacist._id,
          type: 'Email',
          message: detailedMessage,
          status: 'sent',
        });
      } catch (err) {
        console.error(`Failed sending expiry report to ${pharmacist.email}:`, err.message);
        await Notification.create({
          recipientId: pharmacist._id,
          type: 'Email',
          message: `Daily Expiry Report failed: ${err.message}`,
          status: 'failed',
        });
      }
    }

    return { status: 'success', message: 'Expiry reports processed' };
  } catch (error) {
    console.error('Error running expiry report cron:', error);
    return { status: 'error', error: error.message };
  }
};

// --- CRON JOB 2: Daily Low Stock Alert at 9:00 AM ---
export const runLowStockReport = async () => {
  console.log('Running daily low stock check...');
  try {
    // Find medicines where quantity is below or equal to reorderLevel
    const medicines = await Medicine.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] },
    });

    if (medicines.length === 0) {
      console.log('No low stock medicines.');
      return { status: 'success', message: 'No low stock medicines found' };
    }

    // Find all pharmacists
    const pharmacists = await User.find({ role: 'pharmacist' });
    if (pharmacists.length === 0) {
      console.log('No pharmacists found.');
      return { status: 'success', message: 'No pharmacists found' };
    }

    // Build low stock HTML report
    let htmlContent = `
      <h2 style="color: #0f172a; font-family: sans-serif;">Pharmadesk Low Stock Alert</h2>
      <p style="color: #475569; font-family: sans-serif;">The following medicines have fallen below their configured reorder thresholds:</p>
      <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; font-family: sans-serif; width: 100%; text-align: left; border-color: #cbd5e1;">
        <tr style="background-color: #f8fafc; color: #334155;">
          <th>Medicine Name</th>
          <th>Batch Number</th>
          <th>Category</th>
          <th>Available Stock</th>
          <th>Reorder Level</th>
          <th>Status</th>
        </tr>
    `;

    medicines.forEach((med) => {
      const isDepleted = med.quantity === 0;
      htmlContent += `
        <tr>
          <td><strong>${med.name}</strong><br><span style="font-size: 11px; color: #64748b;">${med.genericName}</span></td>
          <td><code>${med.batchNumber}</code></td>
          <td>${med.category}</td>
          <td style="color: ${isDepleted ? '#ef4444' : '#f59e0b'}; font-weight: bold;">${med.quantity} units</td>
          <td>${med.reorderLevel} units</td>
          <td style="color: ${isDepleted ? '#ef4444' : '#f59e0b'}; font-weight: bold;">
            ${isDepleted ? 'DEPLETED' : 'LOW STOCK'}
          </td>
        </tr>
      `;
    });

    htmlContent += `
      </table>
      <p style="font-size: 11px; color: #64748b; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 10px;">
        Pharmadesk Medicine System - Stock Alert Notification
      </p>
    `;

    const stockSummary = medicines.map((m) => {
      const isDepleted = m.quantity === 0;
      const statusStr = isDepleted ? 'DEPLETED' : 'LOW STOCK';
      return `- ${m.name} (Batch: ${m.batchNumber}): ${m.quantity} units left (Reorder: ${m.reorderLevel}) [${statusStr}]`;
    }).join('\n');

    const detailedMessage = `Low Stock Alert:\n${stockSummary}`;

    const transporter = getEmailTransporter();

    // Send emails
    for (const pharmacist of pharmacists) {
      try {
        const isEthereal = transporter.options.host === 'smtp.ethereal.email';
        const mailOptions = {
          from: `"Pharmadesk Notifications" <${process.env.SMTP_USER || 'no-reply@pharmadesk.com'}>`,
          to: pharmacist.email,
          subject: '⚠️ Stock Replenishment Alert - Pharmadesk Pharmacy',
          html: htmlContent,
        };

        if (isEthereal) {
          console.log(`[MOCK EMAIL] Sent to ${pharmacist.email}: Low Stock Report`);
        } else {
          await transporter.sendMail(mailOptions);
        }

        await Notification.create({
          recipientId: pharmacist._id,
          type: 'Email',
          message: detailedMessage,
          status: 'sent',
        });
      } catch (err) {
        console.error(`Failed sending low stock report to ${pharmacist.email}:`, err.message);
        await Notification.create({
          recipientId: pharmacist._id,
          type: 'Email',
          message: `Low Stock Alert failed: ${err.message}`,
          status: 'failed',
        });
      }
    }

    return { status: 'success', message: 'Low stock alerts processed' };
  } catch (error) {
    console.error('Error running low stock report cron:', error);
    return { status: 'error', error: error.message };
  }
};

// --- Helper: Convert reminder time string ("04:30 PM") to 24h hour and minute numbers ---
const parseReminderTime = (timeStr) => {
  if (!timeStr) return { hour: 10, minute: 0 }; // fallback to 10:00 AM
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return { hour: 10, minute: 0 };

  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'AM' && hour === 12) hour = 0;
  else if (period === 'PM' && hour !== 12) hour += 12;

  return { hour, minute };
};

// --- Build styled medication reminder email HTML ---
const buildReminderEmailHtml = (medicineName, customerName) => {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px;">
      <div style="background: #ffffff; border-radius: 10px; padding: 28px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="display: inline-block; background: #0F4BBE; color: white; font-weight: bold; font-size: 14px; padding: 8px 14px; border-radius: 8px; letter-spacing: 1px;">
            💊 Rx
          </div>
          <h2 style="color: #0f172a; margin: 12px 0 4px; font-size: 18px;">Medication Reminder</h2>
          <p style="color: #64748b; font-size: 13px; margin: 0;">Pharmadesk Health Alert</p>
        </div>
        
        <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0;">
          <p style="color: #1e40af; font-size: 14px; margin: 0 0 4px; font-weight: 600;">
            Time to take your medicine
          </p>
          <p style="color: #1e3a5f; font-size: 20px; font-weight: bold; margin: 0;">
            ${medicineName}
          </p>
        </div>

        <p style="color: #475569; font-size: 13px; line-height: 1.6; margin: 16px 0 0;">
          Hi <strong>${customerName}</strong>, this is your scheduled medication reminder from Pharmadesk.
          Please take your prescribed dose of <strong>${medicineName}</strong> as directed by your doctor.
        </p>

        <p style="color: #94a3b8; font-size: 11px; margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; text-align: center;">
          Pharmadesk Medicine System — Automated Health Reminder
        </p>
      </div>
    </div>
  `;
};

// --- CRON JOB 3: Hourly Customer Email Reminders (time-matched) ---
export const runEmailReminders = async () => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  console.log(`[Reminder Cron] Running email reminder check (time: ${currentHour}:${currentMinute})...`);

  try {
    const reminders = await Reminder.find({ isActive: true }).populate('customerId');

    if (reminders.length === 0) {
      console.log('[Reminder Cron] No active medication reminders.');
      return { status: 'success', message: 'No active reminders found' };
    }

    // Filter reminders whose scheduled hour and minute match the current time
    const dueReminders = reminders.filter((r) => {
      const { hour: reminderHour, minute: reminderMinute } = parseReminderTime(r.time);
      return reminderHour === currentHour && reminderMinute === currentMinute;
    });

    if (dueReminders.length === 0) {
      return { status: 'success', message: 'No reminders due this minute' };
    }

    console.log(`[Reminder Cron] ${dueReminders.length} reminder(s) due at ${currentHour}:${currentMinute}.`);

    const transporter = getEmailTransporter();
    const isEthereal = transporter.options.host === 'smtp.ethereal.email';

    for (const reminder of dueReminders) {
      const customer = reminder.customerId;
      if (!customer) {
        console.log(`[Reminder Cron] Skipping reminder ${reminder._id} — customer ref missing`);
        continue;
      }

      const messageText = `Pharmadesk Reminder: Time to take your ${reminder.medicineName}. Keep healthy!`;

      try {
        const htmlContent = buildReminderEmailHtml(reminder.medicineName, customer.name);

        const mailOptions = {
          from: `"Pharmadesk Reminders" <${process.env.SMTP_USER || 'no-reply@pharmadesk.com'}>`,
          to: customer.email,
          subject: `💊 Reminder: Time to take ${reminder.medicineName}`,
          html: htmlContent,
        };

        if (isEthereal) {
          console.log(`[MOCK EMAIL] Reminder to ${customer.email}: ${reminder.medicineName}`);
        } else {
          await transporter.sendMail(mailOptions);
          console.log(`[EMAIL SENT] Reminder to ${customer.email}: ${reminder.medicineName}`);
        }

        await Notification.create({
          recipientId: customer._id,
          type: 'Email',
          message: messageText,
          status: 'sent',
        });
      } catch (err) {
        console.error(`[Reminder Cron] Failed emailing ${customer.email}:`, err.message);
        await Notification.create({
          recipientId: customer._id,
          type: 'Email',
          message: `Email reminder failed for ${reminder.medicineName}: ${err.message}`,
          status: 'failed',
        });
      }
    }

    return { status: 'success', message: 'Email reminders processed' };
  } catch (error) {
    console.error('[Reminder Cron] Error:', error);
    return { status: 'error', error: error.message };
  }
};

// Initialize Cron Schedulers
export const initializeNotificationScheduler = () => {
  // Cron 1 — 8:00 AM daily (0 8 * * *)
  cron.schedule('0 8 * * *', runExpiryReport);
  console.log('Scheduled Expiry Report Cron Job (8:00 AM daily)');

  // Cron 2 — 9:00 AM daily (0 9 * * *)
  cron.schedule('0 9 * * *', runLowStockReport);
  console.log('Scheduled Low Stock Alert Cron Job (9:00 AM daily)');

  // Cron 3 — Every minute (* * * * *)
  // Matches each reminder's configured hour and minute, and sends email instantly
  cron.schedule('* * * * *', runEmailReminders);
  console.log('Scheduled Customer Email Reminder Cron Job (every minute, time-matched)');
};
