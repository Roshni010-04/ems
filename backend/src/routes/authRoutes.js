import express from "express";
import { login, logout, getMe } from "../controllers/authController.js";
import { loginValidator, validate } from "../validators/authValidator.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", loginValidator, validate, login);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;
