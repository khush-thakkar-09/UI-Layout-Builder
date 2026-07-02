import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { GlobalState, SectionCode, SectionInfo } from "../state.js";
import { invokeQwen } from "../llm.js";
import { SECTION_CODER_SYSTEM_PROMPT } from "../prompts/section_coder_prompt.js";
import { logTokenUsage } from "../utils/token_tracker.js";
import camelCase from "lodash.camelcase";
import { generateCmsForSingleSection } from "./cms_generator.js";

function parseCodeBlocks(responseText: string): [string, string] {
  const jsxMatch = responseText.match(/```(?:jsx|javascript|react)\s*\n([\s\S]*?)```/);
  const cssMatch = responseText.match(/```css\s*\n([\s\S]*?)```/);

  let jsx = jsxMatch ? jsxMatch[1].trim() : "";
  let css = cssMatch ? cssMatch[1].trim() : "";

  if (!jsx || !css) {
    const blocks = Array.from(responseText.matchAll(/```[a-z]*\s*\n([\s\S]*?)```/gi)).map(m => m[1].trim());
    if (blocks.length >= 2) {
      if (!jsx) jsx = blocks[0];
      if (!css) css = blocks[1];
    } else if (blocks.length === 1) {
      if (!jsx) jsx = blocks[0];
    }
  }

  const styleMatch = jsx.match(/<style>([\s\S]*?)<\/style>/i);
  if (styleMatch && !css) {
    css = styleMatch[1].trim();
    jsx = jsx.replace(/<style>[\s\S]*?<\/style>/gi, "").trim();
  }

  if (!jsx) {
    throw new Error("Could not find JSX content in model response");
  }
  if (!css) {
    throw new Error("Could not find CSS content in model response");
  }

  return [jsx, css];
}

async function codeSingleSection(
  sectionInfo: SectionInfo,
  enhancedPrompt: string,
  themeCss: string = ""
): Promise<SectionCode> {
  const sectionId = sectionInfo.id;
  const sectionName = sectionInfo.name;
  const sectionDescription = sectionInfo.description;
  const cmsData = sectionInfo.cms || {};

  const camelName = camelCase(sectionName);
  const sectionComponentName = camelName.charAt(0).toUpperCase() + camelName.slice(1);

  console.log(`  [Coding Agent] Starting section ${sectionId}: '${sectionName}'...`);

  let systemPrompt = SECTION_CODER_SYSTEM_PROMPT
    .replace(/{section_number}/g, String(sectionId))
    .replace(/{section_component_name}/g, sectionComponentName);

  systemPrompt = systemPrompt.replace("__THEME_CSS__", themeCss);

  const userPrompt = `Build the following section:

**Section Name**: ${sectionName}

**Detailed Description**:
${sectionDescription}

**Generated CMS Data schema (cmsData prop)**:
${JSON.stringify(cmsData, null, 2)}

Remember: output EXACTLY one \`\`\`jsx block and one \`\`\`css block. Nothing else.`;

  const messages = [
    new SystemMessage(systemPrompt),
    new HumanMessage(userPrompt),
  ];

  try {
    const response = await invokeQwen(messages, 0.2, 8192, 180000);
    logTokenUsage(`Section Coder (${sectionName})`, response);

    let [html, css] = parseCodeBlocks(response.content);

    const expectedClass = `section-${sectionId}`;
    if (!html.includes(expectedClass)) {
      html = `<section className="${expectedClass}">\n${html}\n</section>`;
    }

    console.log(`  [Coding Agent] ✓ Section ${sectionId}: '${sectionName}' coded successfully`);

    return {
      section_id: sectionId,
      section_name: sectionName,
      jsx: html,
      css: css,
      status: "success",
      error: null,
    };
  } catch (error: any) {
    const errorMsg = error.message;
    console.error(`  [Coding Agent] ✗ Section ${sectionId}: '${sectionName}' FAILED — ${errorMsg}`);

    // Retry once with a simplified prompt
    try {
      console.log(`  [Coding Agent] Retrying section ${sectionId}...`);
      const retryPrompt = `Generate React JSX and CSS for a web section with className="section-${sectionId}".

Section: ${sectionName}
Brief: ${sectionDescription.substring(0, 500)}
CMS Context: ${JSON.stringify(cmsData).substring(0, 1000)}

Output ONLY:
1. A \`\`\`jsx block with export default function ${sectionComponentName}({ cmsData }) returning a <section className="section-${sectionId}"> element
2. A \`\`\`css block with all selectors scoped under .section-${sectionId}

Use var(--bg-primary), var(--text-primary), var(--accent-color) for theming.`;

      const retryMessages = [
        new SystemMessage("You are a frontend React developer. Output only JSX and CSS code blocks."),
        new HumanMessage(retryPrompt),
      ];

      const retryResponse = await invokeQwen(retryMessages, 0.1, 6144, 180000);
      logTokenUsage(`Section Coder Retry (${sectionName})`, retryResponse);

      let [html, css] = parseCodeBlocks(retryResponse.content);

      const expectedClass = `section-${sectionId}`;
      if (!html.includes(expectedClass)) {
        html = `<section className="${expectedClass}">\n${html}\n</section>`;
      }

      console.log(`  [Coding Agent] ✓ Section ${sectionId}: '${sectionName}' coded on retry`);

      return {
        section_id: sectionId,
        section_name: sectionName,
        jsx: html,
        css: css,
        status: "success",
        error: null,
      };
    } catch (retryE: any) {
      console.error(`  [Coding Agent] ✗ Section ${sectionId}: retry also failed — ${retryE.message}`);
      return {
        section_id: sectionId,
        section_name: sectionName,
        jsx: "",
        css: "",
        status: "failed",
        error: `Original: ${errorMsg} | Retry: ${retryE.message}`,
      };
    }
  }
}

