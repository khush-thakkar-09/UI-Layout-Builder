import re
from typing import Dict, Any
from src.state import GlobalState

# A comprehensive list of UI/Layout-related keywords and phrases
UI_KEYWORDS = [
    r"\bpage(s)?\b",
    r"\bsite(s)?\b",
    r"\bwebsite(s)?\b",
    r"\blayout(s)?\b",
    r"\bui\b",
    r"\binterface(s)?\b",
    r"\bcomponent(s)?\b",
    r"\bsection(s)?\b",
    r"\bscreen(s)?\b",
    r"\bform(s)?\b",
    r"\bcard(s)?\b",
    r"\bdashboard(s)?\b",
    r"\bportfolio(s)?\b",
    r"\bnavbar\b",
    r"\bnavigation\b",
    r"\bheader(s)?\b",
    r"\bfooter(s)?\b",
    r"\bsidebar(s)?\b",
    r"\bgrid\b",
    r"\bhero\b",
    r"\bpricing\b",
    r"\bcarousel(s)?\b",
    r"\blanding\b",
    r"\bweb\b",
    r"\bbutton(s)?\b",
    r"\bmodal(s)?\b",
    r"\bpopup(s)?\b",
    r"\btable(s)?\b",
    r"\bwidget(s)?\b",
    r"\bgallery\b",
    r"\bmenu(s)?\b",
    r"\bfeed\b",
    r"\bcheckout\b",
    r"\bcart\b",
    r"\b(create|build|generate|make|design|render|construct|setup|add|produce)\b"
]

# Compile the patterns for efficiency
UI_PATTERNS = [re.compile(pattern, re.IGNORECASE) for pattern in UI_KEYWORDS]

def evaluate_input(state: GlobalState) -> Dict[str, Any]:
    """
    Evaluates whether the user's prompt is related to UI or layout building.
    Uses regex pattern matching on the prompt.
    """
    prompt = state.get("user_prompt", "").strip()
    
    if not prompt:
        return {
            "input_evaluation": "fail",
            "input_evaluation_reason": "The prompt is empty. Please enter a valid prompt."
        }
    
    # Check if any UI-related pattern matches the prompt
    matched = False
    matched_keywords = []
    
    for pattern in UI_PATTERNS:
        match = pattern.search(prompt)
        if match:
            matched = True
            matched_keywords.append(match.group(0))
            
    if matched:
        return {
            "input_evaluation": "pass",
            "input_evaluation_reason": f"Prompt is UI-related (matched: {', '.join(matched_keywords)})."
        }
    else:
        return {
            "input_evaluation": "fail",
            "input_evaluation_reason": (
                "The input does not appear to be related to UI or layouts. "
                "Please describe a web page, landing page, dashboard, layout, or section you want to build."
            )
        }
