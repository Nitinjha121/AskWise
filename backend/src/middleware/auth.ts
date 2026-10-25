import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../errors.js";

export interface AuthUser {
  sub: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signToken(secret: string, subject: string): string {
  return jwt.sign({}, secret, { subject, expiresIn: "1h" });
}

/**
 * Requires `Authorization: Bearer <jwt>`.
 */
export function requireAuth(secret: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

    if (!token) {
      return next(new AppError(401, "UNAUTHORIZED", "A valid bearer token is required."));
    }

    try {
      const payload = jwt.verify(token, secret);

      if (typeof payload === "string" || typeof payload.sub !== "string") {
        return next(new AppError(401, "UNAUTHORIZED", "Invalid or expired token."));
      }

      req.user = { sub: payload.sub };

      next();
    } catch {
      next(new AppError(401, "UNAUTHORIZED", "Invalid or expired token."));
    }
  };
}
