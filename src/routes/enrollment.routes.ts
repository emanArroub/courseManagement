import { Router } from "express";
import {
enrollInCourse,
myEnrollments,
cancelEnrollment,
} from "../controllers/enrollment.controller.js";
import {
authenticate,
requireStudent,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate, requireStudent);

router.post("/:courseId", enrollInCourse);
router.get("/me/list", myEnrollments);
router.delete("/:courseId", cancelEnrollment);

export default router;
