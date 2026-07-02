import { GlobalState } from "../state.js";

// A comprehensive list of UI/Layout-related keywords and phrases
const UI_KEYWORDS = [
  "\\bpage(s)?\\b",
  "\\bsite(s)?\\b",
  "\\bwebsite(s)?\\b",
  "\\blayout(s)?\\b",
  "\\bui\\b",
  "\\binterface(s)?\\b",
  "\\bcomponent(s)?\\b",
  "\\bsection(s)?\\b",
  "\\bscreen(s)?\\b",
  "\\bform(s)?\\b",
  "\\bcard(s)?\\b",
  "\\bdashboard(s)?\\b",
  "\\bportfolio(s)?\\b",
  "\\bnavbar\\b",
  "\\bnavigation\\b",
  "\\bheader(s)?\\b",
  "\\bfooter(s)?\\b",
  "\\bsidebar(s)?\\b",
  "\\bgrid\\b",
  "\\bhero\\b",
  "\\bpricing\\b",
  "\\bcarousel(s)?\\b",
  "\\blanding\\b",
  "\\bweb\\b",
  "\\bbutton(s)?\\b",
  "\\bmodal(s)?\\b",
  "\\bpopup(s)?\\b",
  "\\btable(s)?\\b",
  "\\bwidget(s)?\\b",
  "\\bgallery\\b",
  "\\bmenu(s)?\\b",
  "\\bfeed\\b",
  "\\bcheckout\\b",
  "\\bcart\\b"
];

// Compile patterns for efficiency
const UI_PATTERNS = UI_KEYWORDS.map(kw => new RegExp(kw, "i"));

/**
 * Evaluates whether the user's prompt is related to UI or layout building.
 * Uses regex pattern matching on the prompt.
 */
export function evaluateInput(state: Partial<GlobalState>): Partial<GlobalState> {
  const prompt = (state.user_prompt || "").trim();

  if (!prompt) {
    return {
      input_evaluation: "fail",
      input_evaluation_reason: "The prompt is empty. Please enter a valid prompt."
    };
  }

  const matchedKeywords: string[] = [];

  for (const pattern of UI_PATTERNS) {
    const match = prompt.match(pattern);
    if (match) {
      matchedKeywords.push(match[0]);
    }
  }

  if (matchedKeywords.length > 0) {
    return {
      input_evaluation: "pass",
      input_evaluation_reason: `Prompt is UI-related (matched: ${matchedKeywords.join(", ")}).`
    };
  } else {
    return {
      input_evaluation: "fail",
      input_evaluation_reason:
        "The input does not appear to be related to UI or layouts. " +
        "Please describe a web page, landing page, dashboard, layout, or section you want to build."
    };
  }
}
