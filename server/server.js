import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import apiRoutes from './routes/api.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Validate critical environment variables in production
if (process.env.NODE_ENV === 'production') {
  const requiredEnv = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = requiredEnv.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`[FATAL CONFIG ERROR] Missing required environment variables in production: ${missing.join(', ')}`);
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Production CORS Configuration: support comma-separated allowed origins or single URL
const getAllowedOrigins = () => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  return clientUrl.split(',').map((url) => url.trim().replace(/\/$/, ''));
};

const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or postman in dev)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy does not allow access from origin ${origin}`));
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded case images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api', apiRoutes);

// Root greeting
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Pet Rescue API server',
    status: 'online',
    healthCheck: '/api/health',
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Pet Rescue Server] Running on http://localhost:${PORT}`);
    console.log(`[Health Check] http://localhost:${PORT}/api/health`);
    console.log(`[Static Uploads] http://localhost:${PORT}/uploads`);
  });
}

export default app;
