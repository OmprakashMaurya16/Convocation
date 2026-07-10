require("dotenv").config({ path: "../../.env" });
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db.js");

const migrate = async () => {
  try {
    await connectDB();
    console.log("✓ Connected to database.");

    // Update all existing documents to rename "batch" to "convocationYear"
    const db = mongoose.connection.db;
    const collection = db.collection("students");

    // $rename "batch" -> "convocationYear"
    // Only where batch exists
    const result = await collection.updateMany(
      { batch: { $exists: true } },
      { $rename: { "batch": "convocationYear" } }
    );

    console.log(`Migration complete. Matched ${result.matchedCount} docs, modified ${result.modifiedCount} docs.`);

    // Wait, the user wants it to be "2026" now. We should just set all convocationYear to "2026" if they have an old batch value.
    const result2 = await collection.updateMany(
      { convocationYear: { $exists: true } },
      { $set: { convocationYear: "2026" } }
    );
    console.log(`Set convocationYear to "2026" for ${result2.modifiedCount} docs.`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

migrate();
