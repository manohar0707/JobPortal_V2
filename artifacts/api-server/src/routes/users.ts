import { Router } from "express";
import multer from "multer";
import { authenticate, AuthRequest } from "../middlewares/auth";
import { cloudinary } from "../lib/cloudinary";
import { User } from "../models/User";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/users/profile
router.get("/profile", authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber ?? null,
      avatar: user.avatar ?? null,
      bio: user.bio ?? null,
      skills: user.skills ?? [],
      resumeUrl: user.resumeUrl ?? null,
      resumeName: user.resumeName ?? null,
      experience: user.experience ?? null,
      education: user.education ?? null,
      location: user.location ?? null,
      createdAt: user.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "getProfile error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/users/profile
router.put("/profile", authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { fullName, phoneNumber, bio, skills, experience, education, location } = req.body;
    const updated = await User.findByIdAndUpdate(
      user._id,
      { $set: { fullName, phoneNumber, bio, skills, experience, education, location } },
      { new: true, runValidators: true }
    );
    if (!updated) { res.status(404).json({ error: "User not found" }); return; }
    res.json({
      _id: updated._id,
      fullName: updated.fullName,
      email: updated.email,
      role: updated.role,
      phoneNumber: updated.phoneNumber ?? null,
      avatar: updated.avatar ?? null,
      bio: updated.bio ?? null,
      skills: updated.skills ?? [],
      resumeUrl: updated.resumeUrl ?? null,
      resumeName: updated.resumeName ?? null,
      experience: updated.experience ?? null,
      education: updated.education ?? null,
      location: updated.location ?? null,
      createdAt: updated.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "updateProfile error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/users/resume
router.post("/resume", authenticate, upload.single("file"), async (req: AuthRequest, res) => {
  try {
    if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
    const b64 = req.file.buffer.toString("base64");
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "job-portal/resumes",
      resource_type: "raw",
      public_id: `resume_${req.user!._id}_${Date.now()}`,
    });
    await User.findByIdAndUpdate(req.user!._id, {
      resumeUrl: result.secure_url,
      resumeName: req.file.originalname,
    });
    res.json({ resumeUrl: result.secure_url, resumeName: req.file.originalname });
  } catch (err) {
    req.log.error({ err }, "uploadResume error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/users/avatar
router.post("/avatar", authenticate, upload.single("file"), async (req: AuthRequest, res) => {
  try {
    if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
    const b64 = req.file.buffer.toString("base64");
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "job-portal/avatars",
      transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
    });
    await User.findByIdAndUpdate(req.user!._id, { avatar: result.secure_url });
    res.json({ avatarUrl: result.secure_url });
  } catch (err) {
    req.log.error({ err }, "uploadAvatar error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
