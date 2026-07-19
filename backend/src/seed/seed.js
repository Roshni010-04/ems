import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import dns from "dns";
import Employee from "../models/Employee.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ems");

  const existing = await Employee.findOne({ email: "admin@ems.com" });
  if (existing) {
    console.log("Super Admin already exists. Skipping seed.");
    process.exit(0);
  }

  await Employee.create({
    employeeId: "EMP0001",
    name: "System Administrator",
    email: "admin@ems.com",
    password: "Admin@123",
    phone: "9999999999",
    department: "Administration",
    designation: "Super Administrator",
    salary: 150000,
    joiningDate: new Date(),
    status: "Active",
    role: "Super Admin",
  });

  console.log("Super Admin created:");
  console.log("  email: admin@ems.com");
  console.log("  password: Admin@123");
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
