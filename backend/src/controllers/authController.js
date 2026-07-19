import Employee from "../models/Employee.js";
import { generateToken, setTokenCookie } from "../utils/generateToken.js";

// @route POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await Employee.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.status === "Inactive") {
      return res.status(403).json({ message: "Your account is inactive. Contact admin." });
    }

    const token = generateToken({ id: user._id, role: user.role });
    setTokenCookie(res, token);

    res.status(200).json({
      message: "Login successful",
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/auth/logout
export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};

// @route GET /api/auth/me
export const getMe = async (req, res) => {
  res.status(200).json({ user: req.user.toSafeObject() });
};
