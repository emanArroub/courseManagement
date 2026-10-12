import { Router } from "express";
import { enrollInCourse, myEnrollments, cancelEnrollment } from "../controllers/enrollment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.post("/:courseId", enrollInCourse);
router.get("/me/list", myEnrollments);
router.delete("/:courseId", cancelEnrollment);

export default router;
