# Pet Rescue — Comprehensive User Guide

Welcome to the **Pet Rescue** platform user guide. This document explains how visitors, community donors, emergency rescuers, and administrators navigate and utilize the system.

---

## 1. Visitor Experience (Public Access)

### Exploring Rescue Cases
- **Browse Campaigns:** Click **Emergency Cases** in the navigation bar to browse approved active rescue campaigns.
- **Search & Filters:** Search by animal name or location (e.g. `Rocky`, `Koramangala`), or filter by animal species (`Dog`, `Cat`, `Other`) and triage urgency (`Critical`, `Urgent`, `Normal`).
- **Inspect Case Timelines:** On any case details page, view injury photos, admitting veterinary clinic details, medical updates, and verified spending progress.

### Financial Transparency & Community Honor Roll
- **Transparency Dashboard (`/transparency`):** Review simulated platform-wide financials, including total donations, allocated clinical care funds, and verified bill disbursements.
- **Honor Roll Leaderboard (`/leaderboard`):** Celebrate top platform supporters who have opted into public recognition, showcasing unlocked badges, gifts count, and cases supported.
- **Platform Announcements (`/announcements`):** Stay informed about urgent natural disasters, severe veterinary shortages, and seasonal rescue drives.

---

## 2. Donor Experience

### Making a Simulated Donation
1. Sign in or register as a **Donor**.
2. Select any active approved rescue campaign and click **Donate Now**.
3. Choose a preset amount (₹500, ₹1,000, ₹2,500, or custom) and add an optional encouraging message.
4. Complete the simulated transaction. Your digital receipt will be generated immediately with a reference code format (`SIM-YYYYMMDD-XXXXXX`).

### Managing Badges & Privacy on the Donor Dashboard
- **Donor Dashboard (`/donor/dashboard`):** Track total simulated gifts, review your next achievable achievement progress bar, inspect recently supported cases, and mark in-app notifications as read.
- **Achievement Badges (`/donor/achievements`):** View unlocked badges such as `First Contribution`, `Helping Hand`, `Compassion Champion`, `Animal Advocate`, and `Rescue Supporter`.
- **Privacy Controls:** On the dashboard, toggle your public leaderboard participation, set a custom display alias, or choose whether your total contribution figure is public or hidden.

---

## 3. Rescuer Experience

### Account Verification Notice
- Upon registration as a **Rescuer**, accounts are placed in `Pending Verification` status as a safety measure for animal welfare.
- Platform administrators review rescuer credentials before allowing live emergency case publications.

### Reporting an Emergency Rescue Case
1. Navigate to `/rescuer/cases/new`.
2. Provide patient details: Animal identifier, species, breed, age, and GPS landmark.
3. Detail clinical trauma: Injury type, symptom diagnosis, urgency level, admitting clinic name, and treatment surgery cost estimate.
4. Upload up to 5 clear photographs (`JPEG`, `PNG`, `WebP`).
5. Submit for administrative review. The case will be triaged under `Pending` status.

### Publishing Recovery Milestones & Submitting Expenses
- **Recovery Updates (`/rescuer/updates/new`):** Post progress journals, surgical updates, and recovery photos for approved cases.
- **Treatment Bills & Expense Proof (`/rescuer/expenses/new`):** Upload veterinary clinic invoices and pharmacy bills against active campaign fund allocations. Scanned PDFs or photos are routed to admin verification queues.

---

## 4. Administrator Experience

### Admin Control Center (`/admin/dashboard`)
Administrators possess platform-wide governance tools:

1. **Case Verification Queue (`/admin/cases`):** Audit pending rescue submissions, inspect high-resolution injury photos, and approve or reject campaigns with mandatory feedback notes.
2. **Rescuer Management:** Approve or reject rescuer registration applications directly from the registered users table.
3. **Fund Allocations (`/admin/funds`):** Earmark collected campaign donations into categorized care funds (Surgery, Medicines, Shelter, etc.).
4. **Expense Claims Auditing (`/admin/expenses`):** Verify clinic invoices uploaded by rescuers, approving legitimate claims to increment verified spending or rejecting with feedback.
5. **Updates Moderation (`/admin/rescue-updates`):** Review and approve rescuer clinical updates before publication to the public timeline.
6. **Announcements Broadcast (`/admin/announcements`):** Create, publish, draft, and archive priority banners.
7. **Badge Management (`/admin/achievements`):** Configure achievement badge definitions, thresholds, icons, and activation states.

---

## 5. Academic Demonstration Notice
Pet Rescue is an educational demonstration project. No real currency is accepted or transferred. All donor gifts, fund allocations, digital receipts, and bank transaction codes are simulated for academic evaluation.
