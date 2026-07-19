import express from "express";
import multer from "multer";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../validators/authValidator.js";
import {
  createEmployeeValidator,
  updateEmployeeValidator,
} from "../validators/employeeValidator.js";
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getReportees,
  assignManager,
} from "../controllers/employeeController.js";
import { importEmployeesFromCSV } from "../controllers/csvImportController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.use(protect);

router
  .route("/")
  .get(getEmployees)
  .post(
    authorize("Super Admin", "HR Manager"),
    createEmployeeValidator,
    validate,
    createEmployee
  );

router.post(
  "/import",
  authorize("Super Admin", "HR Manager"),
  upload.single("file"),
  importEmployeesFromCSV
);

router
  .route("/:id")
  .get(getEmployeeById)
  .put(updateEmployeeValidator, validate, updateEmployee)
  .delete(authorize("Super Admin"), deleteEmployee);

router.get("/:id/reportees", getReportees);
router.patch("/:id/manager", authorize("Super Admin", "HR Manager"), assignManager);

export default router;
