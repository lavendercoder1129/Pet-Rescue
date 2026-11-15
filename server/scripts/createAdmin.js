import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

/**
 * Secure Backend Seed Script to initialize the first Admin account.
 * Admin accounts CANNOT be created through public registration.
 *
 * Usage:
 *   ADMIN_NAME="System Admin" \
 *   ADMIN_EMAIL="admin@petrescue.example" \
 *   ADMIN_PASSWORD="YourStrongAdminPassword123" \
 *   node server/scripts/createAdmin.js
 */
const createAdmin = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pet_rescue';

  const name = process.env.ADMIN_NAME || 'Pet Rescue Administrator';
  const email = (process.env.ADMIN_EMAIL || 'admin@petrescue.example').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || 'AdminPass2026!';

  if (password.length < 8) {
    console.error('Error: Admin password must be at least 8 characters long.');
    process.exit(1);
  }

  try {
    console.log(`Connecting to database at ${uri}...`);
    await mongoose.connect(uri);
    console.log('Connected to MongoDB.');

    // Check if admin already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.role === 'admin') {
        console.log(`Admin account with email [${email}] already exists. No changes made.`);
        process.exit(0);
      } else {
        console.log(`User [${email}] exists with role [${existingUser.role}]. Elevating to admin...`);
        existingUser.role = 'admin';
        existingUser.passwordHash = await User.hashPassword(password);
        await existingUser.save();
        console.log(`User [${email}] is now an Admin.`);
        process.exit(0);
      }
    }

    // Create new admin
    const passwordHash = await User.hashPassword(password);
    const newAdmin = await User.create({
      name,
      email,
      phone: '+91 98000 00000',
      passwordHash,
      role: 'admin',
      rescuerVerificationStatus: 'not_applicable',
      isActive: true,
    });

    console.log('----------------------------------------------------');
    console.log('Admin account created successfully!');
    console.log(`Name:  ${newAdmin.name}`);
    console.log(`Email: ${newAdmin.email}`);
    console.log(`Role:  ${newAdmin.role}`);
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('Failed to create admin account:', error.message);
    process.exit(1);
  }
};

createAdmin();
