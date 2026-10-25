export interface Config {
  port: number;
  jwtSecret: string;
  /** Enables POST /api/auth/token, which mints a test JWT. Off in production. */
  enableDevToken: boolean;
  geminiApiKey: string;
  geminiModel: string;
  llmTimeoutMs: number;
  maxQueryLength: number;
}

/**
 * Reads and validates configuration once at startup. Missing secrets stop the
 * server from booting instead of failing on the first request.
 */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const jwtSecret = env.JWT_SECRET ?? "";
  const geminiApiKey = env.GEMINI_API_KEY ?? "";

  if (jwtSecret.length < 32) throw new Error("JWT_SECRET must be set and at least 32 characters long");
  if (!geminiApiKey) throw new Error("GEMINI_API_KEY must be set");

  return {
    port: Number(env.PORT) || 3000,
    jwtSecret,
    enableDevToken: env.NODE_ENV !== "production",
    geminiApiKey,
    geminiModel: env.GEMINI_MODEL || "gemini-2.5-flash",
    llmTimeoutMs: Number(env.LLM_TIMEOUT_MS) || 30_000,
    maxQueryLength: 2000
  };
}
