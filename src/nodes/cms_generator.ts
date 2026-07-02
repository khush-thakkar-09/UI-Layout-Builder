import crypto from "node:crypto";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { getLlm } from "../llm.js";
import { CMS_GENERATOR_SYSTEM_PROMPT } from "../prompts/cms_generator_prompt.js";
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

function parseJsonBlock(responseText: string): any {
  const jsonMatch = responseText.match(/```json\s*\n([\s\S]*?)```/);
  let content = "";
  if (jsonMatch) {
    content = jsonMatch[1].trim();
  } else {
    const codeMatch = responseText.match(/```\s*\n([\s\S]*?)```/);
    if (codeMatch) {
      content = codeMatch[1].trim();
    } else {
      content = responseText.trim();
    }
  }

  content = content.replace("```json", "").replace("```", "").trim();
  return JSON.parse(content);
}

/**
 * Generates the CMS JSON schema for a single section.
 */
export async function generateCmsForSingleSection(
  sectionInfo: { id: number; name: string; description: string },
  previousSections: any[],
  projectName: string,
  pageName: string = "home"
): Promise<any> {
  const sectionId = sectionInfo.id;
  const sectionName = sectionInfo.name;
  const sectionDescription = sectionInfo.description;

  console.log(`  [CMS Generator] Generating CMS configuration for section ${sectionId}: '${sectionName}'...`);

  const prevSummaryItems: string[] = [];
  for (const prev of previousSections) {
    if (prev && prev.cms) {
      const meta = prev.cms.metadata || {};
      const elements = prev.cms.elements || [];
      const elemNames = elements.map((e: any) => e.elementName).filter(Boolean);
      prevSummaryItems.push(
        `- Section ID ${meta.sectionId} ('${meta.sectionName}'): Index=${meta.index}, ElementNames=${elemNames}`
      );
    }
  }

  const previousCmsSummary =
    prevSummaryItems.length === 0 ? "None (this is the first section)." : prevSummaryItems.join("\n");

  const llm = getLlm(0.2);

  const systemPrompt = CMS_GENERATOR_SYSTEM_PROMPT
    .replace("{project_name}", projectName)
    .replace("{page_name}", pageName)
    .replace("{previous_cms_summary}", previousCmsSummary)
    .replace("{section_name}", sectionName)
    .replace("{section_description}", sectionDescription)
    .replace("{index}", String(sectionId)); // Simple replacement if template string format is used

  const messages = [
    new SystemMessage(systemPrompt),
    new HumanMessage("Generate the CMS JSON matching the exact schema requirements."),
  ];

  try {
    const response = await llm.invoke(messages);
    logTokenUsage(`CMS Generator (${sectionName})`, response);

    const responseText = extractContentText(response.content);
    const cmsDict = parseJsonBlock(responseText);

    const metadata = cmsDict.metadata || {};
    const elements = cmsDict.elements || [];

    metadata.sectionName = sectionName;
    metadata.pageName = pageName;

    const plannedIndex = sectionId;
    if (previousSections && previousSections.length > 0) {
      const prevIndexes = previousSections
        .map((p) => p?.cms?.metadata?.index)
        .filter((idx) => typeof idx === "number");
      const maxPrev = prevIndexes.length > 0 ? Math.max(...prevIndexes) : 0;
      metadata.index = Math.max(maxPrev + 1, plannedIndex);
    } else {
      metadata.index = plannedIndex;
    }

    const sectionIdVal = crypto.randomUUID();
    metadata.sectionId = sectionIdVal;

    for (const elem of elements) {
      elem.sectionId = sectionIdVal;
      elem.section = sectionName;
      elem.projectName = projectName;
      elem.pageName = pageName;
      elem.fieldId = crypto.randomUUID();

      if (elem.loop && Array.isArray(elem.loop)) {
        for (const item of elem.loop) {
          for (let i = 1; i <= 10; i++) {
            const fieldIdKey = `fieldId${i}`;
            if (fieldIdKey in item) {
              item[fieldIdKey] = crypto.randomUUID();
            }
          }
        }
      }
    }

    cmsDict.metadata = metadata;
    cmsDict.elements = elements;

    console.log(`  [CMS Generator] ✓ CMS generated successfully for section ${sectionId}`);
    return cmsDict;
  } catch (error: any) {
    console.error(`  [CMS Generator] ✗ CMS generation FAILED for section ${sectionId}: ${error.message}`);
    const fallbackSecId = crypto.randomUUID();
    return {
      metadata: {
        sectionId: fallbackSecId,
        sectionName: sectionName,
        sectionStatus: "Active",
        variations: 1,
        sectionType: "",
        path: `/client/${projectName}/${sectionName.replace(/\s+/g, "")}/Variation1`,
        isAiGenerated: true,
        pageName: pageName,
        index: sectionId,
      },
      elements: [
        {
          sectionId: fallbackSecId,
          elementName: `${sectionName.toLowerCase().replace(/\s+/g, "")}Title`,
          fieldId: crypto.randomUUID(),
          content: sectionName,
          contentType: "Text",
          section: sectionName,
          projectName: projectName,
          pageName: pageName,
          isCustom: true,
          isCustomEdit: true,
        },
      ],
    };
  }
}
