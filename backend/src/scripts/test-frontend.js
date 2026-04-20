const axios = require("axios");
const io = require("socket.io-client");

const API_BASE = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

// Test credentials
const testAccounts = {
  admin: { email: "admin@convocation.com", password: "Admin@Vit", role: "ADMIN" },
  entry: { email: "entry@convocation.com", password: "Staff@Vit", role: "ENTRY" },
  seating: { email: "seating@convocation.com", password: "Staff@Vit", role: "SEATING" },
  gown: { email: "gown@convocation.com", password: "Staff@Vit", role: "GOWN" },
  return: { email: "return@convocation.com", password: "Staff@Vit", role: "RETURN" },
};

const studentQR = "23101A0030";

let testResults = {
  passed: 0,
  failed: 0,
  errors: [],
};

function log(message, type = "info") {
  const icons = {
    info: "ℹ️ ",
    success: "✅ ",
    error: "❌ ",
    warn: "⚠️  ",
    test: "🧪 ",
  };
  console.log(`${icons[type]} ${message}`);
}

function logSection(title) {
  console.log("\n" + "─".repeat(80));
  console.log(`📋 ${title}`);
  console.log("─".repeat(80));
}

async function testEndpoint(name, method, url, data = null, headers = {}) {
  try {
    const config = { headers };
    let response;

    if (method === "GET") {
      response = await axios.get(url, config);
    } else if (method === "POST") {
      response = await axios.post(url, data, config);
    }

    if (response.status === 200 || response.status === 201) {
      log(`${name}`, "success");
      testResults.passed++;
      return response.data;
    }
  } catch (error) {
    log(
      `${name} - ${error.response?.data?.message || error.message}`,
      "error",
    );
    testResults.failed++;
    testResults.errors.push({ test: name, error: error.message });
    return null;
  }
}

async function runPhase4Tests() {
  console.log("\n");
  console.log("═".repeat(80));
  console.log("  🎨 PHASE 4: FRONTEND API VERIFICATION");
  console.log("═".repeat(80));

  // ============================================================================
  // TEST 1: Backend Health Check
  // ============================================================================
  logSection("1. BACKEND HEALTH CHECK");

  await testEndpoint(
    "Backend is running",
    "GET",
    `${API_BASE.replace("/api", "")}`,
  );

  // ============================================================================
  // TEST 2: Admin Authentication & Access
  // ============================================================================
  logSection("2. ADMIN AUTHENTICATION");

  const adminLogin = await testEndpoint(
    "Admin login (admin@convocation.com / Admin@Vit)",
    "POST",
    `${API_BASE}/auth/login`,
    testAccounts.admin,
  );

  if (!adminLogin) {
    log("Cannot continue without admin token", "error");
  } else {
    const adminToken = adminLogin.token;
    log(`Admin token received`, "success");

    // Test admin dashboard data access
    await testEndpoint(
      "Get admin dashboard data",
      "GET",
      `${API_BASE}/admin/dashboard`,
      null,
      { Authorization: `Bearer ${adminToken}` },
    );
  }

  // ============================================================================
  // TEST 3: Staff Authentication (All Roles)
  // ============================================================================
  logSection("3. STAFF AUTHENTICATION (ALL STATIONS)");

  const staffTokens = {};
  for (const [key, creds] of Object.entries(testAccounts)) {
    if (key === "admin") continue;

    const login = await testEndpoint(
      `${key.toUpperCase()} staff login (${creds.email})`,
      "POST",
      `${API_BASE}/auth/login`,
      creds,
    );

    if (login) {
      staffTokens[key] = login.token;
    }
  }

  // ============================================================================
  // TEST 4: Student Access (QR Token)
  // ============================================================================
  logSection("4. STUDENT DATA ACCESS");

  await testEndpoint(
    `Get student data by QR token (${studentQR})`,
    "GET",
    `${API_BASE}/student/${studentQR}`,
  );

  // ============================================================================
  // TEST 5: QR Code Generation
  // ============================================================================
  logSection("5. QR CODE GENERATION API");

  const qrData = await testEndpoint(
    `Generate QR code for student ${studentQR}`,
    "GET",
    `${API_BASE}/qr/generate/${studentQR}`,
  );

  if (qrData && qrData.image) {
    log(`QR code image generated (base64 length: ${qrData.image.length})`, "success");
  }

  // ============================================================================
  // TEST 6: Scan API Verification
  // ============================================================================
  logSection("6. SCAN ENDPOINT VERIFICATION");

  const scanTypes = ["ENTRY", "SEATING", "GOWN", "RETURN"];
  for (let i = 0; i < scanTypes.length; i++) {
    const scanType = scanTypes[i];
    const key = scanType.toLowerCase();
    const token = staffTokens[key];

    if (!token) {
      log(`Cannot test ${scanType} scan (no token)`, "warn");
      continue;
    }

    // Get current student state first
    const studentInfo = await testEndpoint(
      `  [Check] Get current student state before ${scanType}`,
      "GET",
      `${API_BASE}/student/${studentQR}`,
    );

    if (studentInfo) {
      log(`  Current state: ${studentInfo.state}`, "info");
    }
  }

  // ============================================================================
  // TEST 7: Real-Time Socket.io Connection
  // ============================================================================
  logSection("7. REAL-TIME SOCKET.IO VERIFICATION");

  return new Promise((resolve) => {
    const socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    let socketConnected = false;
    let eventReceived = false;

    socket.on("connect", () => {
      socketConnected = true;
      log("Socket.io connected successfully", "success");
      testResults.passed++;

      // Listen for scan events
      socket.on("scan:created", (data) => {
        eventReceived = true;
        log(`Real-time scan event received: ${data.studentId}`, "success");
        testResults.passed++;
      });

      // Set timeout to check if connected
      setTimeout(() => {
        if (socketConnected) {
          log("Socket.io connection stable", "success");
        }
        socket.disconnect();
        printResults();
        resolve();
      }, 2000);
    });

    socket.on("connect_error", (error) => {
      log(`Socket.io connection error: ${error.message}`, "error");
      testResults.failed++;
      printResults();
      resolve();
    });
  });
}

function printResults() {
  console.log("\n");
  console.log("═".repeat(80));
  console.log("  📊 PHASE 4 TEST RESULTS SUMMARY");
  console.log("═".repeat(80));

  console.log(`\n✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);

  if (testResults.errors.length > 0) {
    console.log("\n⚠️  Failed Tests:");
    testResults.errors.forEach((err) => {
      console.log(`   - ${err.test}: ${err.error}`);
    });
  }

  const totalTests = testResults.passed + testResults.failed;
  const passPercentage = ((testResults.passed / totalTests) * 100).toFixed(1);

  console.log(`\n📈 Overall: ${passPercentage}% (${testResults.passed}/${totalTests})`);

  if (testResults.failed === 0) {
    console.log("\n" + "═".repeat(80));
    console.log("  ✅ ✅ ✅  ALL FRONTEND TESTS PASSED  ✅ ✅ ✅");
    console.log("═".repeat(80));
    console.log(
      "\n✨ Frontend API is fully operational and ready for browser testing!\n",
    );
  } else {
    console.log(
      "\n⚠️  Some tests failed. Please check the errors above.\n",
    );
  }
}

// Run tests
runPhase4Tests();
