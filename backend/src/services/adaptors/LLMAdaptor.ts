/**
 * The contract every LLM provider adaptor implements. LLMService depends only
 * on this interface, so switching from Gemini to OpenAI/Azure OpenAI means
 * adding one new adaptor and changing one line in server.ts.
 */
export interface LLMAdaptor {
  generate(prompt: string, systemInstruction: string, signal: AbortSignal): Promise<string>;
}
