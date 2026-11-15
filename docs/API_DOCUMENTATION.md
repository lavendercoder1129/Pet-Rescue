# Pet Rescue — Comprehensive API Documentation

All API routes are mounted under `/api`. Standard responses follow JSON formatting with `success: true | false`.

---

## 1. Authentication & Session Endpoints (`/api/auth`)

### `POST /api/auth/register`
- **Description:** Register a new Donor or Rescuer account. Public registration cannot create Admin accounts.
- **Access:** Public
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "9876543210",
    "password": "Password123!",
    "role": "donor"
  }
  ```
- **Responses:**
  - `201 Created`: Returns user object, sets HTTP-only `token` cookie, returns JWT `token`.
  - `400 Bad Request`: Validation failure (weak password, invalid email).
  - `403 Forbidden`: Attempting to register with `role: "admin"`.
  - `409 Conflict`: Email already in use.

### `POST /api/auth/login`
- **Description:** Authenticate user credentials and receive JWT token.
- **Access:** Public
- **Request Body:** `{ "email": "user@example.com", "password": "Password123!" }`
- **Responses:** `200 OK` (token + user data), `401 Unauthorized`.

### `GET /api/auth/me`
- **Description:** Retrieve the currently authenticated user's profile.
- **Access:** Private (`verifyAuth`)
- **Responses:** `200 OK` with user profile.

### `POST /api/auth/logout`
- **Description:** Terminate user session and clear HTTP-only cookie.
- **Access:** Public
- **Responses:** `200 OK`.

---

## 2. Rescue Case Endpoints (`/api/cases`)

### `GET /api/cases`
- **Description:** Public listing of approved and active rescue campaigns with search, filter, and pagination.
- **Access:** Public
- **Query Parameters:** `page`, `limit`, `search`, `animalType`, `urgency`, `status`.
- **Responses:** `200 OK` with paginated array of cases.

### `GET /api/cases/:id`
- **Description:** Fetch detailed case information for an approved case.
- **Access:** Public
- **Responses:** `200 OK` (case data), `404 Not Found` (if case is pending or rejected).

### `POST /api/cases`
- **Description:** Submit a new emergency rescue case with uploaded image proofs.
- **Access:** Private (`rescuer` with approved status, or `admin`)
- **Form Data:** `title`, `animalName`, `animalType`, `breed`, `location`, `description`, `injuryType`, `injuryDescription`, `medicalCondition`, `urgencyLevel`, `estimatedTreatmentCost`, `fundraisingGoal`, `images` (up to 5 files).
- **Responses:** `201 Created` with case defaulting strictly to `Pending` status.

### `GET /api/cases/my`
- **Description:** Rescuer view of all submitted cases owned by their account.
- **Access:** Private (`rescuer`, `admin`)
- **Responses:** `200 OK` with cases list.

---

## 3. Simulated Donation Endpoints (`/api/donations`)

### `POST /api/donations`
- **Description:** Process a simulated donation for an approved and active rescue case.
- **Access:** Private (Authenticated user)
- **Request Body:**
  ```json
  {
    "caseId": "65f01...abc",
    "amount": 2500,
    "donationMessage": "Speedy recovery!",
    "isAnonymous": false,
    "idempotencyKey": "uuid-optional"
  }
  ```
- **Responses:** `201 Created` with digital receipt and reference `SIM-YYYYMMDD-XXXXXX`. Triggers asynchronous achievement evaluations.

### `GET /api/donations/my`
- **Description:** Donor's personal donation transaction history.
- **Access:** Private (Authenticated user)
- **Responses:** `200 OK` with donation records and summary metrics.

---

## 4. Fund Allocation & Financial Transparency (`/api/transparency` & `/api/admin/funds`)

### `GET /api/transparency/summary`
- **Description:** Public sanitized financial ledger showing simulated total donations, allocated funds, and verified spending.
- **Access:** Public
- **Responses:** `200 OK` with platform financial metrics.

### `POST /api/admin/funds/allocations`
- **Description:** Allocate collected campaign funds to specific care categories (Surgery, Medicines, etc.).
- **Access:** Private (`admin`)
- **Request Body:**
  ```json
  {
    "caseId": "65f01...abc",
    "amount": 5000,
    "allocationCategory": "Surgery",
    "description": "Surgical pin insertion"
  }
  ```
- **Responses:** `201 Created`. Rejects with `400 Bad Request` if requested allocation exceeds unallocated campaign funds.

---

## 5. Expense Proof & Bill Auditing (`/api/expenses`)

### `POST /api/expenses`
- **Description:** Rescuer submits scanned clinic bills against an active fund allocation.
- **Access:** Private (`rescuer`, `admin`)
- **Form Data:** `caseId`, `fundAllocationId`, `title`, `category`, `amount`, `vendorName`, `invoiceDate`, `documents` (up to 5 PDF or image files).
- **Responses:** `201 Created` defaulting strictly to `Pending` verification status.

### `GET /api/expenses/my`
- **Description:** Rescuer view of their submitted expense claims.
- **Access:** Private (`rescuer`, `admin`)
- **Responses:** `200 OK`.

### `PATCH /api/admin/expenses/:id/approve`
- **Description:** Admin approves an expense claim, automatically deducting from remaining allocation and incrementing case verified spending.
- **Access:** Private (`admin`)
- **Responses:** `200 OK`.

### `PATCH /api/admin/expenses/:id/reject`
- **Description:** Admin rejects an expense claim with a mandatory reason note.
- **Access:** Private (`admin`)
- **Request Body:** `{ "reviewNotes": "Invoice illegible. Please re-upload clearer scan." }`
- **Responses:** `200 OK`.

---

## 6. Clinical Updates & Announcements (`/api/rescue-updates` & `/api/announcements`)

### `POST /api/rescue-updates`
- **Description:** Rescuer submits a clinical milestone update with progress photos.
- **Access:** Private (`rescuer` owner, `admin`)
- **Responses:** `201 Created` with `pending` status.

### `PATCH /api/admin/rescue-updates/:id/approve`
- **Description:** Admin moderates and publishes an update to the public timeline.
- **Access:** Private (`admin`)
- **Responses:** `200 OK`.

### `GET /api/announcements`
- **Description:** Public active broadcast announcements. Expired and draft announcements are filtered out.
- **Access:** Public
- **Responses:** `200 OK`.

---

## 7. Donor Recognition, Leaderboards & Badges (`/api/achievements` & `/api/donors`)

### `GET /api/achievements`
- **Description:** List all active badges with personal progress percentages for the authenticated user.
- **Access:** Private (Authenticated user)
- **Responses:** `200 OK` with badges and stats.

### `GET /api/donors/leaderboard`
- **Description:** Public donor honor roll ranking. Strictly filters only opted-in users; masks donation totals unless explicitly opted-in; never exposes email or phone.
- **Access:** Public
- **Responses:** `200 OK` with deterministic ranking hierarchy.

### `PATCH /api/donors/recognition-settings`
- **Description:** Update donor privacy preferences.
- **Access:** Private (Authenticated user)
- **Request Body:** `{ "showOnLeaderboard": true, "displayName": "StrayProtector", "showDonationTotal": false }`
- **Responses:** `200 OK`.

---

## 8. Administrative Oversight (`/api/admin`)

### `GET /api/admin/dashboard`
- **Description:** Consolidated platform metrics across users, cases, donations, allocations, expenses, updates, and announcements.
- **Access:** Private (`admin`)
- **Responses:** `200 OK`.

### `GET /api/admin/users`
- **Description:** Registered user accounts and rescuer verification management.
- **Access:** Private (`admin`)
- **Responses:** `200 OK`.

### `PATCH /api/admin/rescuers/:id/verify`
- **Description:** Update rescuer account status (`approved`, `rejected`, `pending`).
- **Access:** Private (`admin`)
- **Responses:** `200 OK`.
