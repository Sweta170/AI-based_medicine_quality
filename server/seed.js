import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Medicine from './models/Medicine.js';
import Bill from './models/Bill.js';
import Reminder from './models/Reminder.js';
import Notification from './models/Notification.js';

dotenv.config();

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error('MONGO_URI is not set in .env!');
  process.exit(1);
}

async function seedData() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri);
    console.log('Connected successfully!');

    // 1. Clean up existing collections
    console.log('Cleaning up existing data...');
    await User.deleteMany({});
    await Medicine.deleteMany({});
    await Bill.deleteMany({});
    await Reminder.deleteMany({});
    await Notification.deleteMany({});
    console.log('Database cleaned successfully.');

    // 2. Create Users
    console.log('Seeding Users...');
    const superadmin = await User.create({
      name: 'Pharmadesk Admin',
      email: 'superadmin@pharmadesk.com',
      password: 'Test@1234',
      role: 'superadmin',
    });

    const pharmacist = await User.create({
      name: 'John Doe (Pharmacist)',
      email: 'testpharmacist@pharmadesk.com',
      password: 'Test@1234',
      role: 'pharmacist',
    });

    const customer = await User.create({
      name: 'Alice Smith (Customer)',
      email: 'testcustomer@pharmadesk.com',
      password: 'Test@1234',
      role: 'customer',
    });

    console.log('Users created successfully:');
    console.log(`- Super Admin: ${superadmin.email} (password: Test@1234)`);
    console.log(`- Pharmacist: ${pharmacist.email} (password: Test@1234)`);
    console.log(`- Customer: ${customer.email} (password: Test@1234)`);

    // Helper dates
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());

    const twoYearsHence = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());
    const oneYearHence = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    const fifteenDaysHence = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

    // 3. Create Medicines
    console.log('Seeding Medicines...');
    const medAdvil = await Medicine.create({
      name: 'Advil 200mg',
      genericName: 'Ibuprofen',
      manufacturer: 'Pfizer',
      batchNumber: 'ADV123-EXP',
      manufactureDate: sixMonthsAgo,
      expiryDate: twoYearsHence,
      quantity: 120,
      reorderLevel: 10,
      price: 8.99,
      category: 'Pain Relief',
      barcode: '8901234567890',
      createdBy: pharmacist._id,
    });

    const medAmoxicillin = await Medicine.create({
      name: 'Amoxicillin 250mg',
      genericName: 'Amoxicillin',
      manufacturer: 'BioPharmaCorp',
      batchNumber: 'AMOX-2026-003',
      manufactureDate: threeMonthsAgo,
      expiryDate: oneYearHence,
      quantity: 5,
      reorderLevel: 10,
      price: 4.20,
      category: 'Antibiotics',
      barcode: '8901234567891',
      createdBy: pharmacist._id,
    });

    const medAugmentin = await Medicine.create({
      name: 'Augmentin 625mg',
      genericName: 'Amoxicillin',
      manufacturer: 'GSK',
      batchNumber: 'AUG789-EXP',
      manufactureDate: oneMonthAgo,
      expiryDate: oneYearHence,
      quantity: 44,
      reorderLevel: 10,
      price: 15.50,
      category: 'Antibiotics',
      barcode: '8901234567892',
      createdBy: pharmacist._id,
    });

    const medAzithral = await Medicine.create({
      name: 'Azithral 500mg',
      genericName: 'Azithromycin',
      manufacturer: 'Alembic',
      batchNumber: 'AZI-2026-11',
      manufactureDate: now,
      expiryDate: twoYearsHence,
      quantity: 60,
      reorderLevel: 10,
      price: 22.00,
      category: 'Antibiotics',
      barcode: '8901234567893',
      createdBy: pharmacist._id,
    });

    const medBenadryl = await Medicine.create({
      name: 'Benadryl 100ml',
      genericName: 'Diphenhydramine',
      manufacturer: 'J&J',
      batchNumber: 'BEN-007',
      manufactureDate: twoYearsAgo,
      expiryDate: oneYearHence,
      quantity: 30,
      reorderLevel: 10,
      price: 11.00,
      category: 'Cough & Cold',
      barcode: '8901234567894',
      createdBy: pharmacist._id,
    });

    const medCetirizine = await Medicine.create({
      name: 'Cetirizine 10mg',
      genericName: 'Cetirizine HCl',
      manufacturer: 'UCB',
      batchNumber: 'CET-2026-02',
      manufactureDate: now,
      expiryDate: twoYearsHence,
      quantity: 200,
      reorderLevel: 10,
      price: 6.50,
      category: 'Allergy',
      barcode: '8901234567895',
      createdBy: pharmacist._id,
    });

    console.log('Medicines created successfully!');

    // 4. Create Medication Reminders
    console.log('Seeding Medication Reminders...');
    await Reminder.create([
      {
        customerId: customer._id,
        medicineName: 'Advil 200mg',
        phoneNumber: '+15550199',
        time: '08:00 AM',
        isActive: true,
      },
      {
        customerId: customer._id,
        medicineName: 'Amoxicillin 250mg',
        phoneNumber: '+15550199',
        time: '02:00 PM',
        isActive: true,
      },
      {
        customerId: customer._id,
        medicineName: 'Augmentin 625mg',
        phoneNumber: '+15550199',
        time: '09:00 PM',
        isActive: false,
      }
    ]);
    console.log('Reminders created successfully!');

    // 5. Create Bills
    console.log('Seeding Bills...');
    const bill1 = await Bill.create({
      pharmacistId: pharmacist._id,
      customerId: customer._id,
      items: [
        {
          medicineId: medAdvil._id,
          name: medAdvil.name,
          quantity: 2,
          unitPrice: medAdvil.price,
          expiryStatus: 'SAFE',
        },
        {
          medicineId: medAugmentin._id,
          name: medAugmentin.name,
          quantity: 1,
          unitPrice: medAugmentin.price,
          expiryStatus: 'SAFE',
        }
      ],
      subtotal: (medAdvil.price * 2) + medAugmentin.price,
      discount: 2.00,
      total: ((medAdvil.price * 2) + medAugmentin.price) - 2.00,
      paymentMethod: 'UPI',
    });

    const bill2 = await Bill.create({
      pharmacistId: pharmacist._id,
      customerId: customer._id,
      items: [
        {
          medicineId: medAmoxicillin._id,
          name: medAmoxicillin.name,
          quantity: 1,
          unitPrice: medAmoxicillin.price,
          expiryStatus: 'SAFE',
        }
      ],
      subtotal: medAmoxicillin.price,
      discount: 0.00,
      total: medAmoxicillin.price,
      paymentMethod: 'Cash',
    });

    console.log('Bills created successfully:');
    console.log(`- Bill 1: ${bill1.billNumber} (₹${bill1.total.toFixed(2)})`);
    console.log(`- Bill 2: ${bill2.billNumber} (₹${bill2.total.toFixed(2)})`);

    // 6. Create Notifications
    console.log('Seeding Notifications...');
    await Notification.create([
      {
        recipientId: pharmacist._id,
        type: 'Email',
        message: 'Daily Expiry Report: 1 medicine is expired, 1 medicine is nearing expiry.',
        status: 'sent',
      },
      {
        recipientId: pharmacist._id,
        type: 'Email',
        message: 'Low Stock Alert: Amoxicillin 250mg is below reorder level (5 remaining).',
        status: 'sent',
      },
      {
        recipientId: customer._id,
        type: 'SMS',
        message: 'Pharmadesk Reminder: Time to take your Paracetamol 500mg. Keep healthy!',
        status: 'sent',
      }
    ]);
    console.log('Notifications created successfully!');

    console.log('\n=========================================');
    console.log('🎉 Seed Completed Successfully!');
    console.log('=========================================');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seedData();
