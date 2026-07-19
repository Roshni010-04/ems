import express from "express";
import { protect } from "../middleware/auth.js";
import { getDashboardStats } from "../controllers/employeeController.js";

const router = express.Router();

router.use(protect);
router.get("/stats", getDashboardStats);

export default router;
