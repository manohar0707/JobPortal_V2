import { Router } from "express";
import { authenticate, requireRole, AuthRequest } from "../middlewares/auth";
import { Job } from "../models/Job";
import { Application } from "../models/Application";
import { Company } from "../models/Company";

const router = Router();

// GET /api/jobs
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 12);
    const { keyword, location, type, salary } = req.query as Record<string, string>;
    const filter: Record<string, unknown> = { isActive: true };
    if (keyword) filter.$text = { $search: keyword };
    if (location) filter.location = { $regex: location, $options: "i" };
    if (type) filter.type = type;
    if (salary) filter.salary = { $regex: salary, $options: "i" };
    const total = await Job.countDocuments(filter);
    const jobs = await Job.find(filter)
      .populate("company")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    res.json({ jobs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    req.log.error({ err }, "listJobs error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/jobs
router.post("/", authenticate, requireRole("recruiter"), async (req: AuthRequest, res) => {
  try {
    const { title, description, requirements, company, location, type, salary, experience, skills } = req.body;
    if (!title || !description || !company || !location || !type || !salary) {
      res.status(400).json({ error: "title, description, company, location, type, and salary are required" });
      return;
    }
    const companyDoc = await Company.findOne({ _id: company, recruiter: req.user!._id });
    if (!companyDoc) { res.status(403).json({ error: "Company not found or not owned by you" }); return; }
    const job = await Job.create({
      title, description, requirements: requirements ?? [], company,
      recruiter: req.user!._id, location, type, salary,
      experience: experience ?? null, skills: skills ?? [],
    });
    const populated = await job.populate("company");
    res.status(201).json(populated);
  } catch (err) {
    req.log.error({ err }, "createJob error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/jobs/my
router.get("/my", authenticate, requireRole("recruiter"), async (req: AuthRequest, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user!._id })
      .populate("company")
      .sort({ createdAt: -1 })
      .lean();
    res.json(jobs);
  } catch (err) {
    req.log.error({ err }, "getMyJobs error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/jobs/featured
router.get("/featured", async (req, res) => {
  try {
    const jobs = await Job.find({ isActive: true })
      .populate("company")
      .sort({ applicantsCount: -1, createdAt: -1 })
      .limit(8)
      .lean();
    res.json(jobs);
  } catch (err) {
    req.log.error({ err }, "getFeaturedJobs error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/jobs/stats
router.get("/stats", async (req, res) => {
  try {
    const [totalJobs, totalCompanies, totalApplications, byTypeRaw, topLocRaw] = await Promise.all([
      Job.countDocuments({ isActive: true }),
      Company.countDocuments(),
      Application.countDocuments(),
      Job.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]),
      Job.aggregate([
        { $group: { _id: "$location", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);
    res.json({
      totalJobs,
      byType: byTypeRaw.map((r) => ({ type: r._id, count: r.count })),
      topLocations: topLocRaw.map((r) => ({ location: r._id, count: r.count })),
      totalCompanies,
      totalApplications,
    });
  } catch (err) {
    req.log.error({ err }, "getJobStats error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/jobs/:id
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("company").lean();
    if (!job) { res.status(404).json({ error: "Job not found" }); return; }
    res.json(job);
  } catch (err) {
    req.log.error({ err }, "getJob error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/jobs/:id
router.put("/:id", authenticate, requireRole("recruiter"), async (req: AuthRequest, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, recruiter: req.user!._id },
      { $set: req.body },
      { new: true }
    ).populate("company");
    if (!job) { res.status(404).json({ error: "Job not found or not authorized" }); return; }
    res.json(job);
  } catch (err) {
    req.log.error({ err }, "updateJob error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/jobs/:id
router.delete("/:id", authenticate, requireRole("recruiter"), async (req: AuthRequest, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, recruiter: req.user!._id });
    if (!job) { res.status(404).json({ error: "Job not found or not authorized" }); return; }
    res.json({ message: "Job deleted" });
  } catch (err) {
    req.log.error({ err }, "deleteJob error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
