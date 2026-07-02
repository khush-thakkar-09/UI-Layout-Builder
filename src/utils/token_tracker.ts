import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// tracker.txt is in the workspace root directory
const TRACKER_FILE = path.join(__dirname, "..", "..", "tracker.txt");

/**
 * Extracts usage_metadata from an LLM response and appends it to tracker.txt.
 */
export function logTokenUsage(agentName: string, response: any): void {
  try {
    let metadata: any = null;

    if (response && typeof response === "object") {
      if ("usage_metadata" in response) {
        metadata = response.usage_metadata;
      } else if (response.response_metadata && response.response_metadata.tokenUsage) {
        // OpenAI LangChain format helper
        const usage = response.response_metadata.tokenUsage;
        metadata = {
          input_tokens: usage.promptTokens || 0,
          output_tokens: usage.completionTokens || 0,
          total_tokens: usage.totalTokens || 0,
        };
      } else if (response.usage) {
        metadata = {
          input_tokens: response.usage.prompt_tokens || 0,
          output_tokens: response.usage.completion_tokens || 0,
          total_tokens: response.usage.total_tokens || 0,
        };
      }
    }

    if (metadata) {
      const inputTokens = metadata.input_tokens || 0;
      const outputTokens = metadata.output_tokens || 0;
      const totalTokens = metadata.total_tokens || 0;

      const logLine = `[${new Date().toISOString()}] ${agentName} | Input: ${inputTokens} | Output: ${outputTokens} | Total: ${totalTokens}\n`;

      fs.appendFileSync(TRACKER_FILE, logLine);
    }
  } catch (error) {
    // Silently fail to not interrupt execution
  }
}
