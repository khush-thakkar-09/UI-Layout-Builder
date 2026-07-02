import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { interrupt } from "@langchain/langgraph";
import { GlobalState, SectionInfo } from "../state.js";
import { getLlm } from "../llm.js";
import { SECTION_PLANNER_SYSTEM_PROMPT, SECTION_DETAILER_SYSTEM_PROMPT } from "../prompts/section_identifier_prompt.js";
import { logTokenUsage } from "../utils/token_tracker.js";

function extractContentText(content: any): string {
  if (typeof content === "string") {
    return content.trim();
  }
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "string" ? part : part.text || ""))
      .join("")
      .trim();
  }
  return String(content).trim();
}

export async function runSectionDetailer(state: Partial<GlobalState>): Promise<Partial<GlobalState>> {
  const enhancedPrompt = state.enhanced_prompt || "";
  let plannedSections = state.planned_sections;
  const sections = state.sections || [];

  // Phase 1: Section Planning (only run once if not planned yet)
  if (!plannedSections || plannedSections.length === 0) {
    console.log(`\n[Section Detailer] Planning sections...`);
    let llm;
    try {
      llm = getLlm(0.3);
    } catch (e: any) {
      console.error(`Error initializing Qwen LLM: ${e}`);
      return { pipeline_status: "failed", failure_reason: `LLM initialization error: ${e.message}` };
    }

    const plannerMessages = [
      new SystemMessage(SECTION_PLANNER_SYSTEM_PROMPT),
      new HumanMessage(`Enhanced UI Prompt: ${enhancedPrompt}`),
    ];

    try {
      const plannerResponse = await llm.invoke(plannerMessages);
      logTokenUsage("Section Planner", plannerResponse);

      const content = extractContentText(plannerResponse.content);
      plannedSections = content
        .split("\n")
        .map((s) => s.replace(/^[- *1234567890.]+/g, "").trim())
        .filter((s) => s.length > 0);

      if (plannedSections.length > 5) {
        plannedSections = plannedSections.slice(0, 5);
      }

      console.log(`\n[Section Detailer] Planned ${plannedSections.length} sections:`);
      plannedSections.forEach((sec, idx) => {
        console.log(`  ${idx + 1}. ${sec}`);
      });
    } catch (e: any) {
      console.error(`Error during section planning: ${e}`);
      return { pipeline_status: "failed", failure_reason: `Section planning failed: ${e.message}` };
    }
  }

  // Determine which section to detail next
  const idx = sections.length;
  if (idx >= plannedSections.length) {
    return { planned_sections: plannedSections };
  }

  const sectionName = plannedSections[idx];
  console.log(`\n[Section Detailer] Generating details for section ${idx + 1}/${plannedSections.length}: '${sectionName}'...`);

  let detailerLlm;
  try {
    detailerLlm = getLlm(0.5);
  } catch (e: any) {
    console.error(`Error initializing Qwen LLM for detailer: ${e}`);
    return { pipeline_status: "failed", failure_reason: `LLM initialization error: ${e.message}` };
  }

  const detailerPrompt = SECTION_DETAILER_SYSTEM_PROMPT
    .replace("{section_name}", sectionName)
    .replace("{enhanced_prompt}", enhancedPrompt);

  const detailerMessages = [
    new SystemMessage(detailerPrompt),
    new HumanMessage("Please provide the detailed description for this section."),
  ];

  let currentDescription = "";
  try {
    const detailResponse = await detailerLlm.invoke(detailerMessages);
    logTokenUsage(`Section Detailer (${sectionName})`, detailResponse);
    currentDescription = extractContentText(detailResponse.content);
  } catch (e: any) {
    console.error(`Error generating details for '${sectionName}': ${e}`);
    return {
      pipeline_status: "failed",
      failure_reason: `Generating details for '${sectionName}' failed: ${e.message}`,
    };
  }

  return {
    planned_sections: plannedSections,
    current_section_name: sectionName,
    current_description: currentDescription,
    pipeline_status: "running",
  };
}

export async function runSectionApproval(state: Partial<GlobalState>): Promise<Partial<GlobalState>> {
  const sectionName = state.current_section_name || "";
  let currentDescription = state.current_description || "";
  const enhancedPrompt = state.enhanced_prompt || "";
  const sections = state.sections || [];

  const humanResponse = interrupt({
    type: "section_approval",
    section_name: sectionName,
    description: currentDescription,
  }) as any;

  const choice = humanResponse?.choice;
  const feedback = humanResponse?.feedback || "";

  if (choice === "1") {
    console.log(`\n[Section Approval] '${sectionName}' approved.`);
  } else {
    console.log(`\n[Section Approval] Re-generating '${sectionName}' with feedback...`);
    let detailerLlm;
    try {
      detailerLlm = getLlm(0.5);
    } catch (e: any) {
      return { pipeline_status: "failed", failure_reason: `LLM init error: ${e.message}` };
    }

    const detailerPrompt = SECTION_DETAILER_SYSTEM_PROMPT
      .replace("{section_name}", sectionName)
      .replace("{enhanced_prompt}", enhancedPrompt);

    const detailerMessages = [
      new SystemMessage(detailerPrompt),
      new HumanMessage("Please provide the detailed description for this section."),
      new HumanMessage(
        `Previous description: ${currentDescription}\n\nThe user provided this feedback: '${feedback}'. Please update the description incorporating this feedback while adhering to the original rules. Output ONLY the updated description.`
      ),
    ];

    try {
      const refinedResponse = await detailerLlm.invoke(detailerMessages);
      logTokenUsage(`Section Detailer Refine (${sectionName})`, refinedResponse);
      currentDescription = extractContentText(refinedResponse.content);

      console.log("\n" + "=".repeat(50));
      console.log(`UPDATED SECTION: ${sectionName.toUpperCase()}`);
      console.log("-".repeat(50));
      console.log(currentDescription);
      console.log("=".repeat(50) + "\n");
    } catch (e: any) {
      console.error(`Error refining section '${sectionName}': ${e}`);
      return {
        pipeline_status: "failed",
        failure_reason: `Refining section '${sectionName}' failed: ${e.message}`,
      };
    }
  }

  // Store approved section
  const newSections = [...sections];
  newSections.push({
    id: newSections.length + 1,
    name: sectionName,
    description: currentDescription,
  });

  return {
    sections: newSections,
    current_section_index: newSections.length,
    pipeline_status: "running",
  };
}
