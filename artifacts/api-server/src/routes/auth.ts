import { Router } from "express";
import { User } from "../models/User";
import { authenticate, generateToken, AuthRequest } from "../middlewares/auth";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, role, phoneNumber } = req.body;
    if (!fullName || !email || !password || !role) {
      res.status(400).json({ error: "fullName, email, password, and role are required" });
      return;
    }
    if (!["seeker", "recruiter"].includes(role)) {
      res.status(400).json({ error: "role must be seeker or recruiter" });
      return;
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(400).json({ error: "Email already in use" });
      return;
    }
    const user = await User.create({ fullName, email, password, role, phoneNumber });
    const token = generateToken(String(user._id));
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber ?? null,
        avatar: user.avatar ?? null,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    req.log.error({ err }, "register error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      res.status(400).json({ error: "email, password, and role are required" });
      return;
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    if (user.role !== role) {
      res.status(401).json({ error: `No ${role} account found with this email` });
      return;
    }
    const valid = await user.comparePassword(password);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = generateToken(String(user._id));
    res.json({
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber ?? null,
        avatar: user.avatar ?? null,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    req.log.error({ err }, "login error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/auth/me
router.get("/me", authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber ?? null,
      avatar: user.avatar ?? null,
      createdAt: user.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "getMe error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
