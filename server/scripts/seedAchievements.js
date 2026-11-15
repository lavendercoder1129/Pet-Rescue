import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedAchievements } from '../services/achievementService.js';

dotenv.config();

const runSeed = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pet_rescue';
  console.log('[Seed] Connecting to MongoDB:', uri);
  await mongoose.connect(uri);

  console.log('[Seed] Seeding default achievement badge definitions...');
  await seedAchievements();

  console.log('[Seed] Done! Default achievement badges successfully created/verified.');
  await mongoose.disconnect();
  process.exit(0);
};

runSeed().catch((err) => {
  console.error('[Seed] Error seeding achievements:', err);
  process.exit(1);
});
