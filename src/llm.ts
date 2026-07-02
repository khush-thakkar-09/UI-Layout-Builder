import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { BaseMessage } from "@langchain/core/messages";

dotenv.config();

/**
 * Custom ChatQwen class that adapts the Qwen invocation to a LangChain-like interface.
 */
export class ChatQwen {
  temperature: number;
  maxTokens?: number;

  constructor(temperature: number = 0.7, maxTokens?: number) {
    this.temperature = temperature;
    this.maxTokens = maxTokens;
  }

  async invoke(messages: any[]): Promise<QwenBedrockResponse> {
    return invokeQwen(messages, this.temperature, this.maxTokens || 8192);
  }

  withStructuredOutput(schema: any): { invoke: (messages: any[]) => Promise<any> } {
    return {
      invoke: async (messages: any[]): Promise<any> => {
        // Appending formatting instructions to ensure JSON output
        const modifiedMessages = [...messages];
        const lastMessage = modifiedMessages[modifiedMessages.length - 1];

        let schemaDescription = "";
        if (schema && typeof schema === "object" && schema.shape) {
          schemaDescription = "The keys in the JSON object must be:\n" + 
            Object.keys(schema.shape).map(key => `- "${key}"`).join("\n");
        } else {
          schemaDescription = "Ensure the keys match the expected output schema.";
        }

        const jsonInstruction = `\n\nCRITICAL: You must return ONLY a raw JSON object with NO markdown styling (do not wrap in \`\`\`json blocks), and no extra text/explanations.
${schemaDescription}`;

        if (lastMessage && typeof lastMessage === "object") {
          // Clone and update the content
          const updatedLastMessage = { ...lastMessage };
          if (typeof updatedLastMessage.content === "string") {
            updatedLastMessage.content = updatedLastMessage.content + jsonInstruction;
          }
          modifiedMessages[modifiedMessages.length - 1] = updatedLastMessage;
        }

        const response = await invokeQwen(modifiedMessages, this.temperature, this.maxTokens || 8192);
        
        try {
          let cleanJson = response.content.trim();
          if (cleanJson.startsWith("```")) {
            cleanJson = cleanJson.replace(/^```[a-zA-Z]*\n/, "").replace(/\n```$/, "").trim();
          }
          const parsed = JSON.parse(cleanJson);
          // Attach usage_metadata so that logTokenUsage can read it
          parsed.usage_metadata = response.usage_metadata;
          return parsed;
        } catch (e) {
          console.error("Failed to parse structured output from Qwen. Raw content was:\n" + response.content, e);
          // Fallback structure
          return {
            enhanced_prompt: response.content,
            clarification_questions: [],
            usage_metadata: response.usage_metadata,
          };
        }
      }
    };
  }
}

/**
 * Initializes and returns the Qwen LLM client wrapper.
 */
export function getLlm(temperature: number = 0.7, maxTokens?: number): any {
  return new ChatQwen(temperature, maxTokens);
}

/**
 * Initializes and returns the ChatOpenAI client configured for OpenRouter.
 */
export function getOpenRouterLlm(
  modelName?: string,
  temperature: number = 0.7,
  maxTokens?: number,
  timeout: number = 60000
): ChatOpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set.");
  }

  const model = modelName || process.env.OPENROUTER_MODEL || "nvidia/nemotron-3-ultra-550b-a55b:free";

  return new ChatOpenAI({
    modelName: model,
    openAIApiKey: apiKey,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
    },
    temperature: temperature,
    maxTokens: maxTokens,
    timeout: timeout,
  });
}

export interface QwenBedrockUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

export class QwenBedrockResponse {
  content: string;
  usage_metadata: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };

  constructor(content: string, usage?: QwenBedrockUsage) {
    this.content = content;
    this.usage_metadata = {
      input_tokens: usage?.prompt_tokens || 0,
      output_tokens: usage?.completion_tokens || 0,
      total_tokens: usage?.total_tokens || 0,
    };
  }
}

/**
 * Calls the Qwen model on Bedrock directly via HTTP fetch.
 */
export async function invokeQwen(
  messages: any[],
  temperature: number = 0.2,
  maxTokens: number = 8192,
  timeout: number = 120000
): Promise<QwenBedrockResponse> {
  const apiKey = process.env.QWEN_API_KEY;
  if (!apiKey) {
    throw new Error("QWEN_API_KEY environment variable is not set.");
  }

  const modelName = process.env.QWEN_MODEL || "qwen.qwen3-coder-next";
  const baseUrl = "https://bedrock-runtime.us-east-1.amazonaws.com";
  const url = `${baseUrl}/model/${modelName}/invoke`;

  // Convert LangChain or raw messages to OpenAI chat format
  const formattedMessages = messages.map((msg) => {
    let role = "user";
    let content = "";

    if (msg && typeof msg === "object") {
      if ("_getType" in msg || "type" in msg) {
        // LangChain message class instance
        const msgType = typeof msg._getType === "function" ? msg._getType() : msg.type;
        const roleMap: Record<string, string> = { human: "user", ai: "assistant", system: "system" };
        role = roleMap[msgType] || msgType;
        content = msg.content;
      } else {
        role = msg.role || "user";
        content = msg.content || "";
      }
    } else {
      content = String(msg);
    }

    // Handle array of content (e.g., block structures)
    if (Array.isArray(content)) {
      content = content
        .map((part) => {
          if (typeof part === "string") return part;
          if (part && typeof part === "object") {
            return part.text || JSON.stringify(part);
          }
          return String(part);
        })
        .join("");
    }

    return { role, content };
  });

  const payload = {
    messages: formattedMessages,
    max_tokens: maxTokens,
    temperature: temperature,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Qwen Bedrock API error (HTTP ${response.status}): ${errorText}`);
    }

    const data: any = await response.json();

    // Extract content
    let content = "";
    if (data.choices && data.choices.length > 0) {
      content = data.choices[0].message?.content || "";
    } else if (data.output) {
      content = data.output;
    } else if (data.content) {
      content = data.content;
    }

    const usage: QwenBedrockUsage = data.usage || {};

    return new QwenBedrockResponse(content, usage);
  } catch (error: any) {
    clearTimeout(timeoutId);
    throw error;
  }
}
