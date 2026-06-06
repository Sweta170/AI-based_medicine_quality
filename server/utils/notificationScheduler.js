import cron from 'node-cron';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
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

// Setup Twilio SMS Client
const sendSMS = async (to, message) => {
  const isTwilioConfigured =
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER;

  if (isTwilioConfigured) {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    return await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
  } else {
    console.log(`[MOCK TWILIO SMS] Sent to ${to}: ${message}`);
    return { sid: 'mock_sid_123456789' };
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
      <h2 style="color: #0f172a; font-family: sans-serif;">Aegis Expiry Warning Report</h2>
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
        Aegis Medicine System - Scheduled Automation Report
      </p>
    `;

    const transporter = getEmailTransporter();

    // Send emails to all pharmacists
    for (const pharmacist of pharmacists) {
      try {
        const isEthereal = transporter.options.host === 'smtp.ethereal.email';
        
        const mailOptions = {
          from: `"Aegis Notifications" <${process.env.SMTP_USER || 'no-reply@aegismed.com'}>`,
          to: pharmacist.email,
          subject: '⚠️ Daily Expiry Report - Aegis Pharmacy',
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
          message: `Daily Expiry Report sent: ${medicines.length} expiring medicines found.`,
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
      <h2 style="color: #0f172a; font-family: sans-serif;">Aegis Low Stock Alert</h2>
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
        Aegis Medicine System - Stock Alert Notification
      </p>
    `;

    const transporter = getEmailTransporter();

    // Send emails
    for (const pharmacist of pharmacists) {
      try {
        const isEthereal = transporter.options.host === 'smtp.ethereal.email';
        const mailOptions = {
          from: `"Aegis Notifications" <${process.env.SMTP_USER || 'no-reply@aegismed.com'}>`,
          to: pharmacist.email,
          subject: '⚠️ Stock Replenishment Alert - Aegis Pharmacy',
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
          message: `Low Stock Alert report sent: ${medicines.length} low stock medicines flagged.`,
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

// --- CRON JOB 3: Daily Customer SMS Reminders at 10:00 AM ---
export const runSmsReminders = async () => {
  console.log('Running daily customer medication SMS reminders...');
  try {
    const reminders = await Reminder.find({ isActive: true }).populate('customerId');

    if (reminders.length === 0) {
      console.log('No active medication reminders.');
      return { status: 'success', message: 'No active reminders found' };
    }

    for (const reminder of reminders) {
      const customer = reminder.customerId;
      if (!customer) {
        console.log(`Skipping reminder ${reminder._id} - customer ref is missing`);
        continue;
      }

      const messageText = `Reminder: Time to take your ${reminder.medicineName}. Prescribed by Aegis Medicine System.`;

      try {
        await sendSMS(reminder.phoneNumber, messageText);

        await Notification.create({
          recipientId: customer._id,
          type: 'SMS',
          message: messageText,
          status: 'sent',
        });
      } catch (err) {
        console.error(`Failed sending SMS reminder to ${reminder.phoneNumber}:`, err.message);
        await Notification.create({
          recipientId: customer._id,
          type: 'SMS',
          message: `SMS reminder failed: ${err.message}`,
          status: 'failed',
        });
      }
    }

    return { status: 'success', message: 'SMS reminders processed' };
  } catch (error) {
    console.error('Error running SMS reminders cron:', error);
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

  // Cron 3 — 10:00 AM daily (0 10 * * *)
  cron.schedule('0 10 * * *', runSmsReminders);
  console.log('Scheduled Customer SMS Reminder Cron Job (10:00 AM daily)');
};
