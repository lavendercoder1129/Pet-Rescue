import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import RescueCase from '../models/RescueCase.js';
import Donation from '../models/Donation.js';
import Expense from '../models/Expense.js';
import RescueUpdate from '../models/RescueUpdate.js';
import Notification from '../models/Notification.js';

dotenv.config();

const runModule11Tests = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pet_rescue';
  await mongoose.connect(uri);
  console.log('====================================================');
  console.log('STARTING MODULE 11: DASHBOARD INTEGRATION & POLISH TESTS');
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

  try {
    // 1. Setup accounts
    console.log('\n--- 1. Setting up Test Accounts ---');
    const adminUser = await User.findOne({ role: 'admin' });
    const adminLogin = await postJSON('/auth/login', {
      email: adminUser.email,
      password: process.env.ADMIN_PASSWORD || 'AdminPass2026!',
    });
    const adminToken = adminLogin.body.token;

    // Donor
    const donorEmail = `mod11_donor_${Date.now()}@example.com`;
    const donorReg = await postJSON('/auth/register', {
      name: 'Mod11 Donor',
      email: donorEmail,
      password: 'Password123!',
      role: 'donor',
      phone: '9876543201',
    });
    const donorToken = donorReg.body.token;
    const donorId = donorReg.body.user._id;

    // Rescuer
    const rescuerEmail = `mod11_rescuer_${Date.now()}@example.com`;
    const rescuerReg = await postJSON('/auth/register', {
      name: 'Mod11 Rescuer',
      email: rescuerEmail,
      password: 'Password123!',
      role: 'rescuer',
      phone: '9876543202',
    });
    const rescuerToken = rescuerReg.body.token;
    const rescuerId = rescuerReg.body.user._id;

    // Other Rescuer for Cross-User Isolation check
    const otherRescuerEmail = `mod11_other_rescuer_${Date.now()}@example.com`;
    const otherRescuerReg = await postJSON('/auth/register', {
      name: 'Mod11 Other Rescuer',
      email: otherRescuerEmail,
      password: 'Password123!',
      role: 'rescuer',
      phone: '9876543203',
    });
    const otherRescuerToken = otherRescuerReg.body.token;

    // Approve the first rescuer
    await User.findByIdAndUpdate(rescuerId, { rescuerVerificationStatus: 'approved' });

    console.log('✓ Accounts successfully registered & tokens acquired.');

    // 2. Test Role Protection on Dashboards and APIs
    console.log('\n--- 2. Role Protection and Authorization Tests ---');
    // Unauthenticated request to admin dashboard
    const unauthDash = await getReq('/admin/dashboard');
    if (unauthDash.status !== 401) {
      throw new Error(`Expected 401 for unauthenticated admin dashboard, got ${unauthDash.status}`);
    }
    console.log('✓ [PASS] Unauthenticated access to /admin/dashboard blocked (401)');

    // Donor accessing admin dashboard
    const donorAdminDash = await getReq('/admin/dashboard', donorToken);
    if (donorAdminDash.status !== 403) {
      throw new Error(`Expected 403 for donor accessing admin dashboard, got ${donorAdminDash.status}`);
    }
    console.log('✓ [PASS] Donor access to /admin/dashboard blocked (403)');

    // Rescuer accessing admin dashboard
    const rescuerAdminDash = await getReq('/admin/dashboard', rescuerToken);
    if (rescuerAdminDash.status !== 403) {
      throw new Error(`Expected 403 for rescuer accessing admin dashboard, got ${rescuerAdminDash.status}`);
    }
    console.log('✓ [PASS] Rescuer access to /admin/dashboard blocked (403)');

    // Admin accessing admin dashboard
    const adminDashRes = await getReq('/admin/dashboard', adminToken);
    if (adminDashRes.status !== 200 || !adminDashRes.body.success || !adminDashRes.body.stats) {
      throw new Error(`Admin dashboard call failed: ${JSON.stringify(adminDashRes.body)}`);
    }
    console.log('✓ [PASS] Admin successfully accessed /admin/dashboard with aggregated metrics:');
    console.log('   Stats:', {
      totalUsers: adminDashRes.body.stats.totalUsers,
      totalCases: adminDashRes.body.stats.totalCases,
      totalSimulatedDonations: adminDashRes.body.stats.totalSimulatedDonations,
      totalAllocatedFunds: adminDashRes.body.stats.totalAllocatedFunds,
    });

    // 3. Test Donor Dashboard Data Feeds & Privacy Isolation
    console.log('\n--- 3. Donor Dashboard Integration Tests ---');
    // Create an approved case
    const testCase = await RescueCase.create({
      title: `Mod 11 Rescue Pup ${Date.now()}`,
      animalName: 'Mod11 Pup',
      animalType: 'Dog',
      breed: 'Indie',
      location: 'Whitefield Main Rd',
      description: 'Stray puppy needing observation',
      injuryType: 'Abrasion',
      injuryDescription: 'Minor surface scrape',
      medicalCondition: 'Healthy',
      urgencyLevel: 'Normal',
      estimatedTreatmentCost: 5000,
      fundraisingGoal: 5000,
      currentDonations: 0,
      campaignStatus: 'Active',
      verificationStatus: 'Approved',
      createdBy: rescuerId,
      verifiedBy: adminUser._id,
      verifiedAt: new Date(),
      isPublished: true,
    });

    // Make a simulated donation
    const donRes = await postJSON('/donations', {
      caseId: testCase._id.toString(),
      amount: 1500,
      donationMessage: 'Cheering for you pup!',
      isAnonymous: false,
    }, donorToken);
    if (donRes.status !== 201) {
      throw new Error(`Donation creation failed: ${JSON.stringify(donRes.body)}`);
    }

    // Check Donor donations endpoint
    const myDonations = await getReq('/donations/my', donorToken);
    if (myDonations.status !== 200 || myDonations.body.donations.length === 0) {
      throw new Error('Donor donation history failed to return recorded gift');
    }
    if (myDonations.body.donations[0].amount !== 1500) {
      throw new Error(`Expected donation amount 1500, got ${myDonations.body.donations[0].amount}`);
    }
    console.log('✓ [PASS] Donor can retrieve donation history with reference: ' + myDonations.body.donations[0].donationReference);

    // Cross-user test: other user cannot see donor's donation
    const otherDonations = await getReq('/donations/my', rescuerToken);
    const hasDonorDonation = otherDonations.body.donations.some(d => d._id === myDonations.body.donations[0]._id);
    if (hasDonorDonation) {
      throw new Error('Cross-user breach: Rescuer saw Donor’s private donation history!');
    }
    console.log('✓ [PASS] Cross-user isolation: Rescuer cannot access donor’s donation history');

    // Check Donor achievements endpoint
    const myAchievements = await getReq('/achievements', donorToken);
    if (myAchievements.status !== 200 || !myAchievements.body.badges) {
      throw new Error('Donor achievements feed failed');
    }
    const firstContrib = myAchievements.body.badges.find(b => b.slug === 'first-contribution');
    if (!firstContrib || !firstContrib.isEarned) {
      throw new Error('First Contribution badge was not awarded or earned status missing');
    }
    console.log('✓ [PASS] Donor achievements feed returns unlocked badges & progress metrics');

    // 4. Test Rescuer Dashboard Data Feeds & Cross-User Isolation
    console.log('\n--- 4. Rescuer Dashboard Integration Tests ---');
    // Rescuer fetches their own cases
    const myCases = await getReq('/cases/my', rescuerToken);
    if (myCases.status !== 200 || myCases.body.cases.length === 0) {
      throw new Error('Rescuer failed to retrieve submitted cases');
    }
    console.log(`✓ [PASS] Rescuer retrieved ${myCases.body.cases.length} owned cases via /api/cases/my`);

    // Other rescuer should not see first rescuer's pending cases in /my
    const otherCases = await getReq('/cases/my', otherRescuerToken);
    const hasCase = otherCases.body.cases.some(c => c._id.toString() === testCase._id.toString());
    if (hasCase) {
      throw new Error('Cross-user breach: Other rescuer saw testCase in their /cases/my!');
    }
    console.log('✓ [PASS] Cross-user isolation: Other rescuer cannot access first rescuer’s private cases');

    // Rescuer fetches their own updates
    const myUpdates = await getReq('/rescue-updates/my-updates', rescuerToken);
    if (myUpdates.status !== 200 || !Array.isArray(myUpdates.body.updates)) {
      throw new Error('Rescuer updates feed failed');
    }
    console.log('✓ [PASS] Rescuer updates feed responsive and authorized');

    // Rescuer fetches their own expenses
    const myExpenses = await getReq('/expenses/my', rescuerToken);
    if (myExpenses.status !== 200 || !Array.isArray(myExpenses.body.expenses)) {
      throw new Error('Rescuer expenses feed failed');
    }
    console.log('✓ [PASS] Rescuer expense claims feed responsive and authorized');

    // 5. Notification System Integration & Mark As Read
    console.log('\n--- 5. Notification System Integration Tests ---');
    // Create an unread notification for donor
    const testNotif = await Notification.create({
      recipient: donorId,
      title: 'Module 11 Dashboard Notification Test',
      message: 'This is a test notification for dashboard verification',
    });

    const notifsBefore = await getReq('/notifications', donorToken);
    if (notifsBefore.status !== 200 || notifsBefore.body.unreadCount === 0) {
      throw new Error('Notification feed failed to return newly created unread notification');
    }
    console.log(`✓ [PASS] Notifications feed returned unreadCount = ${notifsBefore.body.unreadCount}`);

    // Mark as read
    const markRes = await patchJSON(`/notifications/${testNotif._id}/read`, {}, donorToken);
    if (markRes.status !== 200 || !markRes.body.success) {
      throw new Error('Failed to mark notification as read');
    }

    const notifsAfter = await getReq('/notifications', donorToken);
    const updatedNotif = notifsAfter.body.notifications.find(n => n._id.toString() === testNotif._id.toString());
    if (!updatedNotif || !updatedNotif.isRead) {
      throw new Error('Notification isRead was not updated to true');
    }
    console.log('✓ [PASS] Notification successfully marked as read');

    // Other user cannot mark donor's notification as read
    const crossNotif = await patchJSON(`/notifications/${testNotif._id}/read`, {}, rescuerToken);
    if (crossNotif.status !== 404 && crossNotif.status !== 403) {
      throw new Error(`Expected 404/403 for unauthorized notification read, got ${crossNotif.status}`);
    }
    console.log('✓ [PASS] Cross-user isolation: Rescuer cannot mark donor’s notification as read');

    console.log('\n====================================================');
    console.log('ALL MODULE 11 DASHBOARD INTEGRATION TESTS PASSED! 🌟');
    console.log('====================================================\n');
  } catch (err) {
    console.error('MODULE 11 TEST FAILURE:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

runModule11Tests();
