import { Router, type IRouter } from "express";
import healthRouter from "./health";
import mentorApplicationsRouter from "./mentor-applications";
import mentorsRouter from "./mentors";
import jobListingsRouter from "./job-listings";
import startupApplicationsRouter from "./startup-applications";
import creativeWorksRouter from "./creative-works";

const router: IRouter = Router();

router.use(healthRouter);
router.use(mentorApplicationsRouter);
router.use(mentorsRouter);
router.use(jobListingsRouter);
router.use(startupApplicationsRouter);
router.use(creativeWorksRouter);

export default router;
