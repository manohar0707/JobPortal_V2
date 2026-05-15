import { Router } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import companiesRouter from "./companies";
import jobsRouter from "./jobs";
import applicationsRouter from "./applications";
import adminRouter from "./admin";

const router = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/companies", companiesRouter);
router.use("/jobs", jobsRouter);
router.use("/applications", applicationsRouter);
router.use("/admin", adminRouter);

export default router;
