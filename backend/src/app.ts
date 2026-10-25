import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import type { Config } from "./config.js";
import { AppError } from "./errors.js";
import { requireAuth } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { createAuthRouter } from "./routes/auth.js";
import { createQueryRouter } from "./routes/query.js";
import type { LLMService } from "./services/LLMService.js";

/** Builds the Express app. The LLM is passed in, so any adaptor can be plugged in. */
export function createApp(config: Config, llm: LLMService) {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: "10kb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  if (config.enableDevToken) {
    app.use("/api/auth", createAuthRouter(config.jwtSecret));
  }

  app.use(
    "/api/query",
    requireAuth(config.jwtSecret),
    // 20 questions per minute per client keeps one user from burning the LLM quota.
    rateLimit({
      windowMs: 60_000,
      limit: 20,
      handler: (_req, _res, next) => next(new AppError(429, "RATE_LIMITED", "Too many requests. Please wait a moment."))
    }),
    createQueryRouter(llm, config.maxQueryLength)
  );

  app.use((_req, _res, next) => {
    next(new AppError(404, "NOT_FOUND", "Endpoint not found."));
  });

  app.use(errorHandler);

  return app;
}
