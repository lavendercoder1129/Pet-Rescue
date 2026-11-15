import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * Provides graceful fallback logging for local development
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pet_rescue';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[Database Warning] MongoDB connection failed: ${error.message}`);
    console.warn(`[Database Note] Make sure local MongoDB is running or provide MONGODB_URI in .env`);
    // In dev mode, allow server to run for health check & foundation testing
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};
