import "dotenv/config";
import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { GeminiAdaptor } from "./services/adaptors/geminiAdaptor.js";
import { LLMService } from "./services/LLMService.js";

const config = loadConfig();

const llm = new LLMService(new GeminiAdaptor(config.geminiApiKey, config.geminiModel), config.llmTimeoutMs);
const app = createApp(config, llm);

app.listen(config.port, () => {
  console.log(`AskWise API listening on http://localhost:${config.port} (model: ${config.geminiModel})`);
});
