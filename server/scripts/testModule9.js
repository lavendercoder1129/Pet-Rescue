import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import RescueCase from '../models/RescueCase.js';
import RescueUpdate from '../models/RescueUpdate.js';
import Announcement from '../models/Announcement.js';

dotenv.config();

const runModule9Tests = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pet_rescue';
  await mongoose.connect(uri);
  console.log('====================================================');
  console.log('STARTING MODULE 9: RESCUE UPDATES & ANNOUNCEMENTS TESTS');
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
    return { status: res.status, body };
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

  const patchFormData = async (endpoint, formData, token) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
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
  await User.deleteOne({ email: 'm9_donor@petrescue.example' });
  await postJSON('/auth/register', {
    name: 'M9 Donor',
    email: 'm9_donor@petrescue.example',
    password: 'Password123!',
    role: 'donor',
  });
  const donorLog = await postJSON('/auth/login', {
    email: 'm9_donor@petrescue.example',
    password: 'Password123!',
  });
  const donorToken = donorLog.body.token;

  // Rescuer A (Verified)
  await User.deleteOne({ email: 'm9_rescuer_a@petrescue.example' });
  await postJSON('/auth/register', {
    name: 'Rescuer Alpha',
    email: 'm9_rescuer_a@petrescue.example',
    password: 'Password123!',
    role: 'rescuer',
  });
  await User.updateOne(
    { email: 'm9_rescuer_a@petrescue.example' },
    { rescuerVerificationStatus: 'approved' }
  );
  const rescuerALog = await postJSON('/auth/login', {
    email: 'm9_rescuer_a@petrescue.example',
    password: 'Password123!',
  });
  const rescuerAToken = rescuerALog.body.token;
  const rescuerAId = rescuerALog.body.user._id;

  // Rescuer B (Verified)
  await User.deleteOne({ email: 'm9_rescuer_b@petrescue.example' });
  await postJSON('/auth/register', {
    name: 'Rescuer Beta',
    email: 'm9_rescuer_b@petrescue.example',
    password: 'Password123!',
    role: 'rescuer',
  });
  await User.updateOne(
    { email: 'm9_rescuer_b@petrescue.example' },
    { rescuerVerificationStatus: 'approved' }
  );
  const rescuerBLog = await postJSON('/auth/login', {
    email: 'm9_rescuer_b@petrescue.example',
    password: 'Password123!',
  });
  const rescuerBToken = rescuerBLog.body.token;

  // 2. Setup Test Rescue Cases
  console.log('\n--- 2. Setting up test cases ---');
  await RescueCase.deleteMany({ title: /Module 9 Test Dog/ });
  const approvedCaseA = await RescueCase.create({
    title: 'Module 9 Test Dog - Leg Surgery',
    animalName: 'M9 Rocky',
    animalType: 'Dog',
    breed: 'Indie',
    age: '3 years',
    gender: 'Male',
    location: 'Koramangala 5th Block',
    description: 'Street dog undergoing leg surgery and post-op care.',
    injuryType: 'Leg Fracture',
    injuryDescription: 'Tibia fracture requiring surgical pin insertion.',
    medicalCondition: 'Under observation at Cessna Lifeline.',
    urgencyLevel: 'Critical',
    estimatedTreatmentCost: 20000,
    fundraisingGoal: 20000,
    verificationStatus: 'Approved',
    campaignStatus: 'Active',
    createdBy: rescuerAId,
    verifiedBy: adminLog.body.user._id,
    verifiedAt: new Date(),
    isPublished: true,
  });

  const pendingCaseA = await RescueCase.create({
    title: 'Module 9 Test Dog - Pending Case',
    animalName: 'M9 PendingPup',
    animalType: 'Dog',
    breed: 'Indie',
    age: '1 year',
    gender: 'Female',
    location: 'Indiranagar',
    description: 'Pending case description.',
    injuryType: 'Skin Infection',
    injuryDescription: 'Mange requiring medicated baths.',
    medicalCondition: 'Stable',
    urgencyLevel: 'Normal',
    estimatedTreatmentCost: 5000,
    fundraisingGoal: 5000,
    verificationStatus: 'Pending',
    campaignStatus: 'Active',
    createdBy: rescuerAId,
    isPublished: false,
  });

  // 3. Test Rescue Updates — Permissions & Authorization
  console.log('\n--- 3. Rescue update authorization & submission controls ---');

  // Test 1: Rescuer A can submit update for their own approved case
  const samplePngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const validFd = new FormData();
  validFd.append('caseId', approvedCaseA._id.toString());
  validFd.append('title', 'Surgery Completed Successfully');
  validFd.append('description', 'Rocky woke up from anesthesia and orthopedic pin was placed without complications.');
  validFd.append('milestone', 'treatment');
  validFd.append('images', new Blob([samplePngBuffer], { type: 'image/png' }), 'surgery_pin.png');

  const updateRes1 = await postFormData('/rescue-updates', validFd, rescuerAToken);
  assert(updateRes1.status === 201, '1. Rescuer can submit an update for their own eligible case (201)');
  const update1 = updateRes1.body.update;
  assert(update1 && update1.status === 'pending', '1b. Newly submitted update strictly defaults to "pending"');

  // Test 2: Rescuer B cannot submit update for Rescuer A\'s case
  const wrongRescuerFd = new FormData();
  wrongRescuerFd.append('caseId', approvedCaseA._id.toString());
  wrongRescuerFd.append('title', 'Unauthorized Update');
  wrongRescuerFd.append('description', 'Attempting to update someone else case.');
  wrongRescuerFd.append('milestone', 'recovering');
  const wrongRescuerRes = await postFormData('/rescue-updates', wrongRescuerFd, rescuerBToken);
  assert(wrongRescuerRes.status === 403, '2. Rescuer cannot update another rescuer\'s case (403)');

  // Test 2b: Donor cannot submit update
  const donorUpdateRes = await postFormData('/rescue-updates', validFd, donorToken);
  assert(donorUpdateRes.status === 403, '2b. Donor cannot submit rescue updates (403)');

  // Test 2c: Cannot submit update for a pending unapproved case
  const pendingCaseFd = new FormData();
  pendingCaseFd.append('caseId', pendingCaseA._id.toString());
  pendingCaseFd.append('title', 'Update on pending case');
  pendingCaseFd.append('description', 'Should fail.');
  const pendingCaseRes = await postFormData('/rescue-updates', pendingCaseFd, rescuerAToken);
  assert(pendingCaseRes.status === 400, '2c. Cannot submit updates for an unapproved/pending case (400)');

  // 4. Test Public Timeline Segregation
  console.log('\n--- 4. Public timeline segregation & visibility ---');
  // Test 3: Pending updates are not publicly visible
  const pubTimelineBefore = await getReq(`/rescue-updates/case/${approvedCaseA._id}`);
  assert(
    pubTimelineBefore.status === 200 && pubTimelineBefore.body.updates.length === 0,
    '3. Pending updates are NOT publicly visible in public timeline'
  );

  // 5. Test Rescuer Views
  console.log('\n--- 5. Rescuer views ---');
  const myUpdatesRes = await getReq('/rescue-updates/my-updates', rescuerAToken);
  assert(
    myUpdatesRes.status === 200 && myUpdatesRes.body.updates.length >= 1,
    '5a. Rescuers can retrieve their own submitted updates (/my-updates)'
  );

  const myEligibleCasesRes = await getReq('/rescue-updates/my-cases', rescuerAToken);
  assert(
    myEligibleCasesRes.status === 200 && myEligibleCasesRes.body.cases.some((c) => c._id === approvedCaseA._id.toString()),
    '5b. Rescuer can view their eligible approved cases (/my-cases)'
  );

  // 6. Test Admin Moderation (Approve & Reject)
  console.log('\n--- 6. Admin moderation workflow ---');
  // Admin lists pending updates
  const adminUpdatesQueue = await getReq('/admin/rescue-updates?status=pending', adminToken);
  assert(
    adminUpdatesQueue.status === 200 && adminUpdatesQueue.body.updates.some((u) => u._id === update1._id),
    '6a. Admin can view pending rescue updates queue'
  );

  // Submit a second update for rejection testing
  const rejectFd = new FormData();
  rejectFd.append('caseId', approvedCaseA._id.toString());
  rejectFd.append('title', 'Blurry Unclear Photo');
  rejectFd.append('description', 'Unverified report lacking medical detail.');
  rejectFd.append('milestone', 'recovering');
  const updateRes2 = await postFormData('/rescue-updates', rejectFd, rescuerAToken);
  const update2 = updateRes2.body.update;

  // Test 7: Rejection requires a reason
  const rejectNoReason = await patchJSON(`/admin/rescue-updates/${update2._id}/reject`, {}, adminToken);
  assert(rejectNoReason.status === 400, '7. Rejection requires a mandatory reason (400)');

  // Reject update 2 with reason
  const rejectSuccess = await patchJSON(
    `/admin/rescue-updates/${update2._id}/reject`,
    { reason: 'Please upload a clear photograph of the surgical incision.' },
    adminToken
  );
  assert(rejectSuccess.status === 200, '6b. Admin can reject updates with feedback');
  assert(rejectSuccess.body.update.status === 'rejected', '6c. Rejected update status is "rejected"');

  // Test 4: Rejected updates are not publicly visible
  const pubTimelineAfterReject = await getReq(`/rescue-updates/case/${approvedCaseA._id}`);
  assert(
    pubTimelineAfterReject.status === 200 &&
      !pubTimelineAfterReject.body.updates.some((u) => u._id === update2._id),
    '4. Rejected updates are NOT publicly visible in public timeline'
  );

  // Test 6d & 5: Admin approves update 1 -> appears in public timeline
  const approveRes = await patchJSON(
    `/admin/rescue-updates/${update1._id}/approve`,
    { adminFeedback: 'Approved for public timeline.' },
    adminToken
  );
  assert(approveRes.status === 200, '6d. Admin can approve updates (200)');
  assert(approveRes.body.update.status === 'published', '6e. Approved update status is "published"');

  const pubTimelineAfterApprove = await getReq(`/rescue-updates/case/${approvedCaseA._id}`);
  assert(
    pubTimelineAfterApprove.status === 200 &&
      pubTimelineAfterApprove.body.updates.some((u) => u.title === 'Surgery Completed Successfully'),
    '5. Approved updates appear in the public case timeline'
  );

  // Test 8: Rescuer receives notifications
  const rescuerNotifs = await getReq('/notifications', rescuerAToken);
  assert(
    rescuerNotifs.status === 200 &&
      rescuerNotifs.body.notifications.some((n) => n.title.includes('Approved') || n.title.includes('Revision')),
    '8. Rescuers receive in-app moderation notifications'
  );

  // 7. Emergency Announcements Tests
  console.log('\n--- 7. Emergency announcements backend & access control ---');

  // Test 9: Only administrators can manage announcements
  const donorTryCreateAnn = await postJSON(
    '/announcements',
    {
      title: 'Donor Announcement',
      message: 'Unauthorized',
      type: 'general',
    },
    donorToken
  );
  assert(donorTryCreateAnn.status === 403, '9. Non-admin users cannot create announcements (403)');

  // Admin creates draft announcement
  const draftRes = await postJSON(
    '/announcements',
    {
      title: 'M9 Draft Platform Announcement',
      message: 'This is an unpublished draft note.',
      type: 'general',
      status: 'draft',
      priority: 2,
    },
    adminToken
  );
  assert(draftRes.status === 201, '9b. Admin can create announcement in draft status');
  const draftAnn = draftRes.body.announcement;

  // Test 10: Draft announcements remain private
  const activeAnn1 = await getReq('/announcements/active');
  assert(
    activeAnn1.status === 200 && !activeAnn1.body.announcements.some((a) => a._id === draftAnn._id),
    '10. Draft announcements remain private and do not appear in active public endpoint'
  );

  // Admin creates expired announcement
  const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const olderDate = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const expiredAnn = await Announcement.create({
    title: 'M9 Expired Severe Weather Alert',
    message: 'Expired storm shelter announcement.',
    type: 'emergency',
    status: 'published',
    startAt: olderDate,
    expiresAt: pastDate, // Expired yesterday
    createdBy: adminLog.body.user._id,
    isSimulated: true,
  });

  // Admin creates live emergency announcement
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const liveEmergency = await postJSON(
    '/announcements',
    {
      title: 'M9 Severe Heatwave Advisory: Street Dog Hydration Drives',
      message: 'High heat advisory across Bangalore. Volunteer teams deployed with terracotta water bowls.',
      type: 'emergency',
      status: 'published',
      priority: 5,
      startAt: new Date(),
      expiresAt: futureDate,
    },
    adminToken
  );
  assert(liveEmergency.status === 201, '9c. Admin can publish active emergency announcement');

  // Test 11: Archived and expired announcements are not active publicly
  const activeAnn2 = await getReq('/announcements/active');
  assert(
    activeAnn2.status === 200 &&
      activeAnn2.body.announcements.some((a) => a.title.includes('Heatwave Advisory')) &&
      !activeAnn2.body.announcements.some((a) => a._id === expiredAnn._id.toString()),
    '11. Expired announcements are filtered out; only currently active published notices appear'
  );

  // Admin archives announcement
  const archiveRes = await patchJSON(`/announcements/${liveEmergency.body.announcement._id}/archive`, {}, adminToken);
  assert(archiveRes.status === 200, '11b. Admin can archive announcement');

  const activeAnn3 = await getReq('/announcements/active');
  assert(
    activeAnn3.status === 200 &&
      !activeAnn3.body.announcements.some((a) => a._id === liveEmergency.body.announcement._id),
    '11c. Archived announcement immediately removed from active public endpoint'
  );

  // Test 12: Invalid images & malformed requests rejected
  const badFd = new FormData();
  badFd.append('caseId', approvedCaseA._id.toString());
  badFd.append('title', ''); // Empty title
  badFd.append('description', '');
  const badReqRes = await postFormData('/rescue-updates', badFd, rescuerAToken);
  assert(badReqRes.status === 400, '12. Malformed request with missing title/description rejected (400)');

  console.log('\n====================================================');
  console.log(`MODULE 9 TESTS SUMMARY: Passed ${passed}, Failed ${failed}`);
  console.log('====================================================');

  await mongoose.disconnect();
  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runModule9Tests().catch((err) => {
  console.error('Fatal Module 9 test error:', err);
  process.exit(1);
});
