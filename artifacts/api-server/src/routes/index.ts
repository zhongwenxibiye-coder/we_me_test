import { Router, type IRouter } from "express";
import healthRouter from "./health";
import mentorApplicationsRouter from "./mentor-applications";

const router: IRouter = Router();

router.use(healthRouter);
router.use(mentorApplicationsRouter);

export default router;
