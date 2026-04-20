/**
 * PHASE 6: ADVANCED TESTING
 * Covers:
 * 1. Bulk Student Testing - Create & process multiple students
 * 2. Concurrent Workflow Scans - Parallel scanning at same station
 * 3. Error Scenario Testing - Invalid transitions, duplicates, etc.
 * 4. Performance Metrics - Scan speed, DB response times
 * 5. Load Testing - 10+ simultaneous scans
 */

const axios = require("axios");
const mongoose = require("mongoose");
require("dotenv").config();

const API_BASE = "http://localhost:5000/api";
const Student = require("../models/student.model");
const Staff = require("../models/staff.model");

// Color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${"─".repeat(80)}`, "cyan");
  log(`📋 ${title}`, "cyan");
  log(`${"─".repeat(80)}`, "cyan");
}

function logPass(message, value = "") {
  console.log(`${colors.green}✅ ${message}${colors.reset}${value ? ` ${value}` : ""}`);
}

function logFail(message, value = "") {
  console.log(
    `${colors.red}❌ ${message}${colors.reset}${value ? ` ${value}` : ""}`
  );
}

function logInfo(message, value = "") {
  console.log(
    `${colors.blue}ℹ️  ${message}${colors.reset}${value ? ` ${value}` : ""}`
  );
}

// Staff login helper
async function loginStaff(email, password) {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email,
      password,
    });
    return response.data.token;
  } catch (error) {
    throw new Error(`Login failed for ${email}`);
  }
}

// Scan helper with performance tracking
async function scanQR(token, qrToken, scanType, measureTime = true) {
  const startTime = measureTime ? Date.now() : null;
  try {
    const response = await axios.post(
      `${API_BASE}/scan`,
      { qrToken, scanType },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const duration = measureTime ? Date.now() - startTime : null;
    return { success: true, data: response.data, duration };
  } catch (error) {
    const duration = measureTime ? Date.now() - startTime : null;
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      duration,
    };
  }
}

// ============================
// TEST 1: BULK STUDENT CREATION
// ============================
async function testBulkStudentCreation() {
  logSection("TEST 1: BULK STUDENT CREATION");

  const testStudents = [
    { id: "23101A0031", name: "Raj Kumar", dept: "CSE" },
    { id: "23101A0032", name: "Priya Singh", dept: "ECE" },
    { id: "23101A0033", name: "Amit Patel", dept: "MECH" },
    { id: "23101A0034", name: "Neha Verma", dept: "CIVIL" },
    { id: "23101A0035", name: "Rohit Sharma", dept: "IT" },
    { id: "23101A0036", name: "Sneha Gupta", dept: "CSE" },
    { id: "23101A0037", name: "Arjun Reddy", dept: "ECE" },
    { id: "23101A0038", name: "Divya Nair", dept: "MECH" },
    { id: "23101A0039", name: "Kunal Joshi", dept: "CIVIL" },
    { id: "23101A0040", name: "Zara Khan", dept: "IT" },
  ];

  let successCount = 0;
  let alreadyExistCount = 0;

  logInfo(`Creating ${testStudents.length} test students...`);

  for (const student of testStudents) {
    try {
      const newStudent = await Student.create({
        studentId: student.id,
        qrToken: student.id,
        name: student.name,
        email: `${student.name.toLowerCase().replace(/\s/g, ".")}@vit.edu.in`,
        phone: "9999999999",
        department: student.dept,
        state: "REGISTERED",
        timestamps: {},
        gown: { issued: false, returned: false },
      });
      successCount++;
      logPass(`${student.id} - ${student.name} (${student.dept})`);
    } catch (error) {
      if (error.code === 11000) {
        alreadyExistCount++;
        logPass(`${student.id} - ${student.name} (${student.dept}) [Already exists]`);
      } else {
        logFail(`${student.id} - ${error.message}`);
      }
    }
  }

  const totalSuccess = successCount + alreadyExistCount;
  log(`\nCreation Summary: ${totalSuccess}/${testStudents.length} successful (${successCount} new, ${alreadyExistCount} existing)`);
  return totalSuccess === testStudents.length;
}

