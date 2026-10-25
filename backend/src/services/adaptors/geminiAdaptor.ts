import { AppError } from "../../errors.js";
import type { LLMAdaptor } from "./LLMAdaptor.js";

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

/** The parts of Gemini's response we read. All optional: never trust a third-party shape. */
interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
}

/** Calls Gemini's generateContent REST endpoint: https://ai.google.dev/api/generate-content */
export class GeminiAdaptor implements LLMAdaptor {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generate(prompt: string, systemInstruction: string, signal: AbortSignal): Promise<string> {
    let response: Response;
    try {
      response = await fetch(`${BASE_URL}/models/${this.model}:generateContent`, {
        method: "POST",
        signal,
        headers: {
          "Content-Type": "application/json",
          // Sent as a header, not ?key=, so the key never shows up in URL logs.
          "x-goog-api-key": this.apiKey
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3 }
        })
      });
    } catch (error) {
      if (signal.aborted) throw error; // LLMService turns this into a timeout
      throw new AppError(502, "LLM_UNAVAILABLE", "Could not reach the AI service.", { cause: error });
    }

    if (!response.ok) {
      // Provider details go to the server log (via `cause`), not to the user.
      const cause = new Error(`Gemini HTTP ${response.status}: ${await response.text()}`);
      if (response.status === 429) {
        throw new AppError(429, "LLM_RATE_LIMITED", "The AI service is busy. Please try again shortly.", { cause });
      }
      throw new AppError(502, "LLM_UNAVAILABLE", "The AI service is unavailable right now.", { cause });
    }

    const data = (await response.json()) as GeminiResponse;
    const candidate = data.candidates?.[0];

    if (data.promptFeedback?.blockReason || candidate?.finishReason === "SAFETY") {
      throw new AppError(422, "LLM_BLOCKED", "The AI declined to answer this question. Try rephrasing it.");
    }

    const text = candidate?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();
    if (!text) {
      throw new AppError(502, "LLM_UNAVAILABLE", "The AI returned an empty answer. Please try again.");
    }

    return text;
  }
}
