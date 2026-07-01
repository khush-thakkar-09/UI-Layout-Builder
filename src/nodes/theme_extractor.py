import re
from typing import Dict, Any
from langchain_core.messages import SystemMessage, HumanMessage
from src.state import GlobalState
from src.llm import get_llm
from src.prompts.theme_extractor_prompt import THEME_EXTRACTOR_SYSTEM_PROMPT
from src.utils.token_tracker import log_token_usage


def extract_root_css(response_text: str) -> str:
    """
    Extracts the CSS block containing :root definition from the model's response.
    """
    if isinstance(response_text, list):
        parts = []
        for part in response_text:
            if isinstance(part, str):
                parts.append(part)
            elif isinstance(part, dict) and "text" in part:
                parts.append(part["text"])
            elif hasattr(part, "text"):
                parts.append(getattr(part, "text"))
            else:
                parts.append(str(part))
        response_text = "".join(parts)

    css_match = re.search(r'```css\s*\n(.*?)```', response_text, re.DOTALL)
    if css_match:
        return css_match.group(1).strip()

    code_match = re.search(r'```\s*\n(.*?)```', response_text, re.DOTALL)
    if code_match:
        return code_match.group(1).strip()

    return response_text.strip()


DEFAULT_THEME_CSS = """:root {
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
}"""


def run_theme_extractor(state: GlobalState) -> Dict[str, Any]:
    """
    LangGraph node: Extracts a unified global CSS theme (:root design tokens)
    using the enhanced prompt and ALL approved section descriptions as context.
    Runs after all sections are approved, before section coding begins.
    """
    enhanced_prompt = state.get("enhanced_prompt", "")
    sections = state.get("sections", [])

    print("\n[Theme Extractor] Generating unified design tokens from all section descriptions...")

    # Build the context message with all section descriptions
    section_context_parts = []
    for section in sections:
        section_context_parts.append(
            f"### Section {section['id']}: {section['name']}\n{section['description']}"
        )
    sections_context = "\n\n".join(section_context_parts)

    user_message = (
        f"**Enhanced Prompt (overall page vision):**\n{enhanced_prompt}\n\n"
        f"**All Section Descriptions ({len(sections)} sections):**\n\n{sections_context}"
    )

    try:
        llm = get_llm(temperature=0.4)
        messages = [
            SystemMessage(content=THEME_EXTRACTOR_SYSTEM_PROMPT),
            HumanMessage(content=user_message),
        ]
        response = llm.invoke(messages)
        log_token_usage("Theme Extractor", response)
        theme_css = extract_root_css(response.content)
        print(f"[Theme Extractor] ✓ Design tokens extracted successfully")
    except Exception as e:
        print(f"[Theme Extractor] ⚠ Theme generation failed ({e}). Using default tokens.")
        theme_css = DEFAULT_THEME_CSS

    return {
        "theme_css": theme_css,
        "pipeline_status": "running",
    }
