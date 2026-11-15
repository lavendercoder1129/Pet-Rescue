import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import RescueCase from '../models/RescueCase.js';
import Donation from '../models/Donation.js';
import Achievement from '../models/Achievement.js';
import UserAchievement from '../models/UserAchievement.js';
import Notification from '../models/Notification.js';

dotenv.config();

const runModule10Tests = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pet_rescue';
  await mongoose.connect(uri);
  console.log('====================================================');
  console.log('STARTING MODULE 10: DONOR RECOGNITION & BADGES TESTS');
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

  let testDonorToken, testDonor2Token, testAdminToken, testRescuerToken;
  let testDonorId, testDonor2Id, testAdminId;
  let caseAId, caseBId, caseCId;

  try {
    // 1. Setup test users
    console.log('\n--- Setting up test users and cases ---');
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      const passwordHash = await User.hashPassword(process.env.ADMIN_PASSWORD || 'AdminPass2026!');
      adminUser = await User.create({
        name: 'System Administrator',
        email: 'admin@petrescue.example',
        phone: '+91 98000 00000',
        passwordHash,
        role: 'admin',
        rescuerVerificationStatus: 'not_applicable',
        isActive: true,
      });
    }

    let rescuerUser = await User.findOne({ role: 'rescuer' });
    if (!rescuerUser) {
      const passwordHash = await User.hashPassword('RescuerPass2026!');
      rescuerUser = await User.create({
        name: 'Priya Sundaram (Lead Rescuer)',
        email: 'seed_rescuer@petrescue.example',
        phone: '+91 98450 12345',
        passwordHash,
        role: 'rescuer',
        rescuerVerificationStatus: 'approved',
        isActive: true,
      });
    }

    // Login Admin
    const adminLogin = await postJSON('/auth/login', {
      email: adminUser.email,
      password: process.env.ADMIN_PASSWORD || 'AdminPass2026!',
    });
    testAdminToken = adminLogin.body.token;
    testAdminId = adminUser._id;

    // Register fresh rescuer for testing
    const rescuerEmail = `mod10_rescuer_${Date.now()}@example.com`;
    const rescuerReg = await postJSON('/auth/register', {
      name: 'Badge Test Rescuer',
      email: rescuerEmail,
      password: 'Password123!',
      role: 'rescuer',
      phone: '9876543299'
    });
    testRescuerToken = rescuerReg.body.token;

    // Create unique test donors
    const donorEmail = `mod10_donor_${Date.now()}@example.com`;
    const donorReg = await postJSON('/auth/register', {
      name: 'Badge Test Donor 1',
      email: donorEmail,
      password: 'password123',
      role: 'donor',
      phone: '9876543210'
    });
    testDonorToken = donorReg.body.token;
    testDonorId = donorReg.body.user._id;

    const donor2Email = `mod10_donor2_${Date.now()}@example.com`;
    const donor2Reg = await postJSON('/auth/register', {
      name: 'Badge Test Donor 2',
      email: donor2Email,
      password: 'password123',
      role: 'donor',
      phone: '9876543211'
    });
    testDonor2Token = donor2Reg.body.token;
    testDonor2Id = donor2Reg.body.user._id;

    // Setup 3 approved cases for multi-case testing
    const caseA = await RescueCase.create({
      title: `Badge Case Alpha ${Date.now()}`,
      animalName: 'Alpha Dog',
      animalType: 'Dog',
      breed: 'Indie',
      location: '123 Badge Way, NY',
      description: 'Case for badge testing',
      injuryType: 'Leg Fracture',
      injuryDescription: 'Trauma from accident',
      medicalCondition: 'Under observation',
      urgencyLevel: 'Critical',
      estimatedTreatmentCost: 50000,
      fundraisingGoal: 50000,
      currentDonations: 0,
      campaignStatus: 'Active',
      verificationStatus: 'Approved',
      createdBy: rescuerUser._id,
      verifiedBy: adminUser._id,
      verifiedAt: new Date(),
      isPublished: true
    });
    caseAId = caseA._id;

    const caseB = await RescueCase.create({
      title: `Badge Case Beta ${Date.now()}`,
      animalName: 'Beta Cat',
      animalType: 'Cat',
      breed: 'Stray',
      location: '456 Badge Ave, NY',
      description: 'Second case for badge testing',
      injuryType: 'Malnutrition',
      injuryDescription: 'Severe dehydration and weakness',
      medicalCondition: 'IV drips and supplements',
      urgencyLevel: 'Urgent',
      estimatedTreatmentCost: 30000,
      fundraisingGoal: 30000,
      currentDonations: 0,
      campaignStatus: 'Active',
      verificationStatus: 'Approved',
      createdBy: rescuerUser._id,
      verifiedBy: adminUser._id,
      verifiedAt: new Date(),
      isPublished: true
    });
    caseBId = caseB._id;

    const caseC = await RescueCase.create({
      title: `Badge Case Gamma ${Date.now()}`,
      animalName: 'Gamma Dog',
      animalType: 'Dog',
      breed: 'Lab Mix',
      location: '789 Badge Blvd, NY',
      description: 'Third case for badge testing',
      injuryType: 'Abandonment trauma',
      injuryDescription: 'Skin rash and starvation',
      medicalCondition: 'Medicated bath and nutrition',
      urgencyLevel: 'Normal',
      estimatedTreatmentCost: 20000,
      fundraisingGoal: 20000,
      currentDonations: 0,
      campaignStatus: 'Active',
      verificationStatus: 'Approved',
      createdBy: rescuerUser._id,
      verifiedBy: adminUser._id,
      verifiedAt: new Date(),
      isPublished: true
    });
    caseCId = caseC._id;

    console.log('✓ Setup complete: Users and 3 approved cases created.');

    // Helper: make simulated donation
    const makeDonation = async (token, caseId, amount = 1000) => {
      const res = await postJSON('/donations', {
        caseId: caseId.toString(),
        amount,
        donationMessage: 'Supporting the rescue!',
        isAnonymous: false
      }, token);
      if (res.status !== 201 && res.status !== 200) {
        throw new Error(`Failed to create donation: ${JSON.stringify(res.body)}`);
      }
      return res;
    };

    // TEST 1: First Contribution badge
    console.log('\n--- Test 1: First successful simulated donation awards First Contribution badge ---');
    await makeDonation(testDonorToken, caseAId, 500);
    // Give async event 400ms
    await new Promise(r => setTimeout(r, 400));

    let myAchievements = await getReq('/achievements', testDonorToken);
    let earnedSlugs = myAchievements.body.badges.filter(a => a.isEarned).map(a => a.slug);
    console.log('Earned badges after 1 donation:', earnedSlugs);
    if (!earnedSlugs.includes('first-contribution')) {
      throw new Error('Test 1 Failed: first-contribution badge was not awarded on 1st donation');
    }
    console.log('✓ Test 1 Passed: First Contribution badge awarded successfully.');

    // TEST 2: Helping Hand badge (3 donations)
    console.log('\n--- Test 2: Three successful donations award Helping Hand ---');
    await makeDonation(testDonorToken, caseAId, 500);
    await makeDonation(testDonorToken, caseAId, 500);
    await new Promise(r => setTimeout(r, 400));

    myAchievements = await getReq('/achievements', testDonorToken);
    earnedSlugs = myAchievements.body.badges.filter(a => a.isEarned).map(a => a.slug);
    console.log('Earned badges after 3 donations:', earnedSlugs);
    if (!earnedSlugs.includes('helping-hand')) {
      throw new Error('Test 2 Failed: helping-hand badge was not awarded on 3 donations');
    }
    console.log('✓ Test 2 Passed: Helping Hand badge awarded successfully.');

    // TEST 3: Compassion Champion badge (5 donations)
    console.log('\n--- Test 3: Five successful donations award Compassion Champion ---');
    await makeDonation(testDonorToken, caseAId, 500);
    await makeDonation(testDonorToken, caseAId, 500);
    await new Promise(r => setTimeout(r, 400));

    myAchievements = await getReq('/achievements', testDonorToken);
    earnedSlugs = myAchievements.body.badges.filter(a => a.isEarned).map(a => a.slug);
    console.log('Earned badges after 5 donations:', earnedSlugs);
    if (!earnedSlugs.includes('compassion-champion')) {
      throw new Error('Test 3 Failed: compassion-champion badge was not awarded on 5 donations');
    }
    console.log('✓ Test 3 Passed: Compassion Champion badge awarded successfully.');

    // TEST 4: Ten successful donations award Animal Advocate
    console.log('\n--- Test 4: Ten successful donations award Animal Advocate ---');
    for (let i = 0; i < 5; i++) {
      await makeDonation(testDonorToken, caseAId, 500);
    }
    await new Promise(r => setTimeout(r, 400));

    myAchievements = await getReq('/achievements', testDonorToken);
    earnedSlugs = myAchievements.body.badges.filter(a => a.isEarned).map(a => a.slug);
    console.log('Earned badges after 10 donations:', earnedSlugs);
    if (!earnedSlugs.includes('animal-advocate')) {
      throw new Error('Test 4 Failed: animal-advocate badge was not awarded on 10 donations');
    }
    console.log('✓ Test 4 Passed: Animal Advocate badge awarded successfully.');

    // TEST 5: Supporting three distinct rescue cases awards Rescue Supporter
    console.log('\n--- Test 5: Supporting three distinct rescue cases awards Rescue Supporter ---');
    // So far donor only donated to caseAId. Now donate to caseBId and caseCId
    await makeDonation(testDonorToken, caseBId, 600);
    await makeDonation(testDonorToken, caseCId, 700);
    await new Promise(r => setTimeout(r, 400));

    myAchievements = await getReq('/achievements', testDonorToken);
    earnedSlugs = myAchievements.body.badges.filter(a => a.isEarned).map(a => a.slug);
    console.log('Earned badges after 3 distinct cases:', earnedSlugs);
    if (!earnedSlugs.includes('rescue-supporter')) {
      throw new Error('Test 5 Failed: rescue-supporter badge was not awarded on 3 distinct cases');
    }
    console.log('✓ Test 5 Passed: Rescue Supporter badge awarded successfully.');

    // TEST 6: Duplicate donations do not produce duplicate badges
    console.log('\n--- Test 6: Duplicate donations do not produce duplicate badges ---');
    const badgeCountBefore = await UserAchievement.countDocuments({ userId: testDonorId });
    await makeDonation(testDonorToken, caseAId, 500);
    await new Promise(r => setTimeout(r, 400));
    const badgeCountAfter = await UserAchievement.countDocuments({ userId: testDonorId });
    if (badgeCountBefore !== badgeCountAfter) {
      throw new Error(`Test 6 Failed: Badge count changed from ${badgeCountBefore} to ${badgeCountAfter} without new criteria met`);
    }
    const distinctAchievements = await UserAchievement.distinct('achievementId', { userId: testDonorId });
    if (distinctAchievements.length !== badgeCountAfter) {
      throw new Error(`Test 6 Failed: Duplicate user achievement records detected for user ${testDonorId}`);
    }
    console.log(`✓ Test 6 Passed: Exactly ${badgeCountAfter} unique badges awarded, no duplicates created.`);

    // TEST 7: Failed or invalid donations do not count
    console.log('\n--- Test 7: Failed or invalid donations do not count ---');
    const invalidDonation = await postJSON('/donations', {
      caseId: caseAId.toString(),
      amount: -500 // Invalid amount
    }, testDonor2Token);
    if (invalidDonation.status !== 400) {
      throw new Error(`Expected 400 for invalid donation amount, got ${invalidDonation.status}`);
    }

    const invalidCase = await postJSON('/donations', {
      caseId: '507f1f77bcf86cd799439011', // Non-existent case
      amount: 500
    }, testDonor2Token);
    if (invalidCase.status !== 404 && invalidCase.status !== 400) {
      throw new Error(`Expected 400/404 for non-existent case, got ${invalidCase.status}`);
    }

    const donor2Achievements = await getReq('/achievements', testDonor2Token);
    const donor2Earned = donor2Achievements.body.badges.filter(a => a.isEarned);
    if (donor2Earned.length > 0) {
      throw new Error('Test 7 Failed: Failed or invalid donation awarded a badge!');
    }
    console.log('✓ Test 7 Passed: Invalid donations were rejected and zero badges were awarded.');

    // TEST 8: Donors can view their own achievements and progress
    console.log('\n--- Test 8: Donors can view their own achievements with progress ---');
    const myResp = await getReq('/achievements', testDonorToken);
    const myBadges = await getReq('/achievements/my', testDonorToken);
    if (myResp.status !== 200 || !myResp.body.success || !myResp.body.stats) {
      throw new Error('Test 8 Failed: /api/achievements did not return valid response');
    }
    if (myBadges.status !== 200 || !myBadges.body.success) {
      throw new Error('Test 8 Failed: /api/achievements/my did not return valid response');
    }
    if (myResp.body.totalEarned !== 5 || myBadges.body.badges.length !== 5) {
      throw new Error(`Test 8 Failed: Expected 5 earned badges, got totalEarned=${myResp.body.totalEarned}, myBadges=${myBadges.body.badges.length}`);
    }
    console.log(`✓ Test 8 Passed: Donor retrieved achievement overview with stats:`, myResp.body.stats);

    // TEST 9: Donors cannot modify their earned badges directly
    console.log('\n--- Test 9: Donors cannot modify earned badges directly (No unauthorized endpoints) ---');
    const patchDirect = await patchJSON(`/admin/achievements/${distinctAchievements[0]}`, {
      name: 'Hacked Badge'
    }, testDonorToken);
    if (patchDirect.status !== 403) {
      throw new Error(`Test 9 Failed: Donor was able to access admin endpoint with status ${patchDirect.status}`);
    }
    console.log('✓ Test 9 Passed: Non-admin direct badge modification blocked with 403 Forbidden.');

    // TEST 10: Only opted-in donors appear on the public leaderboard
    console.log('\n--- Test 10: Only opted-in donors appear on the public leaderboard ---');
    let publicLeaderboard = await getReq('/donors/leaderboard');
    let isDonorInList = publicLeaderboard.body.leaderboard.some(e => e._id.toString() === testDonorId.toString());
    if (isDonorInList) {
      throw new Error('Test 10 Failed: Donor appeared on leaderboard before opting in!');
    }

    // Now opt in donor 1
    const updateSettingsRes = await patchJSON('/donors/recognition-settings', {
      showOnLeaderboard: true,
      displayName: 'Starlight Rescuer',
      showDonationTotal: false
    }, testDonorToken);
    if (updateSettingsRes.status !== 200 || !updateSettingsRes.body.settings.showOnLeaderboard) {
      throw new Error('Failed to update recognition settings');
    }

    publicLeaderboard = await getReq('/donors/leaderboard');
    const donorLeaderboardEntry = publicLeaderboard.body.leaderboard.find(e => e._id.toString() === testDonorId.toString());
    if (!donorLeaderboardEntry) {
      throw new Error('Test 10 Failed: Donor did not appear on leaderboard after opting in!');
    }
    if (donorLeaderboardEntry.displayName !== 'Starlight Rescuer') {
      throw new Error(`Test 10 Failed: Display name mismatch. Expected 'Starlight Rescuer', got '${donorLeaderboardEntry.displayName}'`);
    }
    console.log('✓ Test 10 Passed: Opted-in donor correctly appeared on leaderboard with custom alias.');

    // TEST 11: Disabling public recognition immediately removes donor from leaderboard
    console.log('\n--- Test 11: Disabling public recognition immediately removes donor ---');
    await patchJSON('/donors/recognition-settings', {
      showOnLeaderboard: false
    }, testDonorToken);

    publicLeaderboard = await getReq('/donors/leaderboard');
    isDonorInList = publicLeaderboard.body.leaderboard.some(e => e._id.toString() === testDonorId.toString());
    if (isDonorInList) {
      throw new Error('Test 11 Failed: Donor was still on leaderboard after opting out!');
    }
    console.log('✓ Test 11 Passed: Donor immediately disappeared from leaderboard upon opt-out.');

    // TEST 12: Private donation totals remain hidden by default
    console.log('\n--- Test 12: Private donation totals remain hidden by default ---');
    // Opt back in with showDonationTotal: false
    await patchJSON('/donors/recognition-settings', {
      showOnLeaderboard: true,
      showDonationTotal: false
    }, testDonorToken);

    publicLeaderboard = await getReq('/donors/leaderboard');
    const entryHidden = publicLeaderboard.body.leaderboard.find(e => e._id.toString() === testDonorId.toString());
    if (entryHidden.totalSimulatedAmount !== undefined && entryHidden.showsTotal) {
      throw new Error(`Test 12 Failed: totalSimulatedAmount was exposed when showsTotal is false!`);
    }

    // Now enable donation total visibility
    await patchJSON('/donors/recognition-settings', {
      showOnLeaderboard: true,
      showDonationTotal: true
    }, testDonorToken);

    publicLeaderboard = await getReq('/donors/leaderboard');
    const entryVisible = publicLeaderboard.body.leaderboard.find(e => e._id.toString() === testDonorId.toString());
    if (!entryVisible.showsTotal || typeof entryVisible.totalSimulatedAmount !== 'number' || entryVisible.totalSimulatedAmount <= 0) {
      throw new Error(`Test 12 Failed: totalSimulatedAmount was not visible when showDonationTotal is true! Got ${entryVisible.totalSimulatedAmount}`);
    }
    console.log(`✓ Test 12 Passed: Donation total properly masked when false and revealed (${entryVisible.totalSimulatedAmount} INR) when true.`);

    // TEST 13: Non-admin users cannot manage achievements
    console.log('\n--- Test 13: Non-admin users cannot manage achievements ---');
    const rescuerAdminCheck = await getReq('/admin/achievements', testRescuerToken);
    if (rescuerAdminCheck.status !== 403) {
      throw new Error(`Test 13 Failed: Rescuer accessed /api/admin/achievements with status ${rescuerAdminCheck.status}`);
    }
    const adminAccessCheck = await getReq('/admin/achievements', testAdminToken);
    if (adminAccessCheck.status !== 200 || !adminAccessCheck.body.success) {
      throw new Error(`Test 13 Failed: Admin could not access /api/admin/achievements`);
    }
    console.log('✓ Test 13 Passed: Access control strictly enforced (Rescuer: 403, Admin: 200).');

    // TEST 14: Leaderboard pagination works correctly
    console.log('\n--- Test 14: Leaderboard pagination works correctly ---');
    // Also opt in donor 2 with 1 donation
    await makeDonation(testDonor2Token, caseAId, 100);
    await patchJSON('/donors/recognition-settings', {
      showOnLeaderboard: true,
      displayName: 'Generous Donor 2'
    }, testDonor2Token);

    const page1 = await getReq('/donors/leaderboard?page=1&limit=1');
    if (page1.body.leaderboard.length !== 1 || page1.body.totalDonors < 2) {
      throw new Error(`Test 14 Failed: Page 1 limit 1 pagination failed`);
    }
    const page2 = await getReq('/donors/leaderboard?page=2&limit=1');
    if (page2.body.leaderboard.length !== 1 || page2.body.leaderboard[0]._id === page1.body.leaderboard[0]._id) {
      throw new Error(`Test 14 Failed: Page 2 did not return the distinct next donor`);
    }
    console.log('✓ Test 14 Passed: Leaderboard pagination offsets and deterministic sorting verified.');

    // TEST 15: Notifications generated and not duplicated
    console.log('\n--- Test 15: Notifications generated and not duplicated ---');
    const notifs = await Notification.find({
      recipient: testDonorId,
      title: /New Badge Earned/
    });
    console.log(`Found ${notifs.length} achievement notifications for donor 1.`);
    if (notifs.length < 5) {
      throw new Error(`Test 15 Failed: Expected at least 5 achievement notifications, found ${notifs.length}`);
    }
    // Check that each badge only has 1 notification
    const titles = notifs.map(n => n.title);
    const uniqueTitles = new Set(titles);
    if (titles.length !== uniqueTitles.size) {
      throw new Error('Test 15 Failed: Duplicate notification found for the same achievement!');
    }
    console.log('✓ Test 15 Passed: Unique achievement unlocked notifications generated without duplicates.');

    console.log('\n====================================================');
    console.log('ALL 15 MODULE 10 TESTS PASSED SUCCESSFULLY! 🌟');
    console.log('====================================================\n');

  } catch (err) {
    console.error('MODULE 10 TEST FAILURE:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

runModule10Tests();
