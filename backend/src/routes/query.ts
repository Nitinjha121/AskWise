import { Router } from "express";
import { AppError } from "../errors.js";
import type { LLMService } from "../services/LLMService.js";

export function createQueryRouter(llm: LLMService, maxQueryLength: number) {
  const router = Router();

  router.post("/", async (req, res) => {
    const query = typeof req.body?.query === "string" ? req.body.query.trim() : "";

    if (!query) {
      throw new AppError(400, "VALIDATION_ERROR", "Please enter a question.");
    }
    if (query.length > maxQueryLength) {
      throw new AppError(400, "VALIDATION_ERROR", `Questions can be at most ${maxQueryLength} characters.`);
    }

    // Express 5 forwards errors thrown here (sync or async) to the error handler.
    const answer = await llm.ask(query);
    res.json({ answer });
  });

  return router;
}
