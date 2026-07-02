import { z } from "zod";

/**
 * Metadata info for each identified section in the layout.
 */
export interface SectionInfo {
  id: number;
  name: string;
  description: string;
  cms?: Record<string, any> | null;
}

/**
 * Output from the Coding Agent for a single section.
 */
export interface SectionCode {
  section_id: number;       // Matches SectionInfo.id
  section_name: string;     // Human-readable name
  jsx: string;              // React JSX block for this section
  css: string;              // Scoped CSS for this section
  status: string;           // "success" | "failed"
  error?: string | null;    // Error message if failed
}

/**
 * Global state schema for the LangGraph workflow.
 */
export interface GlobalState {
  project_id: string;
  user_prompt: string;
  input_evaluation: "pass" | "fail";
  input_evaluation_reason: string;
  enhanced_prompt: string;
  human_approved_prompt: boolean;
  pipeline_status: "running" | "complete" | "failed" | "awaiting_human_response";
  planned_sections: string[];
  sections: SectionInfo[];
  current_section_index: number;
  current_section_name: string;
  current_description: string;
  failure_reason: string;
  theme_css: string;
  coded_sections: SectionCode[];
  final_html: string;
  output_path: string;
}

/**
 * Zod Schema for the input evaluator / prompt enhancer structured output.
 */
export const EnhancedPromptResultSchema = z.object({
  enhanced_prompt: z.string().describe(
    "Refined and concise description of the UI layout topic and theme (max 250 tokens)."
  ),
  clarification_questions: z.array(z.string()).describe(
    "1-3 short clarification questions if the user request is ambiguous, otherwise empty list."
  ),
});

export type EnhancedPromptResult = z.infer<typeof EnhancedPromptResultSchema>;
