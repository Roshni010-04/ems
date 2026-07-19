import request from "supertest";
import dotenv from "dotenv";
dotenv.config();
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_secret";

import app from "../src/app.js";
import Employee from "../src/models/Employee.js";
import { connect, closeDatabase, clearDatabase } from "./setup.js";

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

const loginAs = async (email, password) => {
  const res = await request(app).post("/api/auth/login").send({ email, password });
  return res.body.token;
};

const seedAdmin = async () =>
  Employee.create({
    employeeId: "EMP0001",
    name: "Admin",
    email: "admin@ems.com",
    password: "Password1",
    phone: "9999999999",
    department: "Administration",
    designation: "Super Admin",
    salary: 100000,
    joiningDate: new Date(),
    role: "Super Admin",
    status: "Active",
  });

const seedHR = async () =>
  Employee.create({
    employeeId: "EMP0002",
    name: "HR Person",
    email: "hr@ems.com",
    password: "Password1",
    phone: "8888888888",
    department: "HR",
    designation: "HR Manager",
    salary: 70000,
    joiningDate: new Date(),
    role: "HR Manager",
    status: "Active",
  });

describe("Employee CRUD & RBAC", () => {
  test("Super Admin can create an employee", async () => {
    await seedAdmin();
    const token = await loginAs("admin@ems.com", "Password1");

    const res = await request(app)
      .post("/api/employees")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Jane Doe",
        email: "jane@ems.com",
        password: "Password1",
        phone: "7777777777",
        department: "Engineering",
        designation: "Software Engineer",
        salary: 60000,
        joiningDate: "2024-01-01",
        role: "Employee",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.name).toBe("Jane Doe");
  });

  test("HR Manager cannot assign Super Admin role", async () => {
    await seedHR();
    const token = await loginAs("hr@ems.com", "Password1");

    const res = await request(app)
      .post("/api/employees")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Bad Actor",
        email: "bad@ems.com",
        password: "Password1",
        phone: "7777777777",
        department: "Engineering",
        designation: "Manager",
        salary: 60000,
        joiningDate: "2024-01-01",
        role: "Super Admin",
      });

    expect(res.statusCode).toBe(403);
  });

  test("HR Manager cannot delete employees", async () => {
    const hr = await seedHR();
    const token = await loginAs("hr@ems.com", "Password1");

    const emp = await Employee.create({
      employeeId: "EMP0003",
      name: "Target",
      email: "target@ems.com",
      password: "Password1",
      phone: "6666666666",
      department: "Sales",
      designation: "Rep",
      salary: 40000,
      joiningDate: new Date(),
      role: "Employee",
    });

    const res = await request(app)
      .delete(`/api/employees/${emp._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
  });

  test("Employee can only edit own profile with limited fields", async () => {
    const emp = await Employee.create({
      employeeId: "EMP0004",
      name: "Self User",
      email: "self@ems.com",
      password: "Password1",
      phone: "5555555555",
      department: "Support",
      designation: "Agent",
      salary: 35000,
      joiningDate: new Date(),
      role: "Employee",
    });
    const token = await loginAs("self@ems.com", "Password1");

    // Attempt to change salary (not allowed) and phone (allowed)
    const res = await request(app)
      .put(`/api/employees/${emp._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ salary: 999999, phone: "1231231234" });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.phone).toBe("1231231234");
    expect(res.body.data.salary).toBe(35000); // unchanged
  });

  test("prevents circular reporting manager assignment", async () => {
    const admin = await seedAdmin();
    const token = await loginAs("admin@ems.com", "Password1");

    const empA = await Employee.create({
      employeeId: "EMP0010",
      name: "A",
      email: "a@ems.com",
      password: "Password1",
      phone: "1111111111",
      department: "Eng",
      designation: "Dev",
      salary: 50000,
      joiningDate: new Date(),
    });
    const empB = await Employee.create({
      employeeId: "EMP0011",
      name: "B",
      email: "b@ems.com",
      password: "Password1",
      phone: "2222222222",
      department: "Eng",
      designation: "Dev",
      salary: 50000,
      joiningDate: new Date(),
      reportingManager: empA._id,
    });

    // Now try to make A report to B -> should create a cycle
    const res = await request(app)
      .patch(`/api/employees/${empA._id}/manager`)
      .set("Authorization", `Bearer ${token}`)
      .send({ managerId: empB._id });

    expect(res.statusCode).toBe(400);
  });

  test("soft delete hides employee from default listing", async () => {
    await seedAdmin();
    const token = await loginAs("admin@ems.com", "Password1");

    const emp = await Employee.create({
      employeeId: "EMP0020",
      name: "ToDelete",
      email: "delete@ems.com",
      password: "Password1",
      phone: "3333333333",
      department: "Eng",
      designation: "Dev",
      salary: 50000,
      joiningDate: new Date(),
    });

    const del = await request(app)
      .delete(`/api/employees/${emp._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(del.statusCode).toBe(200);

    const listRes = await request(app)
      .get("/api/employees")
      .set("Authorization", `Bearer ${token}`);

    const found = listRes.body.data.find((e) => e.email === "delete@ems.com");
    expect(found).toBeUndefined();
  });
});
