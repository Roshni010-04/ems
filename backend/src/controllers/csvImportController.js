import fs from "fs";
import csvParser from "csv-parser";
import Employee from "../models/Employee.js";

// @route POST /api/employees/import  (Super Admin, HR Manager)
// Expects a multipart/form-data upload with field name "file"
export const importEmployeesFromCSV = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: "No CSV file uploaded" });
  }

  const results = [];
  const errors = [];
  let rowNum = 0;

  const stream = fs
    .createReadStream(req.file.path)
    .pipe(csvParser())
    .on("data", (row) => {
      rowNum += 1;
      results.push({ row: rowNum, data: row });
    })
    .on("end", async () => {
      const created = [];

      for (const { row, data } of results) {
        try {
          const {
            name,
            email,
            password,
            phone,
            department,
            designation,
            salary,
            joiningDate,
            role,
            status,
          } = data;

          if (!name || !email || !phone || !department || !designation || !salary || !joiningDate) {
            errors.push({ row, message: "Missing required field(s)" });
            continue;
          }

          const nextId = await generateNextEmployeeId(Employee);
          const employee = await Employee.create({
          employeeId: nextId,
            name,
            email: email.toLowerCase(),
            password: password || "Welcome@123",
            phone,
            department,
            designation,
            salary: Number(salary),
            joiningDate: new Date(joiningDate),
            role: role || "Employee",
            status: status || "Active",
          });
          created.push(employee.employeeId);
        } catch (e) {
          errors.push({ row, message: e.message });
        }
      }

      fs.unlink(req.file.path, () => {});

      res.status(200).json({
        message: `Import complete: ${created.length} created, ${errors.length} failed`,
        createdCount: created.length,
        errors,
      });
    })
    .on("error", (err) => {
      next(err);
    });

  return stream;
};
