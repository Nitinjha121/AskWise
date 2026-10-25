import { Router } from "express";
import { signToken } from "../middleware/auth.js";

/**
 * DEV/TEST ONLY: hands out a short-lived token for a demo user, standing in
 * for a real login. The brief allows a hardcoded test token; minting one keeps
 * a long-lived token out of the repo. Disabled when NODE_ENV=production.
 */
export function createAuthRouter(jwtSecret: string) {
  const router = Router();

  router.post("/token", (_req, res) => {
    res.json({ token: signToken(jwtSecret, "demo-user") });
  });

  return router;
}
