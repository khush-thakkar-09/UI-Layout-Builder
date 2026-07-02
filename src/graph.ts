import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { GlobalState, SectionInfo, SectionCode } from "./state.js";
import { evaluateInput } from "./nodes/input_evaluator.js";
import { runPromptEnhancer } from "./nodes/prompt_enhancer.js";
import { runSectionDetailer, runSectionApproval } from "./nodes/section_identifier.js";
import { runThemeExtractor } from "./nodes/theme_extractor.js";
import { runSectionCoder } from "./nodes/section_coder.js";
import { runSynthesizer } from "./nodes/synthesizer.js";

// Define the root state annotation for LangGraph.js
export const GlobalStateAnnotation = Annotation.Root({
  project_id: Annotation<string>,
  user_prompt: Annotation<string>,
  input_evaluation: Annotation<"pass" | "fail">,
  input_evaluation_reason: Annotation<string>,
  enhanced_prompt: Annotation<string>,
  human_approved_prompt: Annotation<boolean>,
  pipeline_status: Annotation<"running" | "complete" | "failed" | "awaiting_human_response">,
  planned_sections: Annotation<string[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  sections: Annotation<SectionInfo[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  current_section_index: Annotation<number>,
  current_section_name: Annotation<string>,
  current_description: Annotation<string>,
  failure_reason: Annotation<string>,
  theme_css: Annotation<string>,
  coded_sections: Annotation<SectionCode[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  final_html: Annotation<string>,
  output_path: Annotation<string>,
});

function routeEvaluation(state: typeof GlobalStateAnnotation.State) {
  if (state.input_evaluation === "pass") {
    return "prompt_enhancer";
  } else {
    return "invalid_input";
  }
}

function routeSectionApproval(state: typeof GlobalStateAnnotation.State) {
  const plannedSections = state.planned_sections || [];
  const sections = state.sections || [];
  if (sections.length < plannedSections.length) {
    return "section_detailer";
  } else {
    return "theme_extractor";
  }
}

function handleInvalidInput(state: typeof GlobalStateAnnotation.State): Partial<GlobalState> {
  console.log(`\n[System] Evaluation Failed!`);
  console.log(`Reason: ${state.input_evaluation_reason}\n`);
  return {
    pipeline_status: "failed",
    failure_reason: state.input_evaluation_reason,
  };
}

export function buildGraph(checkpointer?: any) {
  const workflow = new StateGraph(GlobalStateAnnotation)
    // Register nodes
    .addNode("input_evaluator", evaluateInput)
    .addNode("prompt_enhancer", runPromptEnhancer)
    .addNode("section_detailer", runSectionDetailer)
    .addNode("section_approval", runSectionApproval)
    .addNode("theme_extractor", runThemeExtractor)
    .addNode("section_coder", runSectionCoder)
    .addNode("synthesizer", runSynthesizer)
    .addNode("invalid_input", handleInvalidInput)

    // Set entry point
    .addEdge(START, "input_evaluator")

    // Add conditional route
    .addConditionalEdges("input_evaluator", routeEvaluation, {
      prompt_enhancer: "prompt_enhancer",
      invalid_input: "invalid_input",
    })

    // Set terminal edges
    .addEdge("prompt_enhancer", "section_detailer")
    .addEdge("section_detailer", "section_approval")

    .addConditionalEdges("section_approval", routeSectionApproval, {
      section_detailer: "section_detailer",
      theme_extractor: "theme_extractor",
    })

    .addEdge("theme_extractor", "section_coder")
    .addEdge("section_coder", "synthesizer")
    .addEdge("synthesizer", END)
    .addEdge("invalid_input", END);

  return workflow.compile({ checkpointer });
}
