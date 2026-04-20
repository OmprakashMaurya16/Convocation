const axios = require("axios");

const API_BASE = "http://localhost:5000/api";
const STUDENT_QR = "23101A0030";

// Staff credentials for each station
const staffCredentials = {
  entry: { email: "entry@convocation.com", password: "Staff@Vit", role: "ENTRY" },
  seating: { email: "seating@convocation.com", password: "Staff@Vit", role: "SEATING" },
  gown: { email: "gown@convocation.com", password: "Staff@Vit", role: "GOWN" },
  return: { email: "return@convocation.com", password: "Staff@Vit", role: "RETURN" },
};

// Station sequence
const stations = [
  { name: "Entry Gate", type: "ENTRY", key: "entry", expectedState: "CHECKED_IN" },
  { name: "Seating Station", type: "SEATING", key: "seating", expectedState: "SEATED" },
  { name: "Gown Counter", type: "GOWN", key: "gown", expectedState: "GOWN_ISSUED" },
  { name: "Return Counter", type: "RETURN", key: "return", expectedState: "COMPLETED" },
];

// Helper function to login staff
async function loginStaff(email, password) {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email,
      password,
    });
    if (response.data.success) {
      return response.data.token;
    }
  } catch (error) {
    console.error(`❌ Login failed for ${email}:`, error.response?.data?.message || error.message);
    throw error;
  }
}

// Helper function to get student info
async function getStudentInfo() {
  try {
    const response = await axios.get(`${API_BASE}/student/${STUDENT_QR}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to get student info:`, error.message);
    throw error;
  }
}

// Helper function to scan QR code
async function scanQR(token, scanType) {
  try {
    const response = await axios.post(
      `${API_BASE}/scan`,
      { qrToken: STUDENT_QR, scanType },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  } catch (error) {
    console.error(
      `❌ Scan failed for ${scanType}:`,
      error.response?.data?.message || error.message,
    );
    throw error;
  }
}

// Main test function
async function runFullWorkflowTest() {
  console.log("\n");
  console.log("═".repeat(80));
  console.log("  🎓 CONVOCATION EVENT - FULL WORKFLOW SIMULATION");
  console.log("═".repeat(80));
  console.log(`\n📱 Testing Student: ${STUDENT_QR} (Omprakash Maurya)\n`);

  try {
    // Check initial state
    console.log("📋 Initial Student State:");
    let studentData = await getStudentInfo();
    console.log(`   State: ${studentData.state}`);
    console.log(`   Name: ${studentData.name}`);
    console.log(`   Department: ${studentData.department}\n`);

    // Run through each station
    for (let i = 0; i < stations.length; i++) {
      const station = stations[i];
      const staffCreds = staffCredentials[station.key];

      console.log(`\n${"─".repeat(80)}`);
      console.log(`⏳ STATION ${i + 1}/4: ${station.name}`);
      console.log(`─`.repeat(80));
      console.log(`📍 Location: ${station.name}`);
      console.log(`👤 Staff: ${staffCreds.email} (${staffCreds.role})`);
      console.log(`📱 Scan Type: ${station.type}`);

      // Login staff
      console.log(`\n🔐 Authenticating staff...`);
      const token = await loginStaff(staffCreds.email, staffCreds.password);
      console.log(`✅ Staff authenticated`);

      // Perform scan
      console.log(`\n📸 Scanning QR code...`);
      const scanResult = await scanQR(token, station.type);

      if (scanResult.success) {
        console.log(`✅ Scan successful!`);
        console.log(`   Previous State: ${studentData.state}`);
        console.log(`   New State: ${scanResult.state}`);
        console.log(`   Expected: ${station.expectedState}`);

        if (scanResult.state === station.expectedState) {
          console.log(`   ✅ State transition CORRECT`);
        } else {
          console.log(`   ⚠️  State mismatch! Expected ${station.expectedState}, got ${scanResult.state}`);
        }

        studentData.state = scanResult.state;
      } else {
        console.log(`❌ Scan failed: ${scanResult.message}`);
        throw new Error(`Scan at ${station.name} failed`);
      }
    }

    // Final verification
    console.log(`\n${"─".repeat(80)}`);
    console.log("📊 FINAL VERIFICATION");
    console.log(`─`.repeat(80));

    const finalData = await getStudentInfo();
    console.log(`\n✅ Final Student State: ${finalData.state}`);
    console.log(`✅ Student Journey Complete!`);

    if (finalData.state === "COMPLETED") {
      console.log(`\n${"═".repeat(80)}`);
      console.log(`  ✅ ✅ ✅  WORKFLOW TEST PASSED SUCCESSFULLY  ✅ ✅ ✅`);
      console.log(`═`.repeat(80));
      console.log(`\n🎉 Student ${STUDENT_QR} completed the entire convocation event!\n`);
    } else {
      console.log(`\n⚠️  Final state is ${finalData.state}, not COMPLETED`);
    }
  } catch (error) {
    console.log(`\n${"═".repeat(80)}`);
    console.log(`  ❌ ❌ ❌  WORKFLOW TEST FAILED  ❌ ❌ ❌`);
    console.log(`═`.repeat(80));
    console.log(`\nError: ${error.message}\n`);
    process.exit(1);
  }
}

// Run the test
runFullWorkflowTest();
