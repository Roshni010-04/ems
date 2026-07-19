import { body } from "express-validator";
import { ROLE_VALUES, STATUS_VALUES } from "../models/Employee.js";

export const createEmployeeValidator = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2, max: 100 }),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("phone")
    .matches(/^[0-9+\-\s()]{7,15}$/)
    .withMessage("Valid phone number is required"),
  body("department").trim().notEmpty().withMessage("Department is required"),
  body("designation").trim().notEmpty().withMessage("Designation is required"),
  body("salary").isFloat({ min: 0 }).withMessage("Salary must be a positive number"),
  body("joiningDate").isISO8601().toDate().withMessage("Valid joining date is required"),
  body("status").optional().isIn(STATUS_VALUES).withMessage("Invalid status"),
  body("role").optional().isIn(ROLE_VALUES).withMessage("Invalid role"),
  body("reportingManager").optional({ nullable: true }).isMongoId().withMessage("Invalid manager id"),
];

export const updateEmployeeValidator = [
  body("name").optional().trim().isLength({ min: 2, max: 100 }),
  body("email").optional().isEmail().withMessage("Valid email is required"),
  body("password").optional().isLength({ min: 6 }),
  body("phone")
    .optional()
    .matches(/^[0-9+\-\s()]{7,15}$/)
    .withMessage("Valid phone number is required"),
  body("department").optional().trim().notEmpty(),
  body("designation").optional().trim().notEmpty(),
  body("salary").optional().isFloat({ min: 0 }),
  body("joiningDate").optional().isISO8601().toDate(),
  body("status").optional().isIn(STATUS_VALUES),
  body("role").optional().isIn(ROLE_VALUES),
  body("reportingManager").optional({ nullable: true }).isMongoId(),
];
