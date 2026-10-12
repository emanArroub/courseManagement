import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../generated/prisma/client.js";

type TokenPayload = {
  userId: number;
  role: UserRole;
};

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Authentication token is required" });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ message: "JWT_SECRET is not configured" });
    return;
  }

  try {
    const token = header.slice("Bearer ".length);
    const payload = jwt.verify(token, secret) as TokenPayload;

    if (!Number.isInteger(payload.userId) || !payload.role) {
      res.status(401).json({ message: "Invalid token payload" });
      return;
    }

    req.auth = { userId: payload.userId, role: payload.role };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.auth?.role !== UserRole.ADMIN) {
    res.status(403).json({ message: "Administrator access is required" });
    return;
  }
  next();
}
