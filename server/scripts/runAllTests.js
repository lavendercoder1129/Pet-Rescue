import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const testSuites = [
  { name: 'Module 3: Authentication & Roles', script: 'testAuth.js' },
  { name: 'Module 4: Rescue Cases Intake & Triage', script: 'testCases.js' },
  { name: 'Module 5: Admin Case Verification Workflow', script: 'testModule5.js' },
  { name: 'Module 6: Simulated Donations & Digital Receipts', script: 'testModule6.js' },
  { name: 'Module 7: Fund Allocation & Financial Transparency', script: 'testModule7.js' },
  { name: 'Module 8: Expense Proof Upload & Bill Auditing', script: 'testModule8.js' },
  { name: 'Module 9: Clinical Updates & Emergency Announcements', script: 'testModule9.js' },
  { name: 'Module 10: Donor Recognition & Achievement Badges', script: 'testModule10.js' },
  { name: 'Module 11: Role Dashboard Integration & Security Guardrails', script: 'testModule11.js' },
];

const runCommand = (file) => {
  return new Promise((resolve) => {
    const child = spawn('node', [path.join(__dirname, file)], {
      stdio: 'inherit',
      env: process.env,
    });
    child.on('close', (code) => {
      resolve(code === 0);
    });
  });
};

const runAllTests = async () => {
  console.log('================================================================');
  console.log('🐾 PET RESCUE: MASTER FULL REGRESSION TEST RUNNER (MODULES 0-11)');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;
  const failedSuites = [];

  for (const suite of testSuites) {
    console.log(`\n▶ EXECUTING SUITE: ${suite.name} (${suite.script})`);
    console.log('----------------------------------------------------------------');
    const success = await runCommand(suite.script);
    if (success) {
      console.log(`✓ SUITE PASSED: ${suite.name}`);
      passed++;
    } else {
      console.error(`✗ SUITE FAILED: ${suite.name}`);
      failed++;
      failedSuites.push(suite.name);
    }
  }

  console.log('\n================================================================');
  console.log('🎯 MASTER TEST RUNNER SUMMARY:');
  console.log(`   Total Suites: ${testSuites.length}`);
  console.log(`   Passed:       ${passed}`);
  console.log(`   Failed:       ${failed}`);
  if (failed > 0) {
    console.log('   Failed Suites:', failedSuites);
  }
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🌟 ALL AUTOMATED TEST SUITES PASSED FLAWLESSLY! 🐾\n');
    process.exit(0);
  }
};

runAllTests();
