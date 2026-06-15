import { Router, type IRouter } from "express";
import healthRouter from "./health";
import configRouter from "./config";
import mentorApplicationsRouter from "./mentor-applications";
import mentorsRouter from "./mentors";
import jobListingsRouter from "./job-listings";
import startupApplicationsRouter from "./startup-applications";
import creativeWorksRouter from "./creative-works";
import creativeSubmissionsRouter from "./creative-submissions";
import humanitiesRouter from "./humanities";

const router: IRouter = Router();

router.use(healthRouter);
router.use(configRouter);
router.use(mentorApplicationsRouter);
router.use(mentorsRouter);
router.use(jobListingsRouter);
router.use(startupApplicationsRouter);
router.use(creativeWorksRouter);
router.use(creativeSubmissionsRouter);
router.use(humanitiesRouter);

export default router;
