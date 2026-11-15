import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import RescueCase from '../models/RescueCase.js';
import Donation from '../models/Donation.js';

dotenv.config();

const runModule6Tests = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pet_rescue';
  await mongoose.connect(uri);
  console.log('====================================================');
  console.log('STARTING MODULE 6: SIMULATED DONATIONS SYSTEM TESTS');
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

  // Setup Users
  // 1. Admin
  const adminLog = await post('/auth/login', {
    email: 'admin@petrescue.example',
    password: process.env.ADMIN_PASSWORD || 'AdminPass2026!',
  });
  const adminToken = adminLog.body.token;

  // 2. Donor 1 (Generous Donor)
  await User.deleteOne({ email: 'module6_donor1@petrescue.example' });
  await post('/auth/register', {
    name: 'Aarav Sharma',
    email: 'module6_donor1@petrescue.example',
    password: 'Password123!',
    role: 'donor',
  });
  const donor1Log = await post('/auth/login', {
    email: 'module6_donor1@petrescue.example',
    password: 'Password123!',
  });
  const donor1Token = donor1Log.body.token;
  const donor1Id = donor1Log.body.user._id;

  // 3. Donor 2 (Other Donor)
  await User.deleteOne({ email: 'module6_donor2@petrescue.example' });
  await post('/auth/register', {
    name: 'Meera Iyer',
    email: 'module6_donor2@petrescue.example',
    password: 'Password123!',
    role: 'donor',
  });
  const donor2Log = await post('/auth/login', {
    email: 'module6_donor2@petrescue.example',
    password: 'Password123!',
  });
  const donor2Token = donor2Log.body.token;

  // 4. Rescuer
  await User.deleteOne({ email: 'module6_rescuer@petrescue.example' });
  await post('/auth/register', {
    name: 'Rohan Rescuer',
    email: 'module6_rescuer@petrescue.example',
    password: 'Password123!',
    role: 'rescuer',
  });
  await User.updateOne(
    { email: 'module6_rescuer@petrescue.example' },
    { rescuerVerificationStatus: 'approved' }
  );
  const rescuerLog = await post('/auth/login', {
    email: 'module6_rescuer@petrescue.example',
    password: 'Password123!',
  });
  const rescuerToken = rescuerLog.body.token;

  // Create Cases in different states
  // Case A: Approved & Active
  const caseApproved = await RescueCase.create({
    title: 'Bruno — Pelvic Fracture Support',
    animalName: 'Bruno',
    animalType: 'Dog',
    location: 'Indiranagar, Bangalore',
    description: 'Found injured on road side.',
    injuryType: 'Pelvic Fracture',
    injuryDescription: 'Multiple hairline fractures in pelvic girdle.',
    medicalCondition: 'Under observation at Cessna Lifeline.',
    urgencyLevel: 'Urgent',
    estimatedTreatmentCost: 20000,
    fundraisingGoal: 20000,
    amountCollected: 5000,
    verificationStatus: 'Approved',
    campaignStatus: 'Active',
    createdBy: rescuerLog.body.user._id,
  });

  // Case B: Pending
  const casePending = await RescueCase.create({
    title: 'Luna — Awaiting Review',
    animalName: 'Luna',
    animalType: 'Cat',
    location: 'Koramangala, Bangalore',
    description: 'Stray kitten rescued.',
    injuryType: 'Eye Infection',
    injuryDescription: 'Corneal trauma.',
    medicalCondition: 'Needs antibiotic surgery.',
    urgencyLevel: 'Normal',
    estimatedTreatmentCost: 6000,
    fundraisingGoal: 6000,
    amountCollected: 0,
    verificationStatus: 'Pending',
    campaignStatus: 'Pending',
    createdBy: rescuerLog.body.user._id,
  });

  // Case C: Rejected
  const caseRejected = await RescueCase.create({
    title: 'Max — Incomplete Information',
    animalName: 'Max',
    animalType: 'Dog',
    location: 'Whitefield',
    description: 'Needs help.',
    injuryType: 'Trauma',
    injuryDescription: 'Unspecified trauma.',
    medicalCondition: 'Not specified.',
    urgencyLevel: 'Normal',
    estimatedTreatmentCost: 5000,
    fundraisingGoal: 5000,
    amountCollected: 0,
    verificationStatus: 'Rejected',
    campaignStatus: 'Rejected',
    createdBy: rescuerLog.body.user._id,
  });

  // Case D: Resolved
  const caseResolved = await RescueCase.create({
    title: 'Charlie — Fully Funded & Recovered',
    animalName: 'Charlie',
    animalType: 'Dog',
    location: 'Jayanagar',
    description: 'Surgery completed.',
    injuryType: 'Fracture',
    injuryDescription: 'Femur fracture repaired.',
    medicalCondition: 'Discharged to foster care.',
    urgencyLevel: 'Normal',
    estimatedTreatmentCost: 15000,
    fundraisingGoal: 15000,
    amountCollected: 15000,
    verificationStatus: 'Approved',
    campaignStatus: 'Resolved',
    createdBy: rescuerLog.body.user._id,
  });

  console.log('\n--- 1. Authentication & Authorization for Donations ---');
  // Test 1: Authenticated donor can create a simulated donation
  const don1 = await post(
    '/donations',
    {
      caseId: caseApproved._id.toString(),
      amount: 500,
      donationMessage: 'Get well soon Bruno!',
      isAnonymous: false,
      idempotencyKey: 'idemp_test_1',
    },
    donor1Token
  );
  assert(
    don1.status === 201 &&
      don1.body.success &&
      don1.body.donation.donationReference.startsWith('SIM-') &&
      don1.body.donation.isSimulated === true &&
      don1.body.donation.transactionStatus === 'Simulated',
    '1. Authenticated donor can create a simulated donation'
  );

  const donationId = don1.body.donation._id;
  const donRef = don1.body.donation.donationReference;

  // Test 2: Unauthenticated user cannot create a donation
  const donAnon = await post('/donations', {
    caseId: caseApproved._id.toString(),
    amount: 500,
  });
  assert(
    donAnon.status === 401,
    '2. Unauthenticated user cannot create a donation (401 Unauthorized)'
  );

  console.log('\n--- 2. Amount Validations (Zero, Negative, Excessively Large) ---');
  // Test 3: Invalid amounts (strings, NaN) rejected
  const donNaN = await post(
    '/donations',
    { caseId: caseApproved._id.toString(), amount: 'invalid-amount' },
    donor1Token
  );
  assert(donNaN.status === 400, '3. Invalid non-numeric amounts are rejected (400 Bad Request)');

  // Test 4: Zero and negative amounts rejected
  const donZero = await post(
    '/donations',
    { caseId: caseApproved._id.toString(), amount: 0 },
    donor1Token
  );
  const donNeg = await post(
    '/donations',
    { caseId: caseApproved._id.toString(), amount: -250 },
    donor1Token
  );
  const donTooSmall = await post(
    '/donations',
    { caseId: caseApproved._id.toString(), amount: 5 },
    donor1Token
  );
  assert(
    donZero.status === 400 && donNeg.status === 400 && donTooSmall.status === 400,
    '4. Zero, negative, and sub-minimum (<₹10) amounts are rejected'
  );

  // Test 5: Excessively large amounts rejected (>₹500,000)
  const donTooLarge = await post(
    '/donations',
    { caseId: caseApproved._id.toString(), amount: 1000000 },
    donor1Token
  );
  assert(
    donTooLarge.status === 400,
    '5. Excessively large amounts (>₹500,000) are rejected (400 Bad Request)'
  );

  console.log('\n--- 3. Campaign State Restrictions ---');
  // Test 6: Pending cases cannot receive donations
  const donPending = await post(
    '/donations',
    { caseId: casePending._id.toString(), amount: 500 },
    donor1Token
  );
  assert(
    donPending.status === 400 && donPending.body.message.includes('Pending'),
    '6. Pending cases cannot receive donations'
  );

  // Test 7: Rejected cases cannot receive donations
  const donRejected = await post(
    '/donations',
    { caseId: caseRejected._id.toString(), amount: 500 },
    donor1Token
  );
  assert(
    donRejected.status === 400 && donRejected.body.message.includes('Rejected'),
    '7. Rejected cases cannot receive donations'
  );

  // Test 8: Resolved or inactive cases cannot receive donations
  const donResolved = await post(
    '/donations',
    { caseId: caseResolved._id.toString(), amount: 500 },
    donor1Token
  );
  assert(
    donResolved.status === 400 && donResolved.body.message.includes('Resolved'),
    '8. Resolved or inactive cases cannot receive donations'
  );

  console.log('\n--- 4. Uniqueness, Idempotency & Campaign Totals ---');
  // Test 9: Unique references generated
  const don2 = await post(
    '/donations',
    {
      caseId: caseApproved._id.toString(),
      amount: 250,
      isAnonymous: true,
      idempotencyKey: 'idemp_test_2',
    },
    donor2Token
  );
  assert(
    don2.status === 201 &&
      don2.body.donation.donationReference !== donRef &&
      don2.body.donation.donationReference.startsWith('SIM-'),
    '9. Donation references are unique across transactions'
  );

  // Test 10: Duplicate submission using same idempotency key returns existing donation without creating duplicate
  const donDupe = await post(
    '/donations',
    {
      caseId: caseApproved._id.toString(),
      amount: 500,
      donationMessage: 'Get well soon Bruno!',
      idempotencyKey: 'idemp_test_1', // Re-sending with same key
    },
    donor1Token
  );
  assert(
    donDupe.status === 200 &&
      donDupe.body.donation.donationReference === donRef &&
      donDupe.body.isDuplicate === true,
    '10. Duplicate submissions do not create duplicate donations (idempotency enforced)'
  );

  // Test 11: Campaign totals update correctly
  // Original amountCollected was 5000. don1 added 500. don2 added 250.
  const updatedCase = await RescueCase.findById(caseApproved._id);
  assert(
    updatedCase.amountCollected === 5750,
    `11. Campaign amountCollected updated safely (Expected 5750, got ${updatedCase.amountCollected})`
  );

  console.log('\n--- 5. Donor Privacy, Receipts & Isolation ---');
  // Test 13: Donors can view only their own history
  const myDonations1 = await get('/donations/my', donor1Token);
  assert(
    myDonations1.status === 200 &&
      myDonations1.body.donations.length === 1 &&
      myDonations1.body.donations[0]._id === donationId,
    '13. Donors can view their own donation history with summary stats'
  );

  const myDonations2 = await get('/donations/my', donor2Token);
  assert(
    myDonations2.status === 200 &&
      myDonations2.body.donations.length === 1 &&
      myDonations2.body.donations[0]._id === don2.body.donation._id,
    '13b. Donor 2 sees only their own history and not Donor 1\'s records'
  );

  // Test 14: Donors cannot view other donors' private receipts
  const receiptStolenTry = await get(`/donations/${donationId}`, donor2Token);
  assert(
    receiptStolenTry.status === 403,
    '14. Donors cannot view other donors\' private receipts (403 Forbidden)'
  );

  // Owner can view receipt
  const receiptOwner = await get(`/donations/${donationId}`, donor1Token);
  assert(
    receiptOwner.status === 200 &&
      receiptOwner.body.donation.donationReference === donRef &&
      receiptOwner.body.donation.paymentMethod === 'Simulation Only',
    '14b. Donor can retrieve their own detailed receipt'
  );

  // Test 15: Anonymous donations preference recorded
  assert(
    don2.body.donation.isAnonymous === true,
    '15. Anonymous donation preference recorded correctly'
  );

  console.log('\n--- 6. Admin Overview & Role Protection ---');
  // Test 16: Admin can access donation overview and stats
  const adminDonationsRes = await get('/admin/donations', adminToken);
  const adminStatsRes = await get('/admin/donations/stats', adminToken);
  assert(
    adminDonationsRes.status === 200 &&
      adminDonationsRes.body.donations.length >= 2 &&
      adminStatsRes.status === 200 &&
      adminStatsRes.body.stats.totalSimulatedAmount >= 750,
    '16. Admin can access donation overview, filters, and aggregate statistics'
  );

  // Admin can also view any receipt for audit
  const adminReceiptAudit = await get(`/donations/${donationId}`, adminToken);
  assert(
    adminReceiptAudit.status === 200 && adminReceiptAudit.body.donation._id === donationId,
    '16b. Admin can audit any donation receipt'
  );

  // Test 17: Non-admin users cannot access admin donation APIs
  const donorAdminStatsTry = await get('/admin/donations/stats', donor1Token);
  const rescuerAdminDonTry = await get('/admin/donations', rescuerToken);
  assert(
    donorAdminStatsTry.status === 403 && rescuerAdminDonTry.status === 403,
    '17. Non-admin users cannot access admin donation APIs (403 Forbidden)'
  );

  // Test 18 & 19: Receipts clearly identify simulated transactions; no real payment credentials exist
  const sampleDoc = await Donation.findById(donationId).lean();
  assert(
    sampleDoc.isSimulated === true &&
      sampleDoc.paymentMethod === 'Simulation Only' &&
      sampleDoc.cardNumber === undefined &&
      sampleDoc.cvv === undefined &&
      sampleDoc.upiId === undefined &&
      sampleDoc.bankAccount === undefined,
    '18 & 19. Records strictly identify simulation; no payment gateways or financial accounts stored'
  );

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
};

runModule6Tests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