export async function runSectionCoder(state: Partial<GlobalState>): Promise<Partial<GlobalState>> {
  const sections = state.sections || [];
  const enhancedPrompt = state.enhanced_prompt || "";
  const themeCss = state.theme_css || "";
  const projectName = (state.user_prompt || "LayoutBuilder").replace(/\s+/g, "");

  if (sections.length === 0) {
    console.log("\n[Coding Agent] No sections to code!");
    return {
      pipeline_status: "failed",
      failure_reason: "No approved sections found to code",
    };
  }

  console.log(`\n[Coding Agent] Generating CMS schemas sequentially...`);

  const previousSections: SectionInfo[] = [];
  for (const section of sections) {
    const cms = await generateCmsForSingleSection(section, previousSections, projectName);
    section.cms = cms;
    previousSections.push(section);
  }

  console.log(`\n[Coding Agent] Coding ${sections.length} React sections in parallel...`);

  const tasks = sections.map((section) =>
    codeSingleSection(section, enhancedPrompt, themeCss)
  );

  let codedSections = await Promise.all(tasks);

  // Sort by section_id to maintain order
  codedSections = codedSections.sort((a, b) => a.section_id - b.section_id);

  const successCount = codedSections.filter((s) => s.status === "success").length;
  const failedCount = codedSections.filter((s) => s.status === "failed").length;

  console.log(`\n[Coding Agent] Results: ${successCount} succeeded, ${failedCount} failed`);

  if (successCount === 0) {
    return {
      sections,
      coded_sections: codedSections,
      pipeline_status: "failed",
      failure_reason: "All sections failed to code",
    };
  }

  if (failedCount > 0) {
    const failedNames = codedSections
      .filter((s) => s.status === "failed")
      .map((s) => s.section_name);
    console.warn(`[Coding Agent] ⚠ Failed sections: ${failedNames.join(", ")}`);
    console.warn("[Coding Agent] Continuing with successfully coded sections...");
  }

  return {
    sections,
    coded_sections: codedSections,
    pipeline_status: "running",
  };
}
