import { Router } from "express";
import multer from "multer";
import { authenticate, requireRole, AuthRequest } from "../middlewares/auth";
import { cloudinary } from "../lib/cloudinary";
import { Company } from "../models/Company";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /api/companies
router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 10);
    const search = req.query.search as string | undefined;
    const filter: Record<string, unknown> = {};
    if (search) filter.name = { $regex: search, $options: "i" };
    const total = await Company.countDocuments(filter);
    const companies = await Company.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    res.json({ companies, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    req.log.error({ err }, "listCompanies error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/companies
router.post("/", authenticate, requireRole("recruiter"), async (req: AuthRequest, res) => {
  try {
    const { name, description, website, location, industry, size } = req.body;
    if (!name) { res.status(400).json({ error: "name is required" }); return; }
    const company = await Company.create({
      name, description, website, location, industry, size,
      recruiter: req.user!._id,
    });
    res.status(201).json(company);
  } catch (err) {
    req.log.error({ err }, "createCompany error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/companies/my
router.get("/my", authenticate, requireRole("recruiter"), async (req: AuthRequest, res) => {
  try {
    const companies = await Company.find({ recruiter: req.user!._id }).sort({ createdAt: -1 }).lean();
    res.json(companies);
  } catch (err) {
    req.log.error({ err }, "getMyCompanies error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/companies/:id
router.get("/:id", async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).lean();
    if (!company) { res.status(404).json({ error: "Company not found" }); return; }
    res.json(company);
  } catch (err) {
    req.log.error({ err }, "getCompany error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/companies/:id
router.put("/:id", authenticate, requireRole("recruiter"), async (req: AuthRequest, res) => {
  try {
    const company = await Company.findOneAndUpdate(
      { _id: req.params.id, recruiter: req.user!._id },
      { $set: req.body },
      { new: true }
    );
    if (!company) { res.status(404).json({ error: "Company not found or not authorized" }); return; }
    res.json(company);
  } catch (err) {
    req.log.error({ err }, "updateCompany error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/companies/:id
router.delete("/:id", authenticate, requireRole("recruiter"), async (req: AuthRequest, res) => {
  try {
    const company = await Company.findOneAndDelete({ _id: req.params.id, recruiter: req.user!._id });
    if (!company) { res.status(404).json({ error: "Company not found or not authorized" }); return; }
    res.json({ message: "Company deleted" });
  } catch (err) {
    req.log.error({ err }, "deleteCompany error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/companies/:id/logo
router.post("/:id/logo", authenticate, requireRole("recruiter"), upload.single("file"), async (req: AuthRequest, res) => {
  try {
    if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
    const company = await Company.findOne({ _id: req.params.id, recruiter: req.user!._id });
    if (!company) { res.status(404).json({ error: "Company not found or not authorized" }); return; }
    const b64 = req.file.buffer.toString("base64");
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "job-portal/logos",
      transformation: [{ width: 300, height: 300, crop: "fill" }],
    });
    company.logo = result.secure_url;
    await company.save();
    res.json({ logoUrl: result.secure_url });
  } catch (err) {
    req.log.error({ err }, "uploadCompanyLogo error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
