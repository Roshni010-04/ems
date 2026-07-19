import express from "express";
import { protect } from "../middleware/auth.js";
import { getOrgTree } from "../controllers/organizationController.js";

const router = express.Router();

router.use(protect);
router.get("/tree", getOrgTree);

export default router;
