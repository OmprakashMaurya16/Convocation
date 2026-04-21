const dotenv = require("dotenv");
dotenv.config({ quiet: true });

const mongoose = require("mongoose");
const connectDB = require("../config/db.js");
const Staff = require("../models/staff.model.js");

const STAFF_ROLES = ["ENTRY", "GOWN", "RETURN", "ADMIN"];

const adminAccount = {
  name: process.env.ADMIN_NAME || "Admin User",
  email: process.env.ADMIN_EMAIL || "admin@convocation.com",
  password: process.env.ADMIN_PASSWORD || "Admin@Vit",
  role: "ADMIN",
  active: true,
};

const staffRole = (process.env.STAFF_ROLE || "ENTRY").toUpperCase();
if (!STAFF_ROLES.includes(staffRole)) {
  throw new Error(
    `Invalid STAFF_ROLE: ${staffRole}. Allowed roles: ${STAFF_ROLES.join(", ")}`,
  );
}

const staffAccount = {
  name: process.env.STAFF_NAME || "Entry Staff",
  email: process.env.STAFF_EMAIL || "Entry@convocation.com",
  password: process.env.STAFF_PASSWORD || "Staff@Vit",
  role: staffRole,
  active: true,
};

const upsertStaff = async (account) => {
  const existing = await Staff.findOne({ email: account.email });

  if (existing) {
    existing.name = account.name;
    existing.password = account.password;
    existing.role = account.role;
    existing.active = account.active;
    await existing.save();

    return { action: "updated", email: account.email, role: account.role };
  }

  await Staff.create(account);
  return { action: "created", email: account.email, role: account.role };
};

const seedStaff = async () => {
  try {
    await connectDB();

    const results = [];
    results.push(await upsertStaff(adminAccount));
    results.push(await upsertStaff(staffAccount));

    console.log("Staff seeding complete:");
    results.forEach((result) => {
      console.log(
        `- ${result.action.toUpperCase()}: ${result.email} (${result.role})`,
      );
    });
  } catch (error) {
    console.error("Failed to seed admin/staff accounts:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedStaff();
