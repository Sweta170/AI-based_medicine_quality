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

## ⚙️ Step-by-Step Installation & Setup Guide (For New / Different Systems)

This section provides comprehensive instructions for deploying, installing, and running **Pharma Desk** on any fresh Windows, macOS, or Linux system.

---

### Step 1: Install Prerequisites
Before running the application, make sure the target system has the following software installed:

1. **Node.js (LTS Version - v18 or higher)**
   * Download and install from [Node.js Official Website](https://nodejs.org/).
   * Verify installation in terminal/command prompt:
     ```bash
     node -v
     npm -v
     ```
2. **MongoDB Database Service** (Choose **Option A** or **Option B**):
   * **Option A: Local MongoDB (Recommended for offline/development)**
     * Download and install [MongoDB Community Server](https://www.mongodb.com/try/download/community).
     * Download and install [MongoDB Compass](https://www.mongodb.com/try/download/compass) (Graphical Interface to view database).
     * Ensure the MongoDB service is running (default port is `27017`).
   * **Option B: MongoDB Atlas (Cloud database)**
     * Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
     * Create a free cluster, whitelist your IP address (or select `0.0.0.0/0` for access from anywhere), and obtain your application connection string (e.g. `mongodb+srv://...`).

---

### Step 2: Environment Configuration (.env)
1. Go to the `server/` directory.
2. Duplicate or copy the `.env.example` file and rename it to `.env`.
3. Open `.env` in any text editor and fill in the configuration variables:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/pharmadesk
JWT_ACCESS_SECRET=your_access_token_secret_here
JWT_REFRESH_SECRET=your_refresh_token_secret_here
CLIENT_URL=http://localhost:5173

# SMTP Configuration (Required for Medication Email Reminders)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
```

#### 💡 Environment Config Notes for Different Systems:
* **`MONGO_URI`**:
  * If running **local MongoDB**, use `mongodb://localhost:27017/pharmadesk`. (On some systems, if `localhost` fails to connect, try `mongodb://127.0.0.1:27017/pharmadesk`).
  * If running **MongoDB Atlas cloud**, replace it with your Atlas connection string (e.g., `mongodb+srv://username:password@cluster.xxxx.mongodb.net/pharmadesk?retryWrites=true&w=majority`).
* **`JWT Secrets`**:
  * You can generate high-entropy secure keys on any platform by executing this command in your terminal:
    ```bash
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    ```
* **`SMTP_USER` & `SMTP_PASS`**:
  * Required if you wish to test automated patient email notifications.
  * For **Gmail**, you cannot use your standard password due to security blocks. Enable **2-Step Verification** on the Google Account, navigate to Google App Passwords settings, generate a 16-character **App Password**, and use that string for `SMTP_PASS`.

---

### Step 3: Install Dependencies
Open your terminal (PowerShell, Command Prompt, or bash) in the **root directory** of the extracted project (where the root `package.json` is located) and run:

```bash
npm run install:all
```
*This script automatically runs npm installation inside the root directory, the frontend `client/` directory, and the backend `server/` directory.*

---

### Step 4: Seed Mock Data
To populate the database with default test accounts (Superadmins, Pharmacists, Customers) and mock medicine listings, run:

```bash
npm run seed
```

---

### Step 5: Run the Project
Start both the Node.js API server and React/Vite development server concurrently with a single command from the project root:

```bash
npm run dev
```

* **Frontend Client (React/Vite)**: Runs on **[http://localhost:5173](http://localhost:5173)**
* **Backend Server (Express API)**: Runs on **[http://localhost:5000](http://localhost:5000)**

---

## 🧪 Test Accounts
After running the seeder script, you can log in using the following pre-configured credentials:

* **Superadmin**: `superadmin@pharmadesk.com` / `admin123`
* **Pharmacist**: `pharmacist@pharmadesk.com` / `pharmacist123`
* **Customer**: `customer@pharmadesk.com` / `customer123`
