import { Router } from "express";
import { authenticate, requireRole, AuthRequest } from "../middlewares/auth";
import { Application } from "../models/Application";
import { Job } from "../models/Job";

const router = Router();

// GET /api/applications — seeker's own applications
router.get("/", authenticate, requireRole("seeker"), async (req: AuthRequest, res) => {
  try {
    const apps = await Application.find({ applicant: req.user!._id })
      .populate({ path: "job", populate: { path: "company" } })
      .sort({ createdAt: -1 })
      .lean();
    res.json(apps);
  } catch (err) {
    req.log.error({ err }, "getMyApplications error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/applications/:jobId — apply for a job
router.post("/:jobId", authenticate, requireRole("seeker"), async (req: AuthRequest, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job || !job.isActive) { res.status(404).json({ error: "Job not found or not active" }); return; }
    const existing = await Application.findOne({ job: job._id, applicant: req.user!._id });
    if (existing) { res.status(400).json({ error: "You have already applied for this job" }); return; }
    const app = await Application.create({
      job: job._id,
      applicant: req.user!._id,
      coverLetter: req.body.coverLetter,
    });
    await Job.findByIdAndUpdate(job._id, { $inc: { applicantsCount: 1 } });
    const populated = await app.populate([
      { path: "job", populate: { path: "company" } },
      { path: "applicant" },
    ]);
    res.status(201).json(populated);
  } catch (err) {
    req.log.error({ err }, "applyJob error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/applications/:jobId/applicants — recruiter views applicants for a job
router.get("/:jobId/applicants", authenticate, requireRole("recruiter"), async (req: AuthRequest, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, recruiter: req.user!._id });
    if (!job) { res.status(403).json({ error: "Not authorized to view applicants for this job" }); return; }
    const apps = await Application.find({ job: req.params.jobId })
      .populate("applicant")
      .populate({ path: "job", populate: { path: "company" } })
      .sort({ createdAt: -1 })
      .lean();
    res.json(apps);
  } catch (err) {
    req.log.error({ err }, "getApplicants error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/applications/:applicationId/status
router.patch("/:applicationId/status", authenticate, requireRole("recruiter"), async (req: AuthRequest, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "reviewed", "shortlisted", "rejected", "accepted"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }
    const app = await Application.findById(req.params.applicationId)
      .populate({ path: "job", populate: { path: "company" } })
      .populate("applicant");
    if (!app) { res.status(404).json({ error: "Application not found" }); return; }
    const job = await Job.findOne({ _id: (app.job as any)._id, recruiter: req.user!._id });
    if (!job) { res.status(403).json({ error: "Not authorized" }); return; }
    app.status = status;
    await app.save();
    res.json(app);
  } catch (err) {
    req.log.error({ err }, "updateApplicationStatus error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
