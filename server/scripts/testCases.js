import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import RescueCase from '../models/RescueCase.js';

dotenv.config();

const runCaseTests = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pet_rescue';
  await mongoose.connect(uri);
  console.log('--- STARTING MODULE 4 RESCUE CASES TEST SUITE ---');

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

  const patch = async (endpoint, data, token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });
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

  // 1. Get tokens for Admin, Approved Rescuer, Pending Rescuer, and Donor
  const adminLog = await post('/auth/login', {
    email: 'admin@petrescue.example',
    password: process.env.ADMIN_PASSWORD || 'AdminPass2026!',
  });
  const adminToken = adminLog.body.token;

  // Ensure an approved rescuer and a pending rescuer
  let appRescuer = await User.findOne({ email: 'seed_rescuer@petrescue.example' });
  const appLog = await post('/auth/login', {
    email: 'seed_rescuer@petrescue.example',
    password: 'RescuerPass2026!',
  });
  const approvedRescuerToken = appLog.body.token;

  // Create or login a pending rescuer
  await User.deleteOne({ email: 'pending_rescuer_test@petrescue.example' });
  const pendingReg = await post('/auth/register', {
    name: 'Pending Rescuer',
    email: 'pending_rescuer_test@petrescue.example',
    password: 'Password123!',
    role: 'rescuer',
  });
  const pendingRescuerToken = pendingReg.body.token;

  // Create or login a donor
  await User.deleteOne({ email: 'donor_case_test@petrescue.example' });
  const donorReg = await post('/auth/register', {
    name: 'Generous Donor',
    email: 'donor_case_test@petrescue.example',
    password: 'Password123!',
    role: 'donor',
  });
  const donorToken = donorReg.body.token;

  // Test 1: Approved rescuer can submit a case
  const submitRes = await post(
    '/cases',
    {
      title: 'Tommy — Street Dog with Fractured Leg',
      animalName: 'Tommy',
      animalType: 'Dog',
      breed: 'Indie',
      location: 'Jayanagar 4th Block',
      description: 'Found limping severely after being chased by pack.',
      injuryType: 'Closed Tibia Fracture',
      injuryDescription: 'Right hind leg swollen and non-weight bearing.',
      medicalCondition: 'Splinted and given pain relief.',
      urgencyLevel: 'Urgent',
      estimatedTreatmentCost: 6500,
      fundraisingGoal: 6500,
      imageUrls: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1'],
    },
    approvedRescuerToken
  );
  assert(
    submitRes.status === 201 &&
      submitRes.body.case.verificationStatus === 'Pending' &&
      submitRes.body.case.campaignStatus === 'Pending',
    '1. Rescuer can submit a case and it defaults to Pending'
  );
  const createdCaseId = submitRes.body.case._id;

  // Test 2: Unverified/pending rescuer CANNOT submit a case
  const unverifiedRes = await post(
    '/cases',
    {
      title: 'Unauthorized Case',
      animalName: 'Ghost',
      location: 'Unknown',
      description: 'Should fail',
      injuryDescription: 'Test',
      medicalCondition: 'Test',
      estimatedTreatmentCost: 1000,
      fundraisingGoal: 1000,
    },
    pendingRescuerToken
  );
  assert(unverifiedRes.status === 403, '2. Unverified rescuer cannot submit a case (403)');

  // Test 3: Donor cannot submit a rescue case
  const donorSubmitRes = await post(
    '/cases',
    {
      title: 'Donor Attempt',
      animalName: 'Pet',
      location: 'Road',
      description: 'Test',
      injuryDescription: 'Test',
      medicalCondition: 'Test',
      estimatedTreatmentCost: 1000,
      fundraisingGoal: 1000,
    },
    donorToken
  );
  assert(donorSubmitRes.status === 403, '3. Donor cannot submit a rescue case (403)');

  // Test 4: Pending case is NOT publicly visible in GET /api/cases
  const pubList1 = await get('/cases');
  const foundInPublic = pubList1.body.cases.some((c) => c._id === createdCaseId);
  assert(!foundInPublic, '4. Pending case is NOT publicly visible in /api/cases');

  // Test 5: Pending case returns 404 in public GET /api/cases/:id
  const pubDetailPending = await get(`/cases/${createdCaseId}`);
  assert(pubDetailPending.status === 404, '5. Pending case returns 404 on public detail route');

  // Test 6: Admin can view all cases including Pending
  const adminCasesRes = await get('/cases/admin/all', adminToken);
  const foundByAdmin = adminCasesRes.body.cases.some((c) => c._id === createdCaseId);
  assert(adminCasesRes.status === 200 && foundByAdmin, '6. Admin can view pending cases');

  // Test 7: Admin can approve a case
  const approveRes = await patch(
    `/cases/admin/${createdCaseId}/approve`,
    { reviewNote: 'Clinic estimate verified by admin.' },
    adminToken
  );
  assert(
    approveRes.status === 200 &&
      approveRes.body.case.verificationStatus === 'Approved' &&
      approveRes.body.case.campaignStatus === 'Active',
    '7. Admin can approve a case -> Status becomes Approved & Active'
  );

  // Test 8: Approved case now appears publicly
  const pubList2 = await get('/cases');
  const nowInPublic = pubList2.body.cases.some((c) => c._id === createdCaseId);
  assert(nowInPublic, '8. Approved case now appears in public listing');

  // Test 9: Public detail works for approved case
  const pubDetailApproved = await get(`/cases/${createdCaseId}`);
  assert(
    pubDetailApproved.status === 200 && pubDetailApproved.body.case.title.includes('Tommy'),
    '9. Approved case details load successfully publicly'
  );

  // Test 10: Search filter works
  const searchRes = await get('/cases?search=Tommy');
  assert(
    searchRes.status === 200 &&
      searchRes.body.cases.length > 0 &&
      searchRes.body.cases[0].animalName === 'Tommy',
    '10. Public search filter matches animal name or title'
  );

  // Test 11: Animal type filter works
  const catFilterRes = await get('/cases?animalType=Cat');
  assert(
    catFilterRes.status === 200 &&
      catFilterRes.body.cases.every((c) => c.animalType === 'Cat'),
    '11. Animal type filter returns only matching animal type'
  );

  // Test 12: Admin can reject a case with a mandatory review note
  const rejectWithoutNote = await patch(`/cases/admin/${createdCaseId}/reject`, {}, adminToken);
  assert(rejectWithoutNote.status === 400, '12. Rejection requires a reviewNote reason (400)');

  const rejectWithNote = await patch(
    `/cases/admin/${createdCaseId}/reject`,
    { reviewNote: 'Duplicate report already handled by another shelter.' },
    adminToken
  );
  assert(
    rejectWithNote.status === 200 && rejectWithNote.body.case.verificationStatus === 'Rejected',
    '13. Admin can reject a case with a note -> Status becomes Rejected'
  );

  // Test 14: Rejected case is immediately removed from public listing
  const pubList3 = await get('/cases');
  const rejectedInPublic = pubList3.body.cases.some((c) => c._id === createdCaseId);
  assert(!rejectedInPublic, '14. Rejected case is NOT in public listing');

  // Test 15: Rescuer can view their own cases (approved, pending, or rejected)
  const myCasesRes = await get('/cases/my', approvedRescuerToken);
  const foundInMyCases = myCasesRes.body.cases.some((c) => c._id === createdCaseId);
  assert(myCasesRes.status === 200 && foundInMyCases, '15. Rescuers can view their own submissions');

  console.log('----------------------------------------------------');
  console.log(`TEST RESULTS: ${passed} passed, ${failed} failed.`);
  console.log('----------------------------------------------------');

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
};

runCaseTests();
