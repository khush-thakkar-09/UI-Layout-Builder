import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { GlobalState } from "../state.js";
import { getLlm } from "../llm.js";
import { THEME_EXTRACTOR_SYSTEM_PROMPT } from "../prompts/theme_extractor_prompt.js";
import { logTokenUsage } from "../utils/token_tracker.js";

function extractRootCss(responseText: any): string {
  let text = "";
  if (typeof responseText === "string") {
    text = responseText;
  } else if (Array.isArray(responseText)) {
    text = responseText
      .map((part) => (typeof part === "string" ? part : part.text || ""))
      .join("");
  } else {
    text = String(responseText);
  }

  const cssMatch = text.match(/```css\s*\n([\s\S]*?)```/);
  if (cssMatch) {
    return cssMatch[1].trim();
  }

  const codeMatch = text.match(/```\s*\n([\s\S]*?)```/);
  if (codeMatch) {
    return codeMatch[1].trim();
  }

  return text.trim();
}

const DEFAULT_THEME_CSS = `:root {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --accent-color: #3b82f6;
  --accent-hover: #2563eb;
  --font-family: 'Inter', sans-serif;
  --font-heading: 'Inter', sans-serif;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 32px;
  --spacing-xl: 64px;
  --border-radius: 8px;
  --border-radius-lg: 16px;
}`;

export async function runThemeExtractor(state: Partial<GlobalState>): Promise<Partial<GlobalState>> {
  const enhancedPrompt = state.enhanced_prompt || "";
  const sections = state.sections || [];

  console.log("\n[Theme Extractor] Generating unified design tokens from all section descriptions...");

  const sectionContextParts = sections.map(
    (section) => `### Section ${section.id}: ${section.name}\n${section.description}`
  );
  const sectionsContext = sectionContextParts.join("\n\n");

  const userMessage =
    `**Enhanced Prompt (overall page vision):**\n${enhancedPrompt}\n\n` +
    `**All Section Descriptions (${sections.length} sections):**\n\n${sectionsContext}`;

  let themeCss = "";
  try {
    const llm = getLlm(0.4);
    const messages = [
      new SystemMessage(THEME_EXTRACTOR_SYSTEM_PROMPT),
      new HumanMessage(userMessage),
    ];
    const response = await llm.invoke(messages);
    logTokenUsage("Theme Extractor", response);
    themeCss = extractRootCss(response.content);
    console.log(`[Theme Extractor] ✓ Design tokens extracted successfully`);
  } catch (error: any) {
    console.warn(`[Theme Extractor] ⚠ Theme generation failed (${error.message}). Using default tokens.`);
    themeCss = DEFAULT_THEME_CSS;
  }

  return {
    theme_css: themeCss,
    pipeline_status: "running",
  };
}
