import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function listCourses(_req: Request, res: Response, next: NextFunction) {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { enrollments: true } } }
    });
    res.json({ courses });
  } catch (error) { next(error); }
}

export async function getCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const rawId = req.params.id;

    if (typeof rawId !== "string") {
      res.status(400).json({ message: "Invalid course id" });
      return;
    }

    const id = parseId(rawId);

    if (!id) {
      res.status(400).json({ message: "Invalid course id" });
      return;
    }
    const course = await prisma.course.findUnique({
      where: { id },
      include: { _count: { select: { enrollments: true } } }
    });
    if (!course) { res.status(404).json({ message: "Course not found" }); return; }
    res.json({ course });
  } catch (error) { next(error); }
}

export async function createCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, description, capacity } = req.body as {
      title?: string; description?: string; capacity?: number;
    };

    if (!title?.trim()) {
      res.status(400).json({ message: "title is required" }); return;
    }
    const courseCapacity = capacity === undefined ? 30 : Number(capacity);
    if (!Number.isInteger(courseCapacity) || courseCapacity < 1) {
      res.status(400).json({ message: "capacity must be a positive integer" }); return;
    }

    const course = await prisma.course.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        capacity: courseCapacity
      }
    });
    res.status(201).json({ message: "Course created", course });
  } catch (error) { next(error); }
}

export async function updateCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const rawId = req.params.id;

    if (typeof rawId !== "string") {
      res.status(400).json({ message: "Invalid course id" });
      return;
    }

    const id = parseId(rawId);

    if (!id) {
      res.status(400).json({ message: "Invalid course id" });
      return;
    }
    const { title, description, capacity } = req.body as {
      title?: string; description?: string | null; capacity?: number;
    };
    if (title !== undefined && !title.trim()) {
      res.status(400).json({ message: "title cannot be empty" }); return;
    }
    if (capacity !== undefined && (!Number.isInteger(Number(capacity)) || Number(capacity) < 1)) {
      res.status(400).json({ message: "capacity must be a positive integer" }); return;
    }

    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) { res.status(404).json({ message: "Course not found" }); return; }

    const course = await prisma.course.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(capacity !== undefined ? { capacity: Number(capacity) } : {})
      }
    });
    res.json({ message: "Course updated", course });
  } catch (error) { next(error); }
}

export async function deleteCourse(req: Request, res: Response, next: NextFunction) {
  try {
    const rawId = req.params.id;

    if (typeof rawId !== "string") {
      res.status(400).json({ message: "Invalid course id" });
      return;
    }

    const id = parseId(rawId);

    if (!id) {
      res.status(400).json({ message: "Invalid course id" });
      return;
    }
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) { res.status(404).json({ message: "Course not found" }); return; }

    await prisma.course.delete({ where: { id } });
    res.json({ message: "Course deleted" });
  } catch (error) { next(error); }
}