// ============================
// TEST 2: CONCURRENT SCANS
// ============================
async function testConcurrentScans() {
  logSection("TEST 2: CONCURRENT SCANNING AT SAME STATION");

  const entryToken = await loginStaff(
    "entry@convocation.com",
    "Staff@Vit"
  );
  const testQRs = [
    "23101A0031",
    "23101A0032",
    "23101A0033",
    "23101A0034",
    "23101A0035",
  ];

  logInfo(`Scanning ${testQRs.length} students simultaneously at ENTRY...`);

  const startTime = Date.now();
  const scanPromises = testQRs.map((qr) =>
    scanQR(entryToken, qr, "ENTRY", true)
  );

  const results = await Promise.all(scanPromises);
  const totalTime = Date.now() - startTime;

  let successCount = 0;
  const durations = [];

  results.forEach((result, index) => {
    if (result.success) {
      successCount++;
      durations.push(result.duration);
      logPass(
        `${testQRs[index]} - Scan processed`,
        `(${result.duration}ms)`
      );
    } else {
      logFail(`${testQRs[index]} - ${result.error}`);
    }
  });

  const avgDuration = durations.length > 0
    ? Math.round(durations.reduce((a, b) => a + b) / durations.length)
    : 0;
  const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;

  log(
    `\nConcurrent Scan Summary:`,
    "bright"
  );
  logInfo(`Total time: ${totalTime}ms`);
  logInfo(`Average scan time: ${avgDuration}ms`);
  logInfo(`Max scan time: ${maxDuration}ms`);
  logInfo(`Success rate: ${successCount}/${testQRs.length}`);

  return successCount === testQRs.length;
}

// ============================
// TEST 3: ERROR SCENARIOS
// ============================
async function testErrorScenarios() {
  logSection("TEST 3: ERROR SCENARIO TESTING");

  const entryToken = await loginStaff(
    "entry@convocation.com",
    "Staff@Vit"
  );
  const testQR = "23101A0031";

  let errorTests = [
    {
      name: "Invalid QR Code",
      qr: "INVALID_QR_12345",
      type: "ENTRY",
      expectedError: "Student not found",
    },
    {
      name: "Wrong Scan Order (SEATING before ENTRY for new student)",
      qr: "23101A0034",
      type: "SEATING",
      expectedError: "Invalid stage transition",
    },
  ];

  let passedTests = 0;

  for (const test of errorTests) {
    logInfo(`\nTesting: ${test.name}`);
    const result = await scanQR(entryToken, test.qr, test.type, false);

    if (!result.success) {
      logPass(`Correctly rejected: ${result.error}`);
      passedTests++;
    } else {
      logFail(`Should have been rejected but succeeded`);
    }
  }

  log(
    `\nError Handling Summary: ${passedTests}/${errorTests.length} tests passed`,
    "bright"
  );
  return passedTests === errorTests.length;
}

// ============================
// TEST 4: FULL WORKFLOW (NEW STUDENTS)
// ============================
async function testFullWorkflowNewStudents() {
  logSection("TEST 4: FULL WORKFLOW WITH NEW STUDENTS");

  const staffStations = {
    ENTRY: { email: "entry@convocation.com", password: "Staff@Vit" },
    SEATING: { email: "seating@convocation.com", password: "Staff@Vit" },
    GOWN: { email: "gown@convocation.com", password: "Staff@Vit" },
    RETURN: { email: "return@convocation.com", password: "Staff@Vit" },
  };

  const testStudents = ["23101A0032", "23101A0033"];
  let completedCount = 0;

  for (const studentQR of testStudents) {
    logInfo(`\nProcessing student: ${studentQR}`);

    try {
      let currentState = "REGISTERED";

      for (const [scanType, staffCreds] of Object.entries(staffStations)) {
        const token = await loginStaff(staffCreds.email, staffCreds.password);
        const result = await scanQR(token, studentQR, scanType, true);

        if (result.success) {
          logPass(`${scanType} - Success (${result.duration}ms)`, `→ ${result.data.state}`);
          currentState = result.data.state;
        } else {
          logFail(`${scanType} - ${result.error}`);
          break;
        }
      }

      if (currentState === "COMPLETED") {
        logPass(`Student ${studentQR} completed full workflow`);
        completedCount++;
      }
    } catch (error) {
      logFail(`Error processing ${studentQR}: ${error.message}`);
    }
  }

  log(
    `\nWorkflow Summary: ${completedCount}/${testStudents.length} students completed`,
    "bright"
  );
  return completedCount === testStudents.length;
}

