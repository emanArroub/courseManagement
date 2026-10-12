import { Router } from "express";
import {
  createCourse, listCourses, getCourse, updateCourse, deleteCourse
} from "../controllers/course.controller.js";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", listCourses);
router.get("/:id", getCourse);
router.post("/", authenticate, requireAdmin, createCourse);
router.patch("/:id", authenticate, requireAdmin, updateCourse);
router.delete("/:id", authenticate, requireAdmin, deleteCourse);

export default router;
