# Pet Rescue — Project Roadmap & Technical Specification

> **Notice:** This project is an academic simulation web application. No live banking, real UPI, Razorpay, Stripe, or payment gateway APIs are integrated. All financial flows and donations are simulated.

---

## 1. Project Context & Objectives

**Pet Rescue** is a coordination and transparency web platform for emergency rescue operations involving injured stray animals. 

### Core Stakeholder Capabilities
- **Rescuers**: Report injured stray animals with urgency levels, media proofs, location, and medical cost estimates.
- **Donors**: Support verified rescue cases through a simulated wallet/donation workflow and track fund utilization.
- **Administrators**: Review incoming emergency reports, verify medical bills/expenditure receipts, and ensure accountability.
- **Public & Community**: Observe live recovery journeys, treatment milestone updates, and transparent fund allocation.

---

## 2. Visual Design Foundation

- **Design Philosophy**: *Modern Compassionate Editorial*
- **Design Influences**:
  - `apple-design`: Physical momentum, fluid response, interruptible transitions, natural feedback.
  - `design-taste-frontend`: Anti-slop craftsmanship, authentic photography, equal edges, deliberate typography.
  - `frontend-design`: Purposeful aesthetic hierarchy, restrained motion, typography-first communication.
  - `ui-ux-pro-max`: Accessibility (contrast > 4.5:1), standard 44px+ touch targets, semantic hierarchy.

### Color Tokens
| Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Forest Green** | `#244C3A` | Primary brand authority, trust, institutional permanence |
| **Sage** | `#A8B9A0` | Secondary calming tint, status indicators, badges |
| **Warm Ivory** | `#FAF8F2` | Background canvas, soft editorial paper tone |
| **Muted Orange** | `#D98B54` | High-urgency signals, action buttons, highlight accents |
| **Charcoal** | `#252A27` | High-contrast editorial typography and dark elements |

### Typography Hierarchy
- **Headings / Editorial Elements**: `Playfair Display` (Serif)
- **Interface / Body / Metadata**: `Inter` (Sans-serif)

---

## 3. Technology Stack

### Frontend
- **Framework**: React 18 + Vite 5
- **Styling**: Tailwind CSS 3.4 (with customized design tokens)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **API Client**: Axios (configured with interceptors and base routing)

### Backend
- **Runtime**: Node.js (v22+)
- **Framework**: Express.js
- **Database**: MongoDB via Mongoose 8
- **Authentication Foundation**: JSON Web Tokens (`jsonwebtoken`) + `bcryptjs`
- **Environment Management**: `dotenv`
- **Cross-Origin**: `cors`

---

## 4. Architectural Directory Structure

```
pet-rescue/
├── client/                     # Vite + React Frontend
│   ├── public/                 # Static assets (favicons, manifest)
│   ├── src/
│   │   ├── assets/             # Images, static media
│   │   ├── components/         # Shared presentational UI elements
│   │   ├── features/           # Domain-specific feature modules
│   │   ├── hooks/              # Custom React hooks
│   │   ├── layouts/            # Page shell layouts (RootLayout)
│   │   ├── pages/              # Route view pages (HomePage, NotFound)
│   │   ├── services/           # Axios HTTP client and API endpoints
│   │   ├── styles/             # Global CSS and Tailwind layer definitions
│   │   ├── utils/              # Client-side utility functions
│   │   ├── App.jsx             # Main Router configuration
│   │   └── main.jsx            # React root mount
│   ├── .env.example            # Sample frontend environment config
│   ├── index.html              # HTML entry with font pre-connects
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                     # Express.js REST API
│   ├── config/                 # DB connection and environment configs
│   ├── controllers/            # Route controllers
│   ├── middleware/             # Error handling, auth, validation
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # Express route definitions
│   ├── services/               # Backend business logic
│   ├── utils/                  # Helper utilities and formatters
│   ├── .env.example            # Sample backend environment config
│   ├── package.json
│   └── server.js               # Express entrypoint
├── docs/                       # Project documentation
│   └── PROJECT_ROADMAP.md      # Development roadmap & specification
├── .gitignore                  # Git ignore rules for node_modules, .env, dist
├── package.json                # Root package orchestration
└── README.md                   # Primary project overview
```

---

## 5. Phased Module Roadmap

| Module | Title | Scope Summary | Status |
| :---: | :--- | :--- | :---: |
| **00** | **Project Foundation & GitHub** | Monorepo scaffolding, design system tokens, Tailwind, Express & Vite health integration, Git remote synchronization | **Complete** |
| **01** | **Authentication & RBAC** | JWT signup/login, roles (`rescuer`, `donor`, `admin`), password hashing, session recovery | Queued |
| **02** | **Emergency Rescue Case Reporting** | Rescuer emergency case submission form, medical description, injury severity, image upload, goal amount | Queued |
| **03** | **Admin Verification Workflow** | Case verification dashboard, status transitions (`pending`, `verified`, `rejected`, `closed`), triage notes | Queued |
| **04** | **Simulated Donation System** | Simulated donor contributions, progress bars, real-time funding calculations (Strictly no real payment gateways) | Queued |
| **05** | **Expenditure Proofs & Fund Tracking** | Rescuer receipt/vet bill upload, admin expenditure audit, live remaining budget calculation | Queued |
| **06** | **Treatment & Recovery Updates** | Rescuer milestone logs, before/after photos, animal discharge status, public timeline | Queued |
| **07** | **Donor Recognition & Leaderboards** | Supporter badges, donation history, transparency reports, impact summaries | Queued |
| **08** | **Polishing, Auditing & Packaging** | Accessibility (WCAG 2.1 AA), keyboard navigation, responsive stress testing, deployment readiness | Queued |

---

## 6. Development Guidelines & Constraints

1. **No Real Financial Transactions**: Under no circumstances should live payment processors (Stripe, Razorpay, PayPal, UPI) be integrated. All donation flows simulate balance adjustments.
2. **Design Discipline**: Do not use generic, unstyled templates. Adhere strictly to the *Modern Compassionate Editorial* palette and typography.
3. **Graceful Degradation**: Always provide visual fallback and informative user feedback if backend or database services are offline.
