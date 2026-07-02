import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { interrupt } from "@langchain/langgraph";
import { GlobalState, EnhancedPromptResultSchema, EnhancedPromptResult } from "../state.js";
import { getLlm } from "../llm.js";
import { PROMPT_ENHANCER_SYSTEM_PROMPT } from "../prompts/prompt_enhancer_prompt.js";
import { logTokenUsage } from "../utils/token_tracker.js";

/**
 * Enhances the user prompt using Qwen and handles human-in-the-loop approval.
 */
export async function runPromptEnhancer(state: Partial<GlobalState>): Promise<Partial<GlobalState>> {
  const rawPrompt = state.user_prompt || "";
  console.log(`\n[Prompt Enhancer] Enhancing raw prompt: '${rawPrompt}'...`);

  // Initialize LLM with max 250 tokens
  const llm = getLlm(0.3, 250);
  const structuredLlm = llm.withStructuredOutput(EnhancedPromptResultSchema);

  // First enhancement pass
  const messages = [
    new SystemMessage(PROMPT_ENHANCER_SYSTEM_PROMPT),
    new HumanMessage(`Raw user prompt: ${rawPrompt}`),
  ];

  let response: EnhancedPromptResult;
  try {
    response = (await structuredLlm.invoke(messages)) as EnhancedPromptResult;
    logTokenUsage("Prompt Enhancer Pass 1", response);
  } catch (error: any) {
    console.error(`Error calling LLM for prompt enhancement: ${error}`);
    // Fallback
    response = {
      enhanced_prompt: `UI layout request for: ${rawPrompt}`,
      clarification_questions: [],
    };
  }

  const enhanced = response.enhanced_prompt;
  const questions = response.clarification_questions;

  console.log("\n" + "=".repeat(50));
  console.log("PROMPT ENHANCER SUGGESTION:");
  console.log("-".repeat(50));
  console.log(enhanced);
  if (questions && questions.length > 0) {
    console.log("-".repeat(50));
    console.log("CLARIFICATION QUESTIONS:");
    for (const q of questions) {
      console.log(`- ${q}`);
    }
  }
  console.log("=".repeat(50) + "\n");

  // LangGraph Native Human-in-the-Loop Interrupt
  const humanResponse = interrupt({
    type: "prompt_approval",
    enhanced_prompt: enhanced,
    questions: questions,
  }) as any;

  const choice = humanResponse?.choice;
  const feedback = humanResponse?.feedback || "";

  if (choice === "1") {
    console.log("\n[Prompt Enhancer] Prompt approved as-is.");
    return {
      enhanced_prompt: enhanced,
      human_approved_prompt: true,
      pipeline_status: "running",
    };
  } else {
    console.log(`\n[Prompt Enhancer] Re-enhancing prompt with feedback: '${feedback}'...`);

    // Second pass: merge feedback into a single final prompt
    const mergeMessages = [
      new SystemMessage(
        "You are a prompt consolidator. Combine the initial raw prompt, the enhanced recommendation, " +
          "and the human feedback/clarifications into a final, unified, and concise UI layout description (max 250 tokens). " +
          "Do NOT include any questions in the output. " +
          "Do NOT identify specific layout sections, HTML elements, or components. " +
          "Focus strictly on the layout topic, brand identity, visual style, theme, color palettes, and overall design goals."
      ),
      new HumanMessage(
        `Initial Prompt: ${rawPrompt}\n` +
          `Enhanced Recommendation: ${enhanced}\n` +
          `Human Feedback: ${feedback}`
      ),
    ];

    let finalPrompt = "";
    try {
      const secondResponse = await llm.invoke(mergeMessages);
      logTokenUsage("Prompt Enhancer Pass 2", secondResponse);
      const content = secondResponse.content;
      if (Array.isArray(content)) {
        finalPrompt = content
          .map((part: any) => (typeof part === "string" ? part : part.text || ""))
          .join("")
          .trim();
      } else {
        finalPrompt = String(content).trim();
      }
    } catch (error) {
      console.error(`Error during prompt consolidation: ${error}`);
      finalPrompt = `${enhanced} (Feedback: ${feedback})`;
    }

    console.log("\n" + "=".repeat(50));
    console.log("FINAL ENHANCED PROMPT:");
    console.log("-".repeat(50));
    console.log(finalPrompt);
    console.log("=".repeat(50) + "\n");

    return {
      enhanced_prompt: finalPrompt,
      human_approved_prompt: true,
      pipeline_status: "running",
    };
  }
}