// ============================
// TEST 5: DATABASE CONSISTENCY
// ============================
async function testDatabaseConsistency() {
  logSection("TEST 5: DATABASE CONSISTENCY CHECK");

  try {
    const totalStudents = await Student.countDocuments();
    const completedStudents = await Student.countDocuments({
      state: "COMPLETED",
    });
    const checkedInStudents = await Student.countDocuments({
      state: "CHECKED_IN",
    });
    const seatedStudents = await Student.countDocuments({
      state: "SEATED",
    });
    const gownStudents = await Student.countDocuments({
      state: "GOWN_ISSUED",
    });
    const registeredStudents = await Student.countDocuments({
      state: "REGISTERED",
    });

    logInfo(`Total students in database: ${totalStudents}`);
    logInfo(`  REGISTERED: ${registeredStudents}`);
    logInfo(`  CHECKED_IN: ${checkedInStudents}`);
    logInfo(`  SEATED: ${seatedStudents}`);
    logInfo(`  GOWN_ISSUED: ${gownStudents}`);
    logInfo(`  COMPLETED: ${completedStudents}`);

    // Verify all students have valid data
    const invalidStudents = await Student.find({
      $or: [
        { name: null },
        { name: "" },
        { email: null },
        { email: "" },
        { department: null },
      ],
    });

    if (invalidStudents.length === 0) {
      logPass(`All ${totalStudents} students have valid data`);
      return true;
    } else {
      logFail(`Found ${invalidStudents.length} students with invalid data`);
      return false;
    }
  } catch (error) {
    logFail(`Database check failed: ${error.message}`);
    return false;
  }
}

// ============================
// TEST 6: PERFORMANCE METRICS
// ============================
async function testPerformanceMetrics() {
  logSection("TEST 6: PERFORMANCE METRICS");

  const entryToken = await loginStaff(
    "entry@convocation.com",
    "Staff@Vit"
  );
  const iterations = 10;
  const durations = [];

  logInfo(`Running ${iterations} scan operations...`);

  for (let i = 0; i < iterations; i++) {
    const testQR = `23101A00${40 + i}`;
    const result = await scanQR(entryToken, testQR, "ENTRY", true);

    if (result.success) {
      durations.push(result.duration);
    }
  }

  if (durations.length > 0) {
    const avgDuration = Math.round(
      durations.reduce((a, b) => a + b) / durations.length
    );
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    const p95 = durations.sort((a, b) => a - b)[
      Math.floor(durations.length * 0.95)
    ];

    logInfo(`Average scan time: ${avgDuration}ms`);
    logInfo(`Min scan time: ${minDuration}ms`);
    logInfo(`Max scan time: ${maxDuration}ms`);
    logInfo(`P95 (95th percentile): ${p95}ms`);

    if (avgDuration < 500) {
      logPass(`Performance goal met (avg < 500ms)`);
    } else {
      logFail(`Performance needs improvement (avg: ${avgDuration}ms)`);
    }

    return avgDuration < 500;
  }

  return false;
}

