import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import User from '../models/User.js';
import RescueCase from '../models/RescueCase.js';
import Donation from '../models/Donation.js';
import FundAllocation from '../models/FundAllocation.js';
import Expense from '../models/Expense.js';

dotenv.config();

const runModule8Tests = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pet_rescue';
  await mongoose.connect(uri);
  console.log('====================================================');
  console.log('STARTING MODULE 8: EXPENSE PROOF & VERIFICATION TESTS');
  console.log('====================================================');

  const BASE_URL = 'http://localhost:5000/api';

  const postJSON = async (endpoint, data, token) => {
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

  const patchJSON = async (endpoint, data, token) => {
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

  const getReq = async (endpoint, token) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${endpoint}`, { headers });
    const body = await res.json().catch(() => ({}));
    return { status: res.status, body, headers: res.headers };
  };

  const postFormData = async (endpoint, formData, token) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
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

  // 1. Setup Accounts
  console.log('\n--- 1. Setting up accounts ---');
  // Admin
  const adminLog = await postJSON('/auth/login', {
    email: 'admin@petrescue.example',
    password: process.env.ADMIN_PASSWORD || 'AdminPass2026!',
  });
  const adminToken = adminLog.body.token;

  // Donor
  await User.deleteOne({ email: 'm8_donor@petrescue.example' });
  await postJSON('/auth/register', {
    name: 'M8 Donor',
    email: 'm8_donor@petrescue.example',
    password: 'Password123!',
    role: 'donor',
  });
  const donorLog = await postJSON('/auth/login', {
    email: 'm8_donor@petrescue.example',
    password: 'Password123!',
  });
  const donorToken = donorLog.body.token;

  // Rescuer A (Verified)
  await User.deleteOne({ email: 'm8_rescuer_a@petrescue.example' });
  await postJSON('/auth/register', {
    name: 'Rescuer Alpha',
    email: 'm8_rescuer_a@petrescue.example',
    password: 'Password123!',
    role: 'rescuer',
  });
  await User.updateOne(
    { email: 'm8_rescuer_a@petrescue.example' },
    { rescuerVerificationStatus: 'approved' }
  );
  const rescuerALog = await postJSON('/auth/login', {
    email: 'm8_rescuer_a@petrescue.example',
    password: 'Password123!',
  });
  const rescuerAToken = rescuerALog.body.token;
  const rescuerAId = rescuerALog.body.user._id;

  // Rescuer B (Verified - Unrelated)
  await User.deleteOne({ email: 'm8_rescuer_b@petrescue.example' });
  await postJSON('/auth/register', {
    name: 'Rescuer Beta',
    email: 'm8_rescuer_b@petrescue.example',
    password: 'Password123!',
    role: 'rescuer',
  });
  await User.updateOne(
    { email: 'm8_rescuer_b@petrescue.example' },
    { rescuerVerificationStatus: 'approved' }
  );
  const rescuerBLog = await postJSON('/auth/login', {
    email: 'm8_rescuer_b@petrescue.example',
    password: 'Password123!',
  });
  const rescuerBToken = rescuerBLog.body.token;

  // Rescuer C (Pending Verification)
  await User.deleteOne({ email: 'm8_rescuer_c@petrescue.example' });
  await postJSON('/auth/register', {
    name: 'Rescuer Gamma Pending',
    email: 'm8_rescuer_c@petrescue.example',
    password: 'Password123!',
    role: 'rescuer',
  });
  const rescuerCLog = await postJSON('/auth/login', {
    email: 'm8_rescuer_c@petrescue.example',
    password: 'Password123!',
  });
  const rescuerCToken = rescuerCLog.body.token;

  // 2. Setup Test Rescue Case, Donation & Fund Allocation
  console.log('\n--- 2. Setting up test case & fund allocation ---');
  await RescueCase.deleteMany({ title: /Module 8 Test Dog/ });
  const testCase = await RescueCase.create({
    title: 'Module 8 Test Dog - Fracture Recovery',
    animalName: 'M8 Sheru',
    animalType: 'Dog',
    breed: 'Indie',
    age: '2 years',
    gender: 'Male',
    location: 'Indiranagar 100ft Road',
    description: 'Emergency case for Module 8 verification testing.',
    injuryType: 'Compound Fracture',
    injuryDescription: 'Compound fracture requiring surgery and splints.',
    medicalCondition: 'Critical surgical trauma',
    urgencyLevel: 'Critical',
    estimatedTreatmentCost: 30000,
    fundraisingGoal: 30000,
    verificationStatus: 'Approved',
    campaignStatus: 'Active',
    createdBy: rescuerAId,
    verifiedBy: adminLog.body.user._id,
    verifiedAt: new Date(),
    isPublished: true,
  });

  // Simulated Donation of 25,000
  const donRes = await postJSON(
    '/donations',
    {
      caseId: testCase._id.toString(),
      amount: 25000,
      donationMessage: 'Support Sheru recovery',
      isAnonymous: false,
    },
    donorToken
  );
  assert(donRes.status === 201, 'Created simulated donation of ₹25,000 for test case');

  // Admin Allocates ₹10,000 for "Surgery"
  const allocRes = await postJSON(
    '/admin/funds/allocations',
    {
      caseId: testCase._id.toString(),
      amount: 10000,
      allocationCategory: 'Surgery',
      description: 'Orthopedic stabilization and bone plate',
    },
    adminToken
  );
  assert(allocRes.status === 201, 'Admin allocated ₹10,000 under Surgery');
  const allocation = allocRes.body.allocation;

  // 3. Test Authorization Controls for Submitting Expenses
  console.log('\n--- 3. Authorization controls for expense submission ---');

  // Dummy file buffer
  const samplePdfBuffer = Buffer.from('%PDF-1.4 Mock Receipt for Veterinary Hospital');
  const samplePngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // Test: Unauthenticated user cannot submit
  const noAuthFd = new FormData();
  noAuthFd.append('rescueCaseId', testCase._id.toString());
  noAuthFd.append('fundAllocationId', allocation._id.toString());
  noAuthFd.append('title', 'Vet Consultation Bill');
  noAuthFd.append('amount', '2000');
  noAuthFd.append('expenseCategory', 'Surgery');
  const noAuthRes = await postFormData('/expenses', noAuthFd, null);
  assert(noAuthRes.status === 401, 'Unauthenticated user rejected (401)');

  // Test: Donor cannot submit expense
  const donorFd = new FormData();
  donorFd.append('rescueCaseId', testCase._id.toString());
  donorFd.append('fundAllocationId', allocation._id.toString());
  donorFd.append('title', 'Vet Consultation Bill');
  donorFd.append('amount', '2000');
  donorFd.append('expenseCategory', 'Surgery');
  const donorRes = await postFormData('/expenses', donorFd, donorToken);
  assert(donorRes.status === 403, 'Donor rejected from submitting expense (403)');

  // Test: Unverified rescuer cannot submit expense
  const unverifiedFd = new FormData();
  unverifiedFd.append('rescueCaseId', testCase._id.toString());
  unverifiedFd.append('fundAllocationId', allocation._id.toString());
  unverifiedFd.append('title', 'Vet Consultation Bill');
  unverifiedFd.append('amount', '2000');
  unverifiedFd.append('expenseCategory', 'Surgery');
  const unverifiedRes = await postFormData('/expenses', unverifiedFd, rescuerCToken);
  assert(unverifiedRes.status === 403, 'Unverified rescuer rejected (403)');

  // Test: Rescuer B cannot submit expense for Rescuer A\'s case
  const wrongRescuerFd = new FormData();
  wrongRescuerFd.append('rescueCaseId', testCase._id.toString());
  wrongRescuerFd.append('fundAllocationId', allocation._id.toString());
  wrongRescuerFd.append('title', 'Vet Bill');
  wrongRescuerFd.append('amount', '2000');
  wrongRescuerFd.append('expenseCategory', 'Surgery');
  const wrongRescuerRes = await postFormData('/expenses', wrongRescuerFd, rescuerBToken);
  assert(wrongRescuerRes.status === 403, 'Rescuer cannot submit expense for someone else\'s case (403)');

  // 4. Input & File Validations
  console.log('\n--- 4. Input & file validation checks ---');

  // Test: Missing documents rejected (400)
  const noDocsFd = new FormData();
  noDocsFd.append('rescueCaseId', testCase._id.toString());
  noDocsFd.append('fundAllocationId', allocation._id.toString());
  noDocsFd.append('title', 'Surgery OT Bill');
  noDocsFd.append('amount', '2500');
  noDocsFd.append('expenseCategory', 'Surgery');
  const noDocsRes = await postFormData('/expenses', noDocsFd, rescuerAToken);
  assert(noDocsRes.status === 400 && noDocsRes.body.message.includes('document'), 'Submission without documents rejected (400)');

  // Test: Invalid / negative / zero amount rejected
  const zeroFd = new FormData();
  zeroFd.append('rescueCaseId', testCase._id.toString());
  zeroFd.append('fundAllocationId', allocation._id.toString());
  zeroFd.append('title', 'Surgery OT Bill');
  zeroFd.append('amount', '0');
  zeroFd.append('expenseCategory', 'Surgery');
  zeroFd.append('documents', new Blob([samplePdfBuffer], { type: 'application/pdf' }), 'bill.pdf');
  const zeroRes = await postFormData('/expenses', zeroFd, rescuerAToken);
  assert(zeroRes.status === 400, 'Zero amount rejected (400)');

  // Test: Amount exceeding unspent allocation balance (₹10,000) rejected
  const exceedFd = new FormData();
  exceedFd.append('rescueCaseId', testCase._id.toString());
  exceedFd.append('fundAllocationId', allocation._id.toString());
  exceedFd.append('title', 'Expensive OT Bill');
  exceedFd.append('amount', '15000'); // Allocation is only 10,000
  exceedFd.append('expenseCategory', 'Surgery');
  exceedFd.append('documents', new Blob([samplePdfBuffer], { type: 'application/pdf' }), 'bill.pdf');
  const exceedRes = await postFormData('/expenses', exceedFd, rescuerAToken);
  assert(exceedRes.status === 400 && exceedRes.body.message.includes('exceeds'), 'Amount exceeding unspent allocation balance rejected (400)');

  // 5. Successful Expense Submission
  console.log('\n--- 5. Submitting valid expense claims ---');
  const validFd1 = new FormData();
  validFd1.append('rescueCaseId', testCase._id.toString());
  validFd1.append('fundAllocationId', allocation._id.toString());
  validFd1.append('title', 'OT Charges and Anesthesia Bill');
  validFd1.append('amount', '4000');
  validFd1.append('expenseCategory', 'Surgery');
  validFd1.append('expenseDate', new Date().toISOString());
  validFd1.append('documentType', 'Veterinary invoice');
  validFd1.append('documentDescription', 'Official tax invoice from Cessna Lifeline Vet');
  validFd1.append('documents', new Blob([samplePdfBuffer], { type: 'application/pdf' }), 'cessna_ot_invoice.pdf');
  validFd1.append('documents', new Blob([samplePngBuffer], { type: 'image/png' }), 'cessna_ot_receipt.png');

  const submitRes1 = await postFormData('/expenses', validFd1, rescuerAToken);
  assert(submitRes1.status === 201, 'Expense 1 (₹4,000) submitted successfully (201)');
  const exp1 = submitRes1.body.expense;
  assert(exp1.verificationStatus === 'Pending', 'Default verification status is strictly "Pending"');
  assert(exp1.isSimulated === true, 'Expense record is marked isSimulated: true');
  assert(exp1.proofDocuments && exp1.proofDocuments.length === 2, 'Proof documents correctly uploaded and recorded (2 files)');

  // Submit Expense 2 (₹3,000) for rejection testing
  const validFd2 = new FormData();
  validFd2.append('rescueCaseId', testCase._id.toString());
  validFd2.append('fundAllocationId', allocation._id.toString());
  validFd2.append('title', 'Dubious Medicine Claim');
  validFd2.append('amount', '3000');
  validFd2.append('expenseCategory', 'Surgery');
  validFd2.append('expenseDate', new Date().toISOString());
  validFd2.append('documentType', 'Cash memo');
  validFd2.append('documentDescription', 'Unclear pharmacy slip');
  validFd2.append('documents', new Blob([samplePngBuffer], { type: 'image/png' }), 'slip.png');

  const submitRes2 = await postFormData('/expenses', validFd2, rescuerAToken);
  assert(submitRes2.status === 201, 'Expense 2 (₹3,000) submitted successfully');
  const exp2 = submitRes2.body.expense;

  // 6. Private Document Download & Streaming Security
  console.log('\n--- 6. Document access security ---');
  const docId = exp1.proofDocuments[0]._id;
  const docUrl = `/expenses/${exp1._id}/documents/${docId}`;

  // Unauthenticated access
  const unauthDoc = await getReq(docUrl, null);
  assert(unauthDoc.status === 401, 'Unauthenticated access to proof document blocked (401)');

  // Unrelated rescuer access
  const wrongRescuerDoc = await getReq(docUrl, rescuerBToken);
  assert(wrongRescuerDoc.status === 403, 'Unrelated rescuer access to private document blocked (403)');

  // Submitter access
  const ownerDoc = await getReq(docUrl, rescuerAToken);
  assert(ownerDoc.status === 200, 'Submitter can securely access proof document (200)');

  // Admin access
  const adminDoc = await getReq(docUrl, adminToken);
  assert(adminDoc.status === 200, 'Admin can securely access proof document (200)');

  // 7. Verify Pending Expenses Do NOT Count Toward Verified Spending
  console.log('\n--- 7. Pending expenses segregation check ---');
  const finBeforeApproval = await getReq(`/cases/${testCase._id}`);
  assert(
    finBeforeApproval.body.case.financials.totalVerifiedSpending === 0,
    'Verified spending remains ₹0 while expenses are Pending'
  );
  assert(
    finBeforeApproval.body.case.financials.remainingAllocatedBalance === 10000,
    'Remaining allocated balance remains full ₹10,000 while expenses are Pending'
  );

  // 8. Rescuer and Admin Expense Views
  console.log('\n--- 8. Rescuer and admin queues ---');
  const myExpensesRes = await getReq('/expenses/my', rescuerAToken);
  assert(
    myExpensesRes.status === 200 && myExpensesRes.body.expenses.length >= 2,
    'Rescuer can view their submitted expenses'
  );

  const adminExpensesRes = await getReq('/admin/expenses?status=Pending', adminToken);
  assert(
    adminExpensesRes.status === 200 && adminExpensesRes.body.expenses.some(e => e._id === exp1._id),
    'Admin triage queue lists pending expense claims'
  );

  // 9. Admin Rejection Workflow
  console.log('\n--- 9. Admin rejection workflow ---');
  // Rejection without reviewNote rejected
  const rejectNoNote = await patchJSON(`/admin/expenses/${exp2._id}/reject`, {}, adminToken);
  assert(rejectNoNote.status === 400, 'Rejection without review note rejected (400)');

  // Valid rejection
  const rejectRes = await patchJSON(
    `/admin/expenses/${exp2._id}/reject`,
    { reviewNote: 'Pharmacy slip is illegible and lacks clinic stamp.' },
    adminToken
  );
  assert(rejectRes.status === 200, 'Admin rejected Expense 2 with reason (200)');
  assert(rejectRes.body.expense.verificationStatus === 'Rejected', 'Expense 2 status is "Rejected"');

  // Verify rejected expense does NOT affect verified spending
  const finAfterReject = await getReq(`/cases/${testCase._id}`);
  assert(
    finAfterReject.body.case.financials.totalVerifiedSpending === 0,
    'Rejected expense does NOT increment verified spending'
  );

  // 10. Admin Approval Workflow & Financial State Updates
  console.log('\n--- 10. Admin approval workflow ---');
  const approveRes = await patchJSON(
    `/admin/expenses/${exp1._id}/approve`,
    { reviewNote: 'Verified against Cessna Lifeline invoice and OT ledger.' },
    adminToken
  );
  assert(approveRes.status === 200, 'Admin approved Expense 1 (₹4,000) (200)');
  assert(approveRes.body.expense.verificationStatus === 'Approved', 'Expense 1 status is "Approved"');

  // Check allocation amountSpent updated
  const updatedAlloc = await FundAllocation.findById(allocation._id);
  assert(updatedAlloc.amountSpent === 4000, 'Allocation amountSpent atomically updated to ₹4,000');
  assert(updatedAlloc.status === 'Partially Spent', 'Allocation status transitioned to "Partially Spent"');

  // Check case financials updated
  const finAfterApprove = await getReq(`/cases/${testCase._id}`);
  assert(
    finAfterApprove.body.case.financials.totalVerifiedSpending === 4000,
    'Module 7 case totalVerifiedSpending correctly updated to ₹4,000'
  );
  assert(
    finAfterApprove.body.case.financials.remainingAllocatedBalance === 6000,
    'Remaining allocated balance correctly updated to ₹6,000 (10,000 - 4,000)'
  );

  // 11. Overdraft Protection Test
  console.log('\n--- 11. Overdraft protection test ---');
  // Remaining in allocation is ₹6,000. Try to submit ₹7,000 expense
  const overDraftFd = new FormData();
  overDraftFd.append('rescueCaseId', testCase._id.toString());
  overDraftFd.append('fundAllocationId', allocation._id.toString());
  overDraftFd.append('title', 'Overdraft attempt');
  overDraftFd.append('amount', '7000'); // 7000 > 6000 unspent
  overDraftFd.append('expenseCategory', 'Surgery');
  overDraftFd.append('documents', new Blob([samplePngBuffer], { type: 'image/png' }), 'slip.png');
  const overDraftRes = await postFormData('/expenses', overDraftFd, rescuerAToken);
  assert(
    overDraftRes.status === 400 && overDraftRes.body.message.includes('exceeds'),
    'Submission exceeding new remaining balance (₹6,000) rejected (400)'
  );

  // 12. Public Transparency Sanity Check
  console.log('\n--- 12. Public transparency check ---');
  const transSummaryRes = await getReq('/transparency/summary');
  assert(transSummaryRes.status === 200, 'Public transparency summary accessible without auth');
  assert(
    transSummaryRes.body.stats.totalVerifiedSpending >= 4000,
    'Public transparency summary aggregates verified spending across approved cases'
  );

  const transCasesRes = await getReq(`/transparency/cases?search=M8+Sheru`);
  assert(
    transCasesRes.status === 200 && transCasesRes.body.cases.length > 0,
    'Public transparency cases return case with verified spending'
  );

  console.log('\n====================================================');
  console.log(`MODULE 8 TESTS SUMMARY: Passed ${passed}, Failed ${failed}`);
  console.log('====================================================');

  await mongoose.disconnect();
  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runModule8Tests().catch((err) => {
  console.error('Fatal Module 8 test error:', err);
  process.exit(1);
});
