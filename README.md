# Pet Rescue 🐾

> **Emergency Rescue Coordination & Simulated Donor Funding Platform for Injured Stray Animals**

Pet Rescue is a web application designed to bridge the gap between animal emergency rescuers, veterinary care facilities, community donors, and administrators. The platform streamlines emergency case intake, verification, simulated funding, and public recovery transparency.

---

## ⚠️ Academic Simulation Notice
This project is an **academic simulation**. Under no circumstances does this application process real monetary transactions, live UPI payments, or integrate commercial payment gateways (such as Razorpay or Stripe). All donor contributions and escrow balances are strictly simulated.

---

## ✨ Design Identity: Modern Compassionate Editorial

The visual language follows a warm, trustworthy, and intentional aesthetic:
- **Forest Green (`#244C3A`)**: Authority, stability, institutional credibility.
- **Sage (`#A8B9A0`)**: Calming medical recovery, harmony, subtle badge backgrounds.
- **Warm Ivory (`#FAF8F2`)**: Editorial newspaper/magazine canvas background.
- **Muted Orange (`#D98B54`)**: Urgent calls-to-action, triage urgency highlights.
- **Charcoal (`#252A27`)**: High-contrast, elegant typography.

**Typography**:
- **Headings & Display**: *Playfair Display*
- **Interface & Body**: *Inter*

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Tailwind CSS 3.4, React Router v6, Lucide React, Axios |
| **Backend** | Node.js (v22+), Express.js, MongoDB, Mongoose 8, JWT, bcryptjs, cookie-parser, dotenv, cors |
| **Tooling** | PostCSS, Autoprefixer, ESLint |

---

## 📁 Repository Structure

```
pet-rescue/
├── client/                     # React + Vite frontend
│   ├── public/                 # Static assets & SVG favicon
│   ├── src/
│   │   ├── assets/             # Media and authentic rescue images
│   │   ├── components/         # Reusable UI components (layout, common, cards, feedback, forms)
│   │   ├── context/            # AuthContext & AuthProvider
│   │   ├── data/               # Mock demonstration campaigns & financial ledger
│   │   ├── layouts/            # Page layouts (RootLayout)
│   │   ├── pages/              # Views (Home, Cases, Detail, Transparency, Login, Register, Dashboards)
│   │   ├── services/           # Axios API service instance with credentialed cookies
│   │   ├── styles/             # Tailwind & design-tokens styling
│   │   ├── App.jsx             # React Router routing with ProtectedRoute
│   │   └── main.jsx            # Application entrypoint
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                     # Express.js REST API
│   ├── config/                 # DB connection
│   ├── controllers/            # Route controllers (authController.js)
│   ├── middleware/             # verifyAuth, requireRoles, errorHandler
│   ├── models/                 # Mongoose schemas (User.js)
│   ├── routes/                 # Express API routes (authRoutes, adminRoutes, api.js)
│   ├── scripts/                # createAdmin.js seed script & testAuth.js
│   ├── .env.example
│   ├── package.json
│   └── server.js               # Server entrypoint with CORS & cookie-parser
├── docs/                       # Project specifications & roadmap
│   └── PROJECT_ROADMAP.md
├── .gitignore                  # Git ignore rules
├── package.json                # Root package scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or v22 recommended)
- npm (v9+)
- MongoDB (Running locally on `mongodb://localhost:27017` or via MongoDB Atlas connection URI)

### 1. Installation
Install all dependencies:

```bash
# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

### 2. Environment Setup
Copy the sample environment files:

```bash
# Server configuration
cp server/.env.example server/.env

# Client configuration
cp client/.env.example client/.env
```

Review `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/pet_rescue
JWT_SECRET=your_long_random_jwt_secret_key_here
CLIENT_URL=http://localhost:5173
```

### 3. Initialize Admin Account
Public registration restricts account creation strictly to **Donor** and **Rescuer** roles.
Create the initial administrator account using the secure backend seed script:

```bash
# Run with optional custom credentials:
ADMIN_NAME="System Administrator" \
ADMIN_EMAIL="admin@petrescue.example" \
ADMIN_PASSWORD="YourStrongAdminPassword123!" \
node server/scripts/createAdmin.js
```

### 4. Running Locally
Run the server and client concurrently or separately:

```bash
# Run backend API (http://localhost:5000)
npm run dev:server

# Run frontend client (http://localhost:5173)
npm run dev
```

### 5. Automated Verification & Testing
Run the backend authentication and role security test suite:

```bash
node server/scripts/testAuth.js
```

Verify frontend build:

```bash
npm run build
```

---

## 🗺️ Roadmap & Current Status

- [x] **Module 0: Foundation & GitHub Connection** (Completed)
- [x] **Module 1: Design System & Reusable Components** (Completed)
- [x] **Module 2: Homepage & Emergency Campaign Interface** (Completed)
- [x] **Module 3: Authentication & User Roles (Donor, Rescuer, Admin)** (Active)
- [ ] **Module 4: Emergency Rescue Cases (Creation, Triage & Browsing)** (Next)
- [ ] **Module 5: Admin Case Verification & Expenditure Proofs**
- [ ] **Module 6: Simulated Donation & Escrow System**
- [ ] **Module 7: Treatment Progress & Public Updates**
- [ ] **Module 8: Donor Recognition & Transparency Ledger**
- [ ] **Module 9: System Polish, Accessibility & Packaging**

For full technical specifications, refer to [`docs/PROJECT_ROADMAP.md`](./docs/PROJECT_ROADMAP.md).
