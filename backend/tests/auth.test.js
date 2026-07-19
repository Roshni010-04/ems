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

const createUser = async (overrides = {}) => {
  return Employee.create({
    employeeId: "EMP0001",
    name: "Test User",
    email: "test@ems.com",
    password: "Password1",
    phone: "9876543210",
    department: "Engineering",
    designation: "Developer",
    salary: 50000,
    joiningDate: new Date(),
    role: "Employee",
    status: "Active",
    ...overrides,
  });
};

describe("Auth endpoints", () => {
  test("logs in successfully with valid credentials", async () => {
    await createUser();

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@ems.com", password: "Password1" });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("test@ems.com");
    expect(res.body.user.password).toBeUndefined();
  });

  test("rejects invalid password", async () => {
    await createUser();

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@ems.com", password: "wrongpass" });

    expect(res.statusCode).toBe(401);
  });

  test("rejects login for inactive user", async () => {
    await createUser({ status: "Inactive", employeeId: "EMP0002", email: "inactive@ems.com" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "inactive@ems.com", password: "Password1" });

    expect(res.statusCode).toBe(403);
  });

  test("blocks access to protected route without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.statusCode).toBe(401);
  });
});
