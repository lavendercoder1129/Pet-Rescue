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
| **Backend** | Node.js (v22+), Express.js, MongoDB, Mongoose 8, JWT, bcryptjs, dotenv, cors |
| **Tooling** | PostCSS, Autoprefixer, ESLint |

---

## 📁 Repository Structure

```
pet-rescue/
├── client/                     # React + Vite frontend
│   ├── public/                 # Static assets & SVG favicon
│   ├── src/
│   │   ├── assets/             # Media and graphics
│   │   ├── components/         # Shared UI components (Header, Footer, etc.)
│   │   ├── features/           # Modular application features
│   │   ├── hooks/              # Reusable React hooks
│   │   ├── layouts/            # Page layouts (RootLayout)
│   │   ├── pages/              # Views (HomePage, NotFoundPage)
│   │   ├── services/           # Axios instance & API integration
│   │   ├── styles/             # Tailwind & typography styling
│   │   ├── utils/              # Client utility functions
│   │   ├── App.jsx             # React Router routing
│   │   └── main.jsx            # Application entrypoint
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                     # Express.js REST API
│   ├── config/                 # DB & environment configuration
│   ├── controllers/            # Route controllers
│   ├── middleware/             # Auth, error handling, validation
│   ├── models/                 # Mongoose database models
│   ├── routes/                 # Express API routes
│   ├── services/               # Core business services
│   ├── utils/                  # Helper functions
│   ├── .env.example
│   ├── package.json
│   └── server.js               # Server entrypoint
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
- MongoDB (optional for basic frontend preview, required for full DB persistence)

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

### 3. Running Locally
Run the server and client concurrently or separately:

```bash
# Run backend API (http://localhost:5000)
npm run dev:server

# Run frontend client (http://localhost:5173)
npm run dev
```

### 4. Production Build
Verify frontend build:

```bash
npm run build
```

---

## 🗺️ Roadmap & Current Status

- [x] **Module 0: Foundation & GitHub Connection** (Active)
- [ ] **Module 1: Authentication & Role-Based Access Control**
- [ ] **Module 2: Emergency Rescue Case Reporting**
- [ ] **Module 3: Admin Case Verification & Triage**
- [ ] **Module 4: Simulated Donation System**
- [ ] **Module 5: Expenditure Proofs & Fund Tracking**
- [ ] **Module 6: Treatment Progress & Public Updates**
- [ ] **Module 7: Donor Recognition & Transparency**
- [ ] **Module 8: System Polish, Accessibility & Packaging**

For full technical specifications, refer to [`docs/PROJECT_ROADMAP.md`](./docs/PROJECT_ROADMAP.md).
