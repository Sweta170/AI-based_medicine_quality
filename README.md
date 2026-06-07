# 💊 Pharma Desk — Intelligent Pharmacy Management Portal

Pharma Desk is a modern, full-stack MERN (MongoDB, Express, React, Node.js) web application designed for pharmacies to manage their inventory, billing, customers, and reminders. It features role-based access control, automated daily inventory checks, OCR-based smart medicine registration, PDF invoice generation, and dual-channel (email + browser) medication reminders.

---

## 🚀 Key Features

### 1. User Roles & Access Control
The application supports three roles, each with a tailored workspace and security checks:
*   **Superadmin**: Controls user management, system diagnostics, overall dashboards, and has override permissions.
*   **Pharmacist Portal**: A high-efficiency panel designed for pharmacy operators:
    *   **Dashboard**: Shows statistics like sales history (last 7 days chart), total stock count, expired batches, and expiring-soon lists.
    *   **Catalog Database Manager**: Full CRUD operations on medicines, bulk JSON batch import, and an **OCR Smart Label Autocomplete** tool.
    *   **Invoice Worksheet**: An integrated point-of-sale compiler directly in the dashboard that supports selecting registered customers as well as direct walk-in guest checkouts (using an optional guest phone number). On completion, it triggers an interactive success modal to print standard receipts or begin a new bill.
    *   **Alerts & Reminders page**: A simplified, friendly dashboard listing daily automated checks (expired medicine, low stock, patient reminders) with "Run now" capabilities.
*   **Customer Portal**: A consumer-facing panel:
    *   **Medicine Shop**: A catalog to search, filter by category, and buy medicines.
    *   **Invoice History**: Lists past purchases with downloadable PDF receipts.
    *   **Medication Reminders**: Allows patients to set medication alarms (medicine name, time) to receive reminders.

### 2. OCR Smart Label Scanning
*   Utilizes **Tesseract.js** directly on the server to parse uploaded photos of medicine packages.
*   Automatically extracts medicine name, generic formula name, manufacturer, batch number, and expiry date to pre-fill registration forms, saving time and reducing typing errors.

### 3. Compliance & Expiry Protection
*   The billing panel automatically detects if any medicine in the current invoice worksheet has expired.
*   Blocks the checkout action and displays a compliance warning banner to prevent illegal distribution of expired drugs.

### 4. Printable Receipts & Invoice History
*   Features a dedicated printable receipt page (`/pharmacist/receipt/:id`) configured with clean CSS print media queries.
*   Receipts (both print views and downloadable PDF documents) display the medicine's actual formatted **Expiry Date** (e.g. `Jan 2028`) instead of the compliance status text to meet auditing standards.

### 5. Dual-Channel Alerts & Reminders
*   **Daily Automated Reports**: Hourly background cron jobs check for expired items, low stock levels, and upcoming reminder times.
*   **Hourly SMTP Email Dispatcher**: Sends detailed emails to patients reminding them of their scheduled doses.
*   **Real-time Web Browser Notifications**: Triggers desktop notification banners inside the patient's browser when they have the application open.

---

## 🛠️ Technology Stack

### Frontend
*   **Core**: React 19, Vite (as build tool)
*   **Routing**: React Router DOM v6
*   **State & Queries**: TanStack React Query v5 (efficient server-state caching)
*   **Styling**: TailwindCSS v3 (for responsive design), Lucide React (for modern icons)
*   **Charts**: Recharts (for sales and billing graphs)

### Backend
*   **Runtime**: Node.js & Express
*   **Database**: MongoDB & Mongoose ORM
*   **Authentication**: JSON Web Tokens (JWT) & Bcrypt.js (password hashing)
*   **OCR Parsing**: Tesseract.js
*   **Invoice Rendering**: PDFKit (dynamic PDF generation)
*   **Task Scheduling**: Node-Cron (for backend background processes)
*   **Email Engine**: Nodemailer (via SMTP)

---

## 📂 Project Structure

```
├── client/                      # React Frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components (Navbar, Sidebar, etc.)
│   │   ├── context/             # AuthContext, ThemeContext
│   │   ├── hooks/               # Custom React hooks (useBrowserNotifications)
│   │   ├── pages/               # Page components (PharmacistDashboard, Login, etc.)
│   │   ├── App.jsx              # Main React routing configuration
│   │   └── index.css            # Styling core
│   └── package.json
├── server/                      # Node.js Express Backend
│   ├── config/                  # Database connections
│   ├── controllers/             # Request handlers (billing, medicines, notifications)
│   ├── middleware/              # JWT validation & RBAC checkers
│   ├── models/                  # Mongoose Schemas (User, Medicine, Bill, Notification, Reminder)
│   ├── routes/                  # API endpoints
│   ├── utils/                   # Notification scheduler, transporters, OCR scanning helpers
│   ├── seed.js                  # Database seeder script
│   ├── server.js                # Main server entrypoint
│   └── package.json
├── package.json                 # Monorepo root configurations & scripts
└── README.md
```

---

## ⚙️ Installation & Configuration

### Prerequisites
*   Node.js (v18 or higher)
*   MongoDB Instance (Local or MongoDB Atlas)
*   SMTP Server Credentials (e.g., Gmail App Password) for email dispatchers

### 1. Environment Configuration
Create a `.env` file in the `server/` directory and configure the variables based on `server/.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/pharmadesk
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d

# SMTP Configuration (Required for Medication Email Reminders)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM=Pharma Desk <noreply@pharmadesk.com>
```

### 2. Install Dependencies
Run the install command in the root directory. This script will automatically install dependencies for the root, frontend, and backend packages:

```bash
npm run install:all
```

### 3. Seed Mock Data
To populate the database with test accounts (customers, pharmacists, superadmins) and initial stock items, run:

```bash
npm run seed --prefix server
```

### 4. Run Locally
Start both the backend server and frontend Vite developer server concurrently:

```bash
npm run dev
```

*   **Frontend Client**: Runs on `http://localhost:5173`
*   **Backend Server**: Runs on `http://localhost:5000`

---

## 🧪 Test Accounts
After running the seeder script, you can log in using the following credentials:

*   **Superadmin**: `superadmin@pharmadesk.com` / `admin123`
*   **Pharmacist**: `pharmacist@pharmadesk.com` / `pharmacist123`
*   **Customer**: `customer@pharmadesk.com` / `customer123`
