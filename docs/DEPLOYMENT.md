# Pet Rescue — Production Deployment Guide

## 1. Hosting Architecture Overview
The Pet Rescue application is architected for decoupled deployment across cloud providers:

- **Frontend Client:** Vercel, Netlify, or Render Static Site (Vite Single Page Application).
- **Backend API Gateway:** Render Web Service, Railway, Heroku, or AWS EC2 (Node.js runtime).
- **Database:** MongoDB Atlas (Managed Cloud M0/M10 Database Cluster).
- **Storage:** Local persistent disk with cloud object storage adapter (AWS S3 / Cloudflare R2 compatible).

---

## 2. Environment Variables Configuration

### Backend Server (`server/.env` or Host Environment Variables)
| Variable | Required | Example / Description |
| :--- | :--- | :--- |
| `NODE_ENV` | Yes | `production` |
| `PORT` | Yes | `5000` (Assigned automatically by Render / Heroku) |
| `MONGODB_URI` | Yes | `mongodb+srv://<user>:<password>@cluster0.mongodb.net/pet_rescue?retryWrites=true&w=majority` |
| `JWT_SECRET` | Yes | Random 64-character secret key (`openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | No | `7d` (Default: 7 days) |
| `CLIENT_URL` | Yes | Deployed frontend origin (e.g. `https://pet-rescue.vercel.app`), supports comma-separated URLs. |

### Frontend Client (`client/.env` or Host Environment Variables)
| Variable | Required | Example / Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | Yes | Deployed backend API origin (e.g. `https://pet-rescue-api.onrender.com/api`) |
| `VITE_APP_NAME` | No | `"Pet Rescue"` |

---

## 3. Step-by-Step Deployment Instructions

### Option A: Render (Full Stack Blueprint via `render.yaml`)
1. Fork or push your Pet Rescue repository to GitHub.
2. Sign in to your [Render Dashboard](https://dashboard.render.com).
3. Click **New +** $\rightarrow$ **Blueprint**.
4. Connect the repository containing `render.yaml`.
5. Provide your `MONGODB_URI` from MongoDB Atlas in the Render dashboard prompt.
6. Render will automatically provision both the `pet-rescue-api` web service and `pet-rescue-web` static site.

### Option B: Vercel (Frontend) + Render (Backend)

#### 1. Setup MongoDB Atlas
1. Create a free shared cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user with read/write access.
3. In Network Access, allow access from `0.0.0.0/0` (or Render's outbound IP ranges).
4. Copy the connection string format: `mongodb+srv://<username>:<password>@cluster.mongodb.net/pet_rescue`.

#### 2. Deploy Backend on Render
1. Create a new **Web Service** on Render.
2. Connect your GitHub repository with root directory: `server`.
3. Set Build Command: `npm install`
4. Set Start Command: `node server.js`
5. Add environment variables:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<Atlas Connection String>`
   - `JWT_SECRET`: `<Secure Random String>`
   - `CLIENT_URL`: `<Your Vercel URL, e.g. https://pet-rescue.vercel.app>`
6. Deploy and verify health endpoint: `https://<your-backend-app>.onrender.com/api/health`.

#### 3. Deploy Frontend on Vercel
1. Import the repository in [Vercel](https://vercel.com).
2. Set Root Directory to `client`.
3. Framework Preset: **Vite**.
4. Configure Environment Variable:
   - `VITE_API_URL`: `https://<your-backend-app>.onrender.com/api`
5. Click **Deploy**. Vercel will build the bundle using `vercel.json` rewrite rules for client-side routing.

---

## 4. Initial Production Admin Seeding
To provision an initial administrator account on production without opening public registration:
```bash
# Run one-off seed script using production connection string:
NODE_ENV=production \
MONGODB_URI="<your-atlas-uri>" \
ADMIN_EMAIL="admin@yourdomain.com" \
ADMIN_PASSWORD="<YourSecurePassword123!>" \
ADMIN_NAME="System Administrator" \
node server/scripts/createAdmin.js
```

---

## 5. Health Checks & Verification
- **Backend API Health Check:**
  `GET https://<backend-domain>/api/health`
  Expected response: `200 OK`
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-11-15T13:00:00.000Z",
    "database": "connected"
  }
  ```
- **Static Asset Delivery:** Verify images load via `https://<backend-domain>/uploads/cases/...`.
- **CORS Preflight:** Verify that `OPTIONS` requests from `CLIENT_URL` return `204 No Content` with appropriate `Access-Control-Allow-Origin`.

---

## 6. Rollback & Troubleshooting
- **Frontend Rollback:** In Vercel or Netlify, navigate to **Deployments**, select the previously stable deployment, and click **Rollback**.
- **Backend Rollback:** In Render, navigate to **Deploys**, select the target commit, and click **Rollback to this deploy**.
- **Database Backup:** Enable automated hourly/daily snapshots in the MongoDB Atlas console under **Backup**.
