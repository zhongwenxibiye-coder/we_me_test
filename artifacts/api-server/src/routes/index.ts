import { Router, type IRouter } from "express";
import healthRouter from "./health";
import configRouter from "./config";
import mentorApplicationsRouter from "./mentor-applications";
import mentorsRouter from "./mentors";
import jobListingsRouter from "./job-listings";
import jobCategoriesRouter from "./job-categories";
import startupApplicationsRouter from "./startup-applications";
import startupPostsRouter from "./startup-posts";
import creativeWorksRouter from "./creative-works";
import creativeSubmissionsRouter from "./creative-submissions";
import humanitiesRouter from "./humanities";
import usersRouter from "./users";
import careerVideosRouter from "./career-videos";

const router: IRouter = Router();

router.use(healthRouter);
router.use(configRouter);
router.use(mentorApplicationsRouter);
router.use(mentorsRouter);
router.use(jobListingsRouter);
router.use(jobCategoriesRouter);
router.use(startupApplicationsRouter);
router.use(startupPostsRouter);
router.use(creativeWorksRouter);
router.use(creativeSubmissionsRouter);
router.use(humanitiesRouter);
router.use(usersRouter);
router.use(careerVideosRouter);

export default router;
