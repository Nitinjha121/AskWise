/**
 * Every error the API returns has a stable `code`, so the client can react to
 * it without parsing the human-readable message.
 */
export type ErrorCode =
  | "INVALID_JSON"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "LLM_TIMEOUT"
  | "LLM_RATE_LIMITED"
  | "LLM_BLOCKED"
  | "LLM_UNAVAILABLE"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  readonly status: number;
  readonly code: ErrorCode;

  constructor(status: number, code: ErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}
