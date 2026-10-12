import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function enrollInCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const courseId = parseId(req.params.courseId);
    if (!courseId) { res.status(400).json({ message: "Invalid course id" }); return; }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { _count: { select: { enrollments: true } } }
    });
    if (!course) { res.status(404).json({ message: "Course not found" }); return; }
    if (course._count.enrollments >= course.capacity) {
      res.status(409).json({ message: "Course has reached its capacity" }); return;
    }

    const enrollment = await prisma.enrollment.create({
      data: { userId: req.auth!.userId, courseId },
      include: { course: true }
    });
    res.status(201).json({ message: "Successfully enrolled", enrollment });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      res.status(409).json({ message: "You are already enrolled in this course" });
      return;
    }
    next(error);
  }
}

export async function myEnrollments(req: Request, res: Response, next: NextFunction) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.auth!.userId },
      include: { course: true },
      orderBy: { enrolledAt: "desc" }
    });
    res.json({ enrollments });
  } catch (error) { next(error); }
}

export async function cancelEnrollment(req: Request, res: Response, next: NextFunction) {
  try {
    const courseId = parseId(req.params.courseId);
    if (!courseId) { res.status(400).json({ message: "Invalid course id" }); return; }

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.auth!.userId, courseId } }
    });
    if (!enrollment) {
      res.status(404).json({ message: "Enrollment not found" }); return;
    }

    await prisma.enrollment.delete({ where: { id: enrollment.id } });
    res.json({ message: "Enrollment cancelled" });
  } catch (error) { next(error); }
}
