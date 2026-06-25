import os
import re
from typing import Dict, Any
from langchain_core.messages import SystemMessage, HumanMessage
from src.state import GlobalState
from src.llm import get_llm
from src.prompts.synthesizer_prompt import THEME_EXTRACTOR_PROMPT, HTML_SHELL_TEMPLATE
from src.utils.token_tracker import log_token_usage

def extract_root_css(response_text: str) -> str:
    """
    Extracts the CSS block containing :root definition from the model's response.
    """
    css_match = re.search(r'```css\s*\n(.*?)```', response_text, re.DOTALL)
    if css_match:
        return css_match.group(1).strip()
    
    # Fallback to general code blocks if specific language tag is missing
    code_match = re.search(r'```\s*\n(.*?)```', response_text, re.DOTALL)
    if code_match:
        return code_match.group(1).strip()
        
    # If no blocks found, return cleaned original text
    return response_text.strip()

def run_synthesizer(state: GlobalState) -> Dict[str, Any]:
    """
    LangGraph node: Combines HTML and CSS from all coded sections into a single index.html.
    Extracts Google Fonts and generates design tokens via Gemini.
    Writes the final file to output/index.html.
    """
    coded_sections = state.get("coded_sections", [])
    enhanced_prompt = state.get("enhanced_prompt", "")
    user_prompt = state.get("user_prompt", "AI Generated UI Layout")
    
    if not coded_sections:
        print("\n[Synthesizer] No coded sections to synthesize!")
        return {
            "pipeline_status": "failed",
            "failure_reason": "No coded sections found to synthesize",
        }
        
    print("\n[Synthesizer] Generating global design tokens and theme...")
    
    # Initialize Gemini to derive theme tokens
    try:
        llm = get_llm(temperature=0.2)
        theme_messages = [
            SystemMessage(content=THEME_EXTRACTOR_PROMPT),
            HumanMessage(content=f"UI Request: {user_prompt}\n\nDetailed Context: {enhanced_prompt}")
        ]
        theme_response = llm.invoke(theme_messages)
        log_token_usage("Theme Extractor", theme_response)
        root_css = extract_root_css(theme_response.content)
    except Exception as e:
        print(f"[Synthesizer] ⚠ Theme generation failed ({e}). Using default theme tokens.")
        # Fallback theme tokens
        root_css = """:root {
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

    # Extract Google Fonts to link in the head
    # Scan root_css for any fonts and generate the Google Fonts import link
    font_matches = re.findall(r"font-(?:family|heading):\s*['\"]?([^'\"\;]+)['\"]?", root_css)
    google_fonts_link = ""
    if font_matches:
        # Clean font names and convert spaces to '+'
        font_families = []
        for font in set(font_matches):
            font = font.split(",")[0].strip() # Take primary font in list
            if font.lower() not in ["sans-serif", "serif", "monospace", "cursive", "system-ui", "-apple-system"]:
                font_families.append(font.replace(" ", "+"))
        if font_families:
            font_query = "|".join(font_families)
            google_fonts_link = f'<link href="https://fonts.googleapis.com/css2?family={font_query}:wght@400;600;700;800&display=swap" rel="stylesheet">'

    print("[Synthesizer] Assembling HTML and CSS components...")
    
    # Aggregate HTML and CSS
    html_blocks = []
    css_blocks = []
    
    # Filter to only successfully coded sections
    successful_sections = [s for s in coded_sections if s["status"] == "success"]
    
    for sec in successful_sections:
        html_blocks.append(sec["html"])
        css_blocks.append(f"/* Section {sec['section_id']}: {sec['section_name']} */\n{sec['css']}")
        
    combined_html = "\n\n  ".join(html_blocks)
    combined_css = "\n\n".join(css_blocks)
    
    # Synthesize the final page content
    final_page_content = HTML_SHELL_TEMPLATE.format(
        page_title="Generated Page — " + user_prompt[:40],
        page_description=user_prompt[:150],
        google_fonts_link=google_fonts_link,
        root_css=root_css,
        section_css=combined_css,
        section_html=combined_html
    )
    
    # Ensure the output directory exists
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "output")
    os.makedirs(output_dir, exist_ok=True)
    
    output_file = os.path.join(output_dir, "index.html")
    
    try:
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(final_page_content)
        print(f"[Synthesizer] ✓ Final page successfully written to: {output_file}")
    except Exception as e:
        print(f"[Synthesizer] ✗ Failed to write file: {e}")
        return {
            "pipeline_status": "failed",
            "failure_reason": f"Writing synthesized file failed: {e}",
        }
        
    return {
        "final_html": final_page_content,
        "output_path": output_file,
        "pipeline_status": "complete",
    }
