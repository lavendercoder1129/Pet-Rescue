import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const runTests = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pet_rescue';
  await mongoose.connect(uri);
  console.log('--- STARTING BACKEND AUTH TEST SUITE ---');

  const BASE_URL = 'http://localhost:5000/api';

  // Helper for fetch
  const post = async (endpoint, data, token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    const body = await res.json().catch(() => ({}));
    return { status: res.status, body, headers: res.headers };
  };

  const get = async (endpoint, token) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${endpoint}`, { headers });
    const body = await res.json().catch(() => ({}));
    return { status: res.status, body };
  };

  // Clean test users
  await User.deleteMany({ email: { $in: [
    'test_donor@example.com',
    'test_rescuer@example.com',
    'fake_admin@example.com',
    'dup_user@example.com'
  ] } });

  let testsPassed = 0;
  let testsFailed = 0;

  const assert = (condition, name) => {
    if (condition) {
      console.log(`✓ [PASS] ${name}`);
      testsPassed++;
    } else {
      console.error(`✗ [FAIL] ${name}`);
      testsFailed++;
    }
  };

  // 1. Donor registration succeeds
  const r1 = await post('/auth/register', {
    name: 'Ananya Donor',
    email: 'test_donor@example.com',
    password: 'Password123',
    role: 'donor',
  });
  assert(r1.status === 201 && r1.body.user.role === 'donor' && r1.body.token, '1. Donor registration succeeds');
  const donorToken = r1.body.token;

  // 2. Rescuer registration succeeds with pending verification
  const r2 = await post('/auth/register', {
    name: 'Rahul Rescuer',
    email: 'test_rescuer@example.com',
    password: 'Password123',
    role: 'rescuer',
  });
  assert(r2.status === 201 && r2.body.user.role === 'rescuer' && r2.body.user.rescuerVerificationStatus === 'pending', '2. Rescuer registration succeeds with pending verification');
  const rescuerToken = r2.body.token;

  // 3. Admin cannot be registered publicly
  const r3 = await post('/auth/register', {
    name: 'Hacker',
    email: 'fake_admin@example.com',
    password: 'Password123',
    role: 'admin',
  });
  assert(r3.status === 403, '3. Public registration rejects admin role');

  // 4. Duplicate email registration rejected
  const r4 = await post('/auth/register', {
    name: 'Duplicate',
    email: 'test_donor@example.com',
    password: 'Password123',
    role: 'donor',
  });
  assert(r4.status === 409, '4. Duplicate email registration rejected (409)');

  // 5. Invalid email is rejected
  const r5 = await post('/auth/register', {
    name: 'Bad Email',
    email: 'notanemail',
    password: 'Password123',
    role: 'donor',
  });
  assert(r5.status === 400, '5. Invalid email format rejected');

  // 6. Weak password rejected
  const r6 = await post('/auth/register', {
    name: 'Short Pass',
    email: 'shortpass@example.com',
    password: 'short',
    role: 'donor',
  });
  assert(r6.status === 400, '6. Weak password rejected (< 8 chars)');

  // 7. Passwords stored as hash
  const dbUser = await User.findOne({ email: 'test_donor@example.com' }).select('+passwordHash');
  assert(dbUser && dbUser.passwordHash !== 'Password123' && dbUser.passwordHash.startsWith('$2'), '7. Password stored as secure bcrypt hash');

  // 8. Valid login succeeds
  const r8 = await post('/auth/login', {
    email: 'test_donor@example.com',
    password: 'Password123',
  });
  assert(r8.status === 200 && r8.body.token && r8.body.user.email === 'test_donor@example.com', '8. Valid login succeeds');

  // 9. Invalid login fails safely
  const r9 = await post('/auth/login', {
    email: 'test_donor@example.com',
    password: 'WrongPassword999',
  });
  assert(r9.status === 401 && !r9.body.token, '9. Invalid login fails safely (401)');

  // 10. /api/auth/me works with valid token
  const r10 = await get('/auth/me', donorToken);
  assert(r10.status === 200 && r10.body.user.name === 'Ananya Donor', '10. /api/auth/me returns safe profile');

  // 11. Protected routes reject unauthenticated
  const r11 = await get('/auth/me');
  assert(r11.status === 401, '11. Protected route rejects unauthenticated request');

  // Admin login for testing admin routes
  const rAdminLogin = await post('/auth/login', {
    email: 'admin@petrescue.example',
    password: process.env.ADMIN_PASSWORD || 'AdminPass2026!',
  });
  const adminToken = rAdminLogin.body.token;

  // 12. Donors cannot access Admin routes
  const r12 = await get('/admin/dashboard', donorToken);
  assert(r12.status === 403, '12. Donors cannot access Admin dashboard (403)');

  // 13. Rescuers cannot access Admin routes
  const r13 = await get('/admin/dashboard', rescuerToken);
  assert(r13.status === 403, '13. Rescuers cannot access Admin dashboard (403)');

  // 14. Admin can access Admin routes
  const r14 = await get('/admin/dashboard', adminToken);
  assert(r14.status === 200 && r14.body.stats, '14. Admin can access Admin dashboard (200)');

  // 15. Logout clears cookie
  const r15 = await post('/auth/logout', {});
  assert(r15.status === 200, '15. Logout endpoint responds 200');

  console.log('----------------------------------------------------');
  console.log(`TEST RESULTS: ${testsPassed} passed, ${testsFailed} failed.`);
  console.log('----------------------------------------------------');

  await mongoose.disconnect();
  process.exit(testsFailed > 0 ? 1 : 0);
};

runTests();
