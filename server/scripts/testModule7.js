import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import RescueCase from '../models/RescueCase.js';
import Donation from '../models/Donation.js';
import FundAllocation from '../models/FundAllocation.js';

dotenv.config();

const runModule7Tests = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pet_rescue';
  await mongoose.connect(uri);
  console.log('====================================================');
  console.log('STARTING MODULE 7: FUND ALLOCATION & TRANSPARENCY TESTS');
  console.log('====================================================');

  const BASE_URL = 'http://localhost:5000/api';

  const post = async (endpoint, data, token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    const body = await res.json().catch(() => ({}));
    return { status: res.status, body };
  };

  const get = async (endpoint, token) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${endpoint}`, { headers });
    const body = await res.json().catch(() => ({}));
    return { status: res.status, body };
  };

  let passed = 0;
  let failed = 0;
  const assert = (condition, name) => {
    if (condition) {
      console.log(`✓ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${name}`);
      failed++;
    }
  };

  // Setup Accounts
  // 1. Admin
  let adminCheck = await User.findOne({ email: 'admin@petrescue.example' });
  if (!adminCheck) {
    const passwordHash = await User.hashPassword(process.env.ADMIN_PASSWORD || 'AdminPass2026!');
    adminCheck = await User.create({
      name: 'System Administrator',
      email: 'admin@petrescue.example',
      phone: '+91 98000 00000',
      passwordHash,
      role: 'admin',
      rescuerVerificationStatus: 'not_applicable',
      isActive: true,
    });
  }
  const adminLog = await post('/auth/login', {
    email: 'admin@petrescue.example',
    password: process.env.ADMIN_PASSWORD || 'AdminPass2026!',
  });
  const adminToken = adminLog.body.token;

  // 2. Donor
  await User.deleteOne({ email: 'module7_donor@petrescue.example' });
  await post('/auth/register', {
    name: 'Siddharth Donor',
    email: 'module7_donor@petrescue.example',
    password: 'Password123!',
    role: 'donor',
  });
  const donorLog = await post('/auth/login', {
    email: 'module7_donor@petrescue.example',
    password: 'Password123!',
  });
  const donorToken = donorLog.body.token;

  // 3. Rescuer
  await User.deleteOne({ email: 'module7_rescuer@petrescue.example' });
  await post('/auth/register', {
    name: 'Ananya Rescuer',
    email: 'module7_rescuer@petrescue.example',
    password: 'Password123!',
    role: 'rescuer',
  });
  await User.updateOne(
    { email: 'module7_rescuer@petrescue.example' },
    { rescuerVerificationStatus: 'approved' }
  );
  const rescuerLog = await post('/auth/login', {
    email: 'module7_rescuer@petrescue.example',
    password: 'Password123!',
  });
  const rescuerToken = rescuerLog.body.token;

  // Create a clean test case
  const testCase = await RescueCase.create({
    title: 'Simba — Compound Femur Fracture',
    animalName: 'Simba',
    animalType: 'Dog',
    location: 'BTM Layout, Bangalore',
    description: 'Stray dog hit by a two-wheeler, compound femur fracture.',
    injuryType: 'Femur Fracture',
    injuryDescription: 'Bone fragment exposed, severe soft tissue swelling.',
    medicalCondition: 'Under surgical stabilization at Cessna Lifeline.',
    urgencyLevel: 'Critical',
    estimatedTreatmentCost: 25000,
    fundraisingGoal: 25000,
    amountCollected: 0,
    verificationStatus: 'Approved',
    campaignStatus: 'Active',
    createdBy: rescuerLog.body.user._id,
  });

  console.log('\n--- 1. Public Transparency API Access & Security ---');
  // Test 1: Public users can view sanitized transparency summaries
  const pubSum = await get('/transparency/summary');
  assert(
    pubSum.status === 200 &&
      pubSum.body.success &&
      pubSum.body.isSimulated === true &&
      pubSum.body.disclaimer.includes('academic demonstration'),
    '1. Public users can view sanitized transparency summaries'
  );

  const pubCases = await get('/transparency/cases');
  assert(
    pubCases.status === 200 &&
      pubCases.body.success &&
      Array.isArray(pubCases.body.cases),
    '1b. Public users can view campaign-level transparency summaries'
  );

  // Test 2: Public users / donors cannot access admin financial endpoints
  const anonAdminFunds = await get('/admin/funds/summary');
  const donorAdminFunds = await get('/admin/funds/summary', donorToken);
  const rescuerAdminFunds = await get('/admin/funds/allocations', rescuerToken);
  assert(
    anonAdminFunds.status === 401 &&
      donorAdminFunds.status === 403 &&
      rescuerAdminFunds.status === 403,
    '2. Public users, donors, and rescuers cannot access admin financial endpoints (401/403)'
  );

  // Test 3: Admin can view complete fund summary
  const adminSummaryRes = await get('/admin/funds/summary', adminToken);
  assert(
    adminSummaryRes.status === 200 &&
      adminSummaryRes.body.success &&
      adminSummaryRes.body.stats.totalDonations !== undefined &&
      adminSummaryRes.body.stats.categoryBreakdown !== undefined,
    '3. Admin can view complete fund summary and category breakdowns'
  );

  console.log('\n--- 2. Simulated Pledges & Balance Verification ---');
  // Donate ₹10,000 to Simba
  const donRes = await post(
    '/donations',
    {
      caseId: testCase._id.toString(),
      amount: 10000,
      donationMessage: 'Supporting Simba surgical care',
    },
    donorToken
  );
  assert(
    donRes.status === 201 && donRes.body.success,
    '2a. Simulated donation of ₹10,000 recorded to test case'
  );

  // Check case detail route: financial breakdown attached
  const caseDetailRes = await get(`/cases/${testCase._id}`);
  assert(
    caseDetailRes.status === 200 &&
      caseDetailRes.body.case.financials.totalDonations === 10000 &&
      caseDetailRes.body.case.financials.unallocatedFunds === 10000 &&
      caseDetailRes.body.case.financials.totalAllocated === 0,
    '16. Case details endpoint returns verified financial metrics'
  );

  console.log('\n--- 3. Fund Allocation Validations & Limits ---');
  // Test 5: Allocation beyond available funds is rejected
  const overAlloc = await post(
    '/admin/funds/allocations',
    {
      caseId: testCase._id.toString(),
      amount: 15000, // exceeds available 10000
      allocationCategory: 'Surgery',
      description: 'Orthopedic plate fixation',
    },
    adminToken
  );
  assert(
    overAlloc.status === 400 && overAlloc.body.message.includes('exceeds available unallocated funds'),
    '5. Allocation beyond available unallocated funds is strictly rejected (400 Bad Request)'
  );

  // Test 12: Negative and zero allocation values are rejected
  const negAlloc = await post(
    '/admin/funds/allocations',
    {
      caseId: testCase._id.toString(),
      amount: -500,
      allocationCategory: 'Surgery',
      description: 'Invalid negative test',
    },
    adminToken
  );
  const zeroAlloc = await post(
    '/admin/funds/allocations',
    {
      caseId: testCase._id.toString(),
      amount: 0,
      allocationCategory: 'Surgery',
      description: 'Invalid zero test',
    },
    adminToken
  );
  assert(
    negAlloc.status === 400 && zeroAlloc.status === 400,
    '12. Negative and zero financial allocation values are rejected'
  );

  // Test 4: Admin can allocate available funds
  const validAlloc1 = await post(
    '/admin/funds/allocations',
    {
      caseId: testCase._id.toString(),
      amount: 6000,
      allocationCategory: 'Surgery',
      description: 'Orthopedic plate and external fixator implants at Cessna Lifeline',
    },
    adminToken
  );
  assert(
    validAlloc1.status === 201 &&
      validAlloc1.body.success &&
      validAlloc1.body.allocation.allocationReference.startsWith('ALLOC-') &&
      validAlloc1.body.allocation.status === 'Active',
    '4. Admin can allocate available funds with unique reference code'
  );

  const alloc1Id = validAlloc1.body.allocation._id;

  // Test 6 & 10: Unallocated funds are calculated correctly (10000 - 6000 = 4000)
  const caseAfterAlloc1 = await get(`/cases/${testCase._id}`);
  const fin1 = caseAfterAlloc1.body.case.financials;
  assert(
    fin1.totalAllocated === 6000 &&
      fin1.unallocatedFunds === 4000 &&
      fin1.remainingAllocatedBalance === 6000 &&
      fin1.totalVerifiedSpending === 0,
    '9 & 10. Remaining allocated balance (6000) and unallocated funds (4000) calculated accurately'
  );

  // Test 11: Zero verified spending does not cause division errors
  assert(
    fin1.fundUtilization === 0,
    '11. Zero verified spending handles division safely without NaN or division by zero'
  );

  // Allocate remaining 4000 for Medicines
  const validAlloc2 = await post(
    '/admin/funds/allocations',
    {
      caseId: testCase._id.toString(),
      amount: 4000,
      allocationCategory: 'Medicines',
      description: 'Antibiotics, pain management, and wound dressings',
    },
    adminToken
  );
  assert(
    validAlloc2.status === 201 &&
      validAlloc2.body.caseFinancials.unallocatedFunds === 0 &&
      validAlloc2.body.caseFinancials.totalAllocated === 10000,
    '6. Concurrent/sequential allocation cannot exceed balance (Unallocated reaches exactly ₹0)'
  );

  // Trying to allocate ₹1 now must fail
  const tryExtra = await post(
    '/admin/funds/allocations',
    {
      caseId: testCase._id.toString(),
      amount: 1,
      allocationCategory: 'Shelter',
      description: 'Over-spend try',
    },
    adminToken
  );
  assert(
    tryExtra.status === 400,
    '6b. Subsequent allocation rejected once unallocated funds are exhausted'
  );

  console.log('\n--- 4. Role Protection & Tampering Prevention ---');
  // Test 13 & 14: Donors and Rescuers cannot create allocations
  const donorTryAlloc = await post(
    '/admin/funds/allocations',
    {
      caseId: testCase._id.toString(),
      amount: 1000,
      allocationCategory: 'Food and nutrition',
      description: 'Donor trying to allocate',
    },
    donorToken
  );
  const rescuerTryAlloc = await post(
    '/admin/funds/allocations',
    {
      caseId: testCase._id.toString(),
      amount: 1000,
      allocationCategory: 'Food and nutrition',
      description: 'Rescuer trying to allocate',
    },
    rescuerToken
  );
  assert(
    donorTryAlloc.status === 403 && rescuerTryAlloc.status === 403,
    '13 & 14. Donors and rescuers cannot create or modify allocation records (403 Forbidden)'
  );

  // Test 7: Cancelled allocations are excluded from active totals
  // Set alloc2 to Cancelled
  await FundAllocation.findByIdAndUpdate(validAlloc2.body.allocation._id, {
    status: 'Cancelled',
  });
  const caseAfterCancel = await get(`/cases/${testCase._id}`);
  const finCancelled = caseAfterCancel.body.case.financials;
  assert(
    finCancelled.totalAllocated === 6000 &&
      finCancelled.unallocatedFunds === 4000,
    '7. Cancelled allocations are strictly excluded from active totals, freeing up unallocated funds'
  );

  // Test 8: Verified spending test (Preparation for Module 8)
  // Simulate an approved expense of ₹2,500 on alloc1
  await FundAllocation.findByIdAndUpdate(alloc1Id, {
    amountSpent: 2500,
    status: 'Partially Spent',
  });
  const caseAfterSpending = await get(`/cases/${testCase._id}`);
  const finSpent = caseAfterSpending.body.case.financials;
  assert(
    finSpent.totalVerifiedSpending === 2500 &&
      finSpent.remainingAllocatedBalance === 3500 && // 6000 - 2500
      finSpent.fundUtilization === 42, // (2500 / 6000) * 100 ≈ 42%
    '8. Verified spending updates remaining balance and fund utilization accurately'
  );

  // Test 15: Public API responses do not expose private donor or admin notes
  const publicCaseResponse = await get('/transparency/cases');
  const samplePublicCase = publicCaseResponse.body.cases[0];
  assert(
    samplePublicCase !== undefined &&
      samplePublicCase.donor === undefined &&
      samplePublicCase.allocatedBy === undefined &&
      samplePublicCase.adminNotes === undefined,
    '15. Public transparency API responses do not expose private donor or admin information'
  );

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
};

runModule7Tests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
