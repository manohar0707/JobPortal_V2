import { Router } from "express";
import { authenticate, requireRole, AuthRequest } from "../middlewares/auth";
import { User } from "../models/User";
import { Job } from "../models/Job";
import { Company } from "../models/Company";
import { Application } from "../models/Application";

const router = Router();

// GET /api/admin/stats
router.get("/stats", authenticate, requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    const [totalUsers, totalRecruiters, totalSeekers, totalJobs, totalCompanies, totalApplications, recentJobs, recentApps] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "recruiter" }),
      User.countDocuments({ role: "seeker" }),
      Job.countDocuments(),
      Company.countDocuments(),
      Application.countDocuments(),
      Job.find().sort({ createdAt: -1 }).limit(3).select("title createdAt").lean(),
      Application.find().sort({ createdAt: -1 }).limit(3).populate("job", "title").lean(),
    ]);
    const recentActivity = [
      ...recentJobs.map((j) => ({
        type: "job",
        description: `New job posted: ${j.title}`,
        createdAt: j.createdAt?.toISOString() ?? new Date().toISOString(),
      })),
      ...recentApps.map((a) => ({
        type: "application",
        description: `New application for: ${(a.job as any)?.title ?? "a job"}`,
        createdAt: a.createdAt?.toISOString() ?? new Date().toISOString(),
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

    res.json({ totalUsers, totalRecruiters, totalSeekers, totalJobs, totalCompanies, totalApplications, recentActivity });
  } catch (err) {
    req.log.error({ err }, "adminStats error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/users
router.get("/users", authenticate, requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = 20;
    const filter: Record<string, unknown> = {};
    if (req.query.role) filter.role = req.query.role;
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    req.log.error({ err }, "adminListUsers error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/admin/users/:id
router.delete("/users/:id", authenticate, requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    res.json({ message: "User deleted" });
  } catch (err) {
    req.log.error({ err }, "adminDeleteUser error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/jobs
router.get("/jobs", authenticate, requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = 20;
    const total = await Job.countDocuments();
    const jobs = await Job.find()
      .populate("company")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    res.json({ jobs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    req.log.error({ err }, "adminListJobs error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/admin/jobs/:id
router.delete("/jobs/:id", authenticate, requireRole("admin"), async (req: AuthRequest, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) { res.status(404).json({ error: "Job not found" }); return; }
    res.json({ message: "Job deleted" });
  } catch (err) {
    req.log.error({ err }, "adminDeleteJob error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