// ============================
// TEST 7: LOAD TEST
// ============================
async function testLoadHandling() {
  logSection("TEST 7: LOAD TEST (10+ CONCURRENT OPERATIONS)");

  const staffStations = {
    ENTRY: { email: "entry@convocation.com", password: "Staff@Vit" },
    SEATING: { email: "seating@convocation.com", password: "Staff@Vit" },
    GOWN: { email: "gown@convocation.com", password: "Staff@Vit" },
  };

  // Use existing student IDs from bulk creation (23101A0031-0040)
  const testStudentIds = [
    "23101A0035",
    "23101A0036",
    "23101A0037",
    "23101A0038",
    "23101A0039",
    "23101A0040",
  ];

  logInfo(`Starting 15 concurrent scan operations across 3 stations...`);

  const startTime = Date.now();
  const operations = [];

  // Create 15 concurrent operations (5 students × 3 stations)
  for (const studentId of testStudentIds) {
    for (const [scanType, staffCreds] of Object.entries(staffStations)) {
      const token = await loginStaff(staffCreds.email, staffCreds.password);

      operations.push(
        scanQR(token, studentId, scanType, true).then((result) => ({
          qr: studentId,
          scanType,
          success: result.success,
          duration: result.duration,
        }))
      );
    }
  }

  const results = await Promise.all(operations);
  const totalTime = Date.now() - startTime;

  const successCount = results.filter((r) => r.success).length;
  const avgDuration = Math.round(
    results.reduce((a, b) => a + (b.duration || 0), 0) / results.length
  );

  logInfo(`Total operations: ${results.length}`);
  logInfo(`Successful: ${successCount}`);
  logInfo(`Failed: ${results.length - successCount}`);
  logInfo(`Total time: ${totalTime}ms`);
  logInfo(`Average operation time: ${avgDuration}ms`);

  if (successCount >= results.length * 0.8) {
    logPass(`Load test passed (${Math.round((successCount / results.length) * 100)}% success rate)`);
    return true;
  } else {
    logFail(
      `Load test failed (${Math.round((successCount / results.length) * 100)}% success rate)`
    );
    return false;
  }
}

// ============================
// MAIN TEST RUNNER
// ============================
async function runPhase6Tests() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    log("\n╔════════════════════════════════════════════════════════════════════════════════╗", "bright");
    log("║            🔥 PHASE 6: ADVANCED TESTING - LOAD & STRESS TEST                   ║", "bright");
    log("╚════════════════════════════════════════════════════════════════════════════════╝", "bright");

    const testResults = [];

    // Run all tests
    const test1 = await testBulkStudentCreation();
    testResults.push({ name: "Bulk Student Creation", passed: test1 });

    const test2 = await testConcurrentScans();
    testResults.push({ name: "Concurrent Scanning", passed: test2 });

    const test3 = await testErrorScenarios();
    testResults.push({ name: "Error Scenarios", passed: test3 });

    const test4 = await testFullWorkflowNewStudents();
    testResults.push({ name: "Full Workflow", passed: test4 });

    const test5 = await testDatabaseConsistency();
    testResults.push({ name: "Database Consistency", passed: test5 });

    const test6 = await testPerformanceMetrics();
    testResults.push({ name: "Performance Metrics", passed: test6 });

    const test7 = await testLoadHandling();
    testResults.push({ name: "Load Handling", passed: test7 });

    // Summary
    logSection("PHASE 6 TEST SUMMARY");

    const passedCount = testResults.filter((t) => t.passed).length;
    const totalCount = testResults.length;

    testResults.forEach((test) => {
      if (test.passed) {
        logPass(test.name);
      } else {
        logFail(test.name);
      }
    });

    log(
      `\n═══════════════════════════════════════════════════════════════════════════════`,
      "bright"
    );

    if (passedCount === totalCount) {
      log(`✅ ✅ ✅ PHASE 6 COMPLETE - ALL TESTS PASSED ✅ ✅ ✅`, "green");
      log(`🚀 SYSTEM READY FOR PRODUCTION`, "green");
    } else {
      log(
        `⚠️  PHASE 6 COMPLETE - ${passedCount}/${totalCount} TESTS PASSED`,
        "yellow"
      );
    }

    log(
      `═══════════════════════════════════════════════════════════════════════════════\n`,
      "bright"
    );

    log(`📊 RESULTS: ${passedCount}/${totalCount} (${Math.round((passedCount / totalCount) * 100)}%)\n`, "bright");

    await mongoose.connection.close();
    process.exit(passedCount === totalCount ? 0 : 1);
  } catch (error) {
    logFail(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runPhase6Tests();
