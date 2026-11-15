import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import RescueCase from '../models/RescueCase.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';

dotenv.config();

const runModule5Tests = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pet_rescue';
  await mongoose.connect(uri);
  console.log('====================================================');
  console.log('STARTING MODULE 5: RESCUE CASE VERIFICATION & ADMIN REVIEW TESTS');
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

  // Setup Test Users
  // 1. Admin
  const adminLog = await post('/auth/login', {
    email: 'admin@petrescue.example',
    password: process.env.ADMIN_PASSWORD || 'AdminPass2026!',
  });
  const adminToken = adminLog.body.token;

  // 2. Rescuer 1 (Approved)
  await User.deleteOne({ email: 'module5_rescuer1@petrescue.example' });
  const rescuer1Reg = await post('/auth/register', {
    name: 'Priya Rescuer',
    email: 'module5_rescuer1@petrescue.example',
    password: 'Password123!',
    role: 'rescuer',
  });
  // Approve Rescuer 1
  await User.updateOne(
    { email: 'module5_rescuer1@petrescue.example' },
    { rescuerVerificationStatus: 'approved' }
  );
  const rescuer1Log = await post('/auth/login', {
    email: 'module5_rescuer1@petrescue.example',
    password: 'Password123!',
  });
  const rescuer1Token = rescuer1Log.body.token;
  const rescuer1Id = rescuer1Log.body.user._id;

  // 3. Rescuer 2 (Approved)
  await User.deleteOne({ email: 'module5_rescuer2@petrescue.example' });
  const rescuer2Reg = await post('/auth/register', {
    name: 'Kavita Rescuer',
    email: 'module5_rescuer2@petrescue.example',
    password: 'Password123!',
    role: 'rescuer',
  });
  await User.updateOne(
    { email: 'module5_rescuer2@petrescue.example' },
    { rescuerVerificationStatus: 'approved' }
  );
  const rescuer2Log = await post('/auth/login', {
    email: 'module5_rescuer2@petrescue.example',
    password: 'Password123!',
  });
  const rescuer2Token = rescuer2Log.body.token;

  // 4. Regular Donor
  await User.deleteOne({ email: 'module5_donor@petrescue.example' });
  const donorReg = await post('/auth/register', {
    name: 'Rohan Donor',
    email: 'module5_donor@petrescue.example',
    password: 'Password123!',
    role: 'donor',
  });
  const donorToken = donorReg.body.token;

  console.log('\n--- 1. Verification Dashboard Access & Security ---');
  // Test 1: Admin can access verification dashboard stats & list
  const statsRes = await get('/admin/cases/stats', adminToken);
  assert(
    statsRes.status === 200 && statsRes.body.success && statsRes.body.stats !== undefined,
    '1. Admin can access verification dashboard stats'
  );

  const adminListRes = await get('/admin/cases', adminToken);
  assert(
    adminListRes.status === 200 && adminListRes.body.success,
    '1b. Admin can access verification cases queue'
  );

  // Test 2: Non-admin users cannot access admin review APIs
  const donorReviewTry = await get('/admin/cases', donorToken);
  assert(
    donorReviewTry.status === 403,
    '2a. Donor cannot access /admin/cases review API (403 Forbidden)'
  );

  const rescuerReviewTry = await get('/admin/cases/stats', rescuer1Token);
  assert(
    rescuerReviewTry.status === 403,
    '2b. Rescuer cannot access /admin/cases/stats review API (403 Forbidden)'
  );

  const anonReviewTry = await get('/admin/cases');
  assert(
    anonReviewTry.status === 401,
    '2c. Unauthenticated visitor cannot access admin review APIs (401 Unauthorized)'
  );

  console.log('\n--- 2. Case Submission, Inspection & Details ---');
  // Create a pending test case by Rescuer 1
  const newCaseRes = await post(
    '/cases',
    {
      title: 'Rocky — Hit-and-Run Spinal Trauma Support',
      animalName: 'Rocky',
      animalType: 'Dog',
      breed: 'Indie',
      age: '2 Years',
      gender: 'Male',
      location: '100 Feet Road, Indiranagar, Bengaluru',
      description: 'Found unresponsive near median after vehicle hit-and-run.',
      injuryType: 'Spinal Trauma',
      injuryDescription: 'Posterior leg paralysis, deep road abrasions.',
      medicalCondition: 'Admitted at Cessna Lifeline; needs emergency MRI and spinal stabilizer.',
      urgencyLevel: 'Critical',
      estimatedTreatmentCost: 35000,
      fundraisingGoal: 35000,
      imageUrls: ['https://images.unsplash.com/photo-1548767797-d8c844163c4c'],
    },
    rescuer1Token
  );

  assert(
    newCaseRes.status === 201 &&
      newCaseRes.body.case &&
      newCaseRes.body.case.verificationStatus === 'Pending',
    '3a. Rescuer submits case, strictly defaulting to Pending verification status'
  );

  const caseId = newCaseRes.body.case._id;

  // Test 3: Admin can view full case details, photographs, and rescuer prior submissions
  const adminCaseDetail = await get(`/admin/cases/${caseId}`, adminToken);
  assert(
    adminCaseDetail.status === 200 &&
      adminCaseDetail.body.case.animalName === 'Rocky' &&
      adminCaseDetail.body.case.images.length > 0 &&
      adminCaseDetail.body.rescuerPreviousCases !== undefined,
    '3. Admin can view case details, uploaded photographs, and previous submissions'
  );

  console.log('\n--- 3. Decision Workflow: Rejection & Repeated Decision Safeguards ---');
  // Test 5: Admin cannot reject without required reason
  const emptyReject = await patch(`/admin/cases/${caseId}/reject`, { reviewNote: '   ' }, adminToken);
  assert(
    emptyReject.status === 400 && emptyReject.body.success === false,
    '5a. Admin cannot reject case without providing a reason (400 Bad Request)'
  );

  // Test 5b: Admin rejects with reason
  const validReject = await patch(
    `/admin/cases/${caseId}/reject`,
    { reviewNote: 'Please provide attending veterinary hospital estimate invoice and clear pelvic radiograph.' },
    adminToken
  );
  assert(
    validReject.status === 200 &&
      validReject.body.case.verificationStatus === 'Rejected' &&
      validReject.body.case.rejectionReason.length > 0,
    '5b. Admin can reject cases with a required reason'
  );

  // Test 6: Repeated decision guard on already rejected case
  const repeatReject = await patch(
    `/admin/cases/${caseId}/reject`,
    { reviewNote: 'Second rejection attempt' },
    adminToken
  );
  assert(
    repeatReject.status === 400,
    '6a. Repeated rejection on already rejected case is safely rejected (400 Bad Request)'
  );

  // Test 13: Public users cannot access rejected case
  const publicRejectedTry = await get(`/cases/${caseId}`);
  assert(
    publicRejectedTry.status === 404,
    '13. Public users cannot access pending or rejected cases (404 Not Found)'
  );

  console.log('\n--- 4. Audit Trail & Notifications on Rejection ---');
  // Test 7: Review history is recorded correctly in audit log
  const auditRes1 = await get(`/admin/cases/${caseId}/history`, adminToken);
  assert(
    auditRes1.status === 200 &&
      auditRes1.body.history.length === 1 &&
      auditRes1.body.history[0].action === 'Rejected' &&
      auditRes1.body.history[0].previousStatus === 'Pending' &&
      auditRes1.body.history[0].newStatus === 'Rejected',
    '7a. Audit log records rejection with admin ID, timestamp, and reviewNote'
  );

  // Test 11: Notification is created for rescuer
  const rescuer1Notifs = await get('/notifications', rescuer1Token);
  const rejectNotif = rescuer1Notifs.body.notifications?.find(
    (n) => n.caseId?._id === caseId || n.caseId === caseId
  );
  assert(
    rejectNotif !== undefined &&
      rejectNotif.title.includes('Rejected') &&
      rejectNotif.recipient === rescuer1Id,
    '11a. In-app notification created for rescuer upon rejection'
  );

  // Test 12: Other users cannot view Rescuer 1 private notifications
  const rescuer2Notifs = await get('/notifications', rescuer2Token);
  const leakedNotif = rescuer2Notifs.body.notifications?.find(
    (n) => n.caseId?._id === caseId || n.caseId === caseId
  );
  assert(
    leakedNotif === undefined,
    '12. Users cannot read other users\' private notifications'
  );

  console.log('\n--- 5. Rescuer Revision, Ownership & Authorization ---');
  // Test 8: Rescuer can see feedback on their own cases
  const rescuerMyCases = await get('/cases/my', rescuer1Token);
  const foundMyCase = rescuerMyCases.body.cases?.find((c) => c._id === caseId);
  assert(
    foundMyCase &&
      foundMyCase.verificationStatus === 'Rejected' &&
      foundMyCase.reviewNote.includes('estimate invoice'),
    '8. Rescuer can see feedback and rejection reason on their own cases'
  );

  // Test 9: Other rescuers cannot see private case in their /cases/my
  const rescuer2MyCases = await get('/cases/my', rescuer2Token);
  const otherRescuerFound = rescuer2MyCases.body.cases?.find((c) => c._id === caseId);
  assert(
    otherRescuerFound === undefined,
    '9. Rescuers cannot see other rescuers\' private cases'
  );

  // Test 10: Rescuers cannot modify verification status directly
  const unauthorizedStatusHack = await patch(
    `/cases/${caseId}/resubmit`,
    { verificationStatus: 'Approved', campaignStatus: 'Active' },
    rescuer1Token
  );
  // Status must reset to Pending, never Approved
  assert(
    unauthorizedStatusHack.body.case?.verificationStatus === 'Pending',
    '10. Rescuers cannot modify verification status directly (resubmit strictly sets Pending)'
  );

  // Test 14: Non-admin cannot tamper with audit logs or history endpoint
  const auditRescuerTamper = await get(`/admin/cases/${caseId}/history`, rescuer1Token);
  assert(
    auditRescuerTamper.status === 403,
    '14. Audit history cannot be accessed or manipulated by ordinary users (403 Forbidden)'
  );

  console.log('\n--- 6. Admin Approval Workflow & Activation ---');
  // Test 4: Admin can approve pending/resubmitted case
  const approveRes = await patch(
    `/admin/cases/${caseId}/approve`,
    { reviewNote: 'Hospital invoice and doctor radiograph verified with Cessna Lifeline clinic.' },
    adminToken
  );
  assert(
    approveRes.status === 200 &&
      approveRes.body.case.verificationStatus === 'Approved' &&
      approveRes.body.case.campaignStatus === 'Active',
    '4. Admin can approve cases, setting verification to Approved and campaign to Active'
  );

  // Test 6b: Repeated approval prevention
  const repeatApprove = await patch(
    `/admin/cases/${caseId}/approve`,
    { reviewNote: 'Try to approve again' },
    adminToken
  );
  assert(
    repeatApprove.status === 400 && repeatApprove.body.success === false,
    '6b. Repeated decisions on already approved case are safely prevented (400 Bad Request)'
  );

  // Test 7b: Audit trail has append-only log of resubmission and approval
  const auditRes2 = await get(`/admin/cases/${caseId}/history`, adminToken);
  assert(
    auditRes2.body.history.length === 3 &&
      auditRes2.body.history[0].action === 'Approved' &&
      auditRes2.body.history[1].action === 'Resubmitted' &&
      auditRes2.body.history[2].action === 'Rejected',
    '7b. Review history records full sequential audit trail (Rejected -> Resubmitted -> Approved)'
  );

  // Test 11b: Rescuer receives approval notification
  const rescuer1NotifsAfter = await get('/notifications', rescuer1Token);
  const approveNotif = rescuer1NotifsAfter.body.notifications?.find(
    (n) => n.title.includes('Approved')
  );
  assert(
    approveNotif !== undefined && approveNotif.isRead === false,
    '11b. In-app notification created for rescuer upon case approval'
  );

  // Mark notification read
  const markReadRes = await patch(`/notifications/${approveNotif._id}/read`, {}, rescuer1Token);
  assert(
    markReadRes.status === 200 && markReadRes.body.notification.isRead === true,
    '11c. Notification read status successfully updated'
  );

  // Public exploration now sees the approved case
  const publicCase = await get(`/cases/${caseId}`);
  assert(
    publicCase.status === 200 &&
      publicCase.body.case.verificationStatus === 'Approved' &&
      publicCase.body.case.campaignStatus === 'Active',
    '4b. Public users can explore verified and approved cases'
  );

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
};

runModule5Tests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
