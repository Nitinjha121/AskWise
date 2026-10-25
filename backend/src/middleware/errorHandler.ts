import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors.js";

/**
 * Turns every error into the same JSON shape: { error: { code, message } }.
 * Unexpected errors are logged in full but the client only gets a generic
 * message, so internals never leak.
 */
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if ((error as { type?: string }).type?.startsWith("entity.")) {
    // Thrown by express.json() when the body isn't valid JSON or is over the 10kb limit.
    appError = new AppError(400, "INVALID_JSON", "Request body is invalid or too large.");
  } else {
    appError = new AppError(500, "INTERNAL_ERROR", "Something went wrong. Please try again.");
  }

  if (appError.status >= 500) {
    console.error(`[${appError.code}]`, appError.cause ?? error);
  }

  res.status(appError.status).json({ error: { code: appError.code, message: appError.message } });
}
