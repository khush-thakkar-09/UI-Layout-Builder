import os
import re
import json
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
        
    # Filter to only successfully coded sections
    successful_sections = [s for s in coded_sections if s["status"] == "success"]
    
    print("\n[Synthesizer] Generating global design tokens and theme...")
    
    # Initialize Gemini to derive theme tokens
    try:
        llm = get_llm(temperature=0.4)
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
}"""    # Assemble CSS blocks to get a combined CSS string for scanning fonts
    css_blocks = []
    for sec_code in successful_sections:
        css_blocks.append(f"/* Section {sec_code['section_id']}: {sec_code['section_name']} */\n{sec_code['css']}")

    # Extract Google Fonts to link/import from both root_css and section CSS blocks
    all_css_to_scan = root_css + "\n" + "\n".join(css_blocks)
    font_matches = re.findall(
        r"(?:font-family|font-heading|font-mono|--font-[a-z0-9-]+):\s*['\"]?([^'\"\;,\)]+)['\"]?",
        all_css_to_scan
    )
    
    google_fonts_import = ""
    if font_matches:
        font_families = []
        for font in set(font_matches):
            font = font.split(",")[0].strip()
            # Clean quotes if any
            font = font.strip("'\"")
            if font.lower() not in ["sans-serif", "serif", "monospace", "cursive", "system-ui", "-apple-system", "inherit", "initial", "unset"] and not font.startswith("var("):
                font_families.append(font.replace(" ", "+"))
        if font_families:
            font_query = "|".join(font_families)
            google_fonts_import = f"@import url('https://fonts.googleapis.com/css2?family={font_query}:wght@400;600;700;800&display=swap');\n\n"

    print("[Synthesizer] Assembling React components and stylesheets...")
    
    jsx_components = []
    resolved_cms = {}
    db_records = []
    
    for sec_code in successful_sections:
        section_id = sec_code["section_id"]
        section_name = sec_code["section_name"]
        
        # Get raw JSX, strip internal React imports to prevent duplicate or invalid imports
        raw_jsx = sec_code["jsx"]
        clean_jsx = re.sub(r'^\s*import\s+.*?;?\s*$', '', raw_jsx, flags=re.MULTILINE)
        clean_jsx = clean_jsx.replace("export default function", "function")
        jsx_components.append(f"// --- Section {section_id}: {section_name} ---\n{clean_jsx}")
        
        # CMS Resolution: find the section CMS from state.sections
        section_state = next((s for s in state.get("sections", []) if s["id"] == section_id), None)
        if section_state and section_state.get("cms"):
            cms = section_state["cms"]
            db_records.append(cms)
            
            # Format elements as key-value for easy JSX rendering
            # sectionName -> frequentlyAskedQuestions
            component_key = "".join(word.capitalize() for word in re.split(r'[^a-zA-Z0-9]', section_name))
            component_key = component_key[0].lower() + component_key[1:]
            
            elements_map = {}
            for elem in cms.get("elements", []):
                elem_name = elem.get("elementName")
                if elem_name:
                    elements_map[elem_name] = elem
                    
            resolved_cms[component_key] = elements_map

    # Build the combined JSX App Component
    wrapper_lines = [
        "export function GeneratedPage({ cmsData }) {",
        "  return (",
        "    <div className=\"generated-page-container\">"
    ]
    
    for sec_code in successful_sections:
        section_name = sec_code["section_name"]
        component_name = "".join(word.capitalize() for word in re.split(r'[^a-zA-Z0-9]', section_name))
        prop_key = component_name[0].lower() + component_name[1:]
        wrapper_lines.append(f"      <{component_name} cmsData={{cmsData.{prop_key}}} />")
        
    wrapper_lines.append("    </div>")
    wrapper_lines.append("  );")
    wrapper_lines.append("}")

    # Determine which React hooks are referenced across all generated JSX components
    all_jsx_content = "\n".join(jsx_components)
    hooks_to_import = ["useState", "useMemo"]
    possible_hooks = [
        "useEffect", "useRef", "useCallback", "useContext", "useReducer",
        "useImperativeHandle", "useLayoutEffect", "useDebugValue"
    ]
    for hook in possible_hooks:
        if re.search(r'\b' + hook + r'\b', all_jsx_content):
            hooks_to_import.append(hook)
    
    hooks_import_list = ", ".join(sorted(list(set(hooks_to_import))))
    
    combined_jsx = (
        f"import React, {{ {hooks_import_list} }} from 'react';\n"
        "import cmsDataRaw from './cms_data.json';\n"
        "import './index.css';\n\n"
        + "\n\n".join(jsx_components) + "\n\n"
        + "\n".join(wrapper_lines) + "\n\n"
        "export default function App() {\n"
        "  return <GeneratedPage cmsData={cmsDataRaw.resolved_cms} />;\n"
        "}"
    )
    combined_css = google_fonts_import + root_css + "\n\n" + "\n\n".join(css_blocks)
    
    # Save CMS payloads
    cms_payload = {
        "db_records": db_records,
        "resolved_cms": resolved_cms
    }
    
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    # Paths for output folder
    output_dir = os.path.join(project_root, "output")
    os.makedirs(output_dir, exist_ok=True)
    out_jsx_file = os.path.join(output_dir, "page.jsx")
    out_css_file = os.path.join(output_dir, "page.css")
    out_cms_file = os.path.join(output_dir, "cms_data.json")
    
    # Paths for testing_react project
    react_src_dir = os.path.join(project_root, "testing_react", "src")
    os.makedirs(react_src_dir, exist_ok=True)
    react_jsx_file = os.path.join(react_src_dir, "App.jsx")
    react_css_file = os.path.join(react_src_dir, "index.css")
    react_cms_file = os.path.join(react_src_dir, "cms_data.json")
    
    try:
        # Write to output folder
        with open(out_jsx_file, "w", encoding="utf-8") as f:
            f.write(combined_jsx)
        with open(out_css_file, "w", encoding="utf-8") as f:
            f.write(combined_css)
        with open(out_cms_file, "w", encoding="utf-8") as f:
            json.dump(cms_payload, f, indent=2)
            
        # Write directly to testing_react project
        with open(react_jsx_file, "w", encoding="utf-8") as f:
            f.write(combined_jsx)
        with open(react_css_file, "w", encoding="utf-8") as f:
            f.write(combined_css)
        with open(react_cms_file, "w", encoding="utf-8") as f:
            json.dump(cms_payload, f, indent=2)
            
        print(f"[Synthesizer] ✓ React components compiled to output: {out_jsx_file}")
        print(f"[Synthesizer] ✓ CSS stylesheet written to output: {out_css_file}")
        print(f"[Synthesizer] ✓ Unified CMS JSON payload written to output: {out_cms_file}")
        print(f"[Synthesizer] ✓ React components integrated into testing_react: {react_jsx_file}")
        print(f"[Synthesizer] ✓ CSS stylesheet integrated into testing_react: {react_css_file}")
        print(f"[Synthesizer] ✓ CMS JSON integrated into testing_react: {react_cms_file}")
    except Exception as e:
        print(f"[Synthesizer] ✗ Failed to write output files: {e}")
        return {
            "pipeline_status": "failed",
            "failure_reason": f"Writing synthesized files failed: {e}",
        }
        
    return {
        "final_html": combined_jsx,  # Kept in state for graph output
        "output_path": out_jsx_file,
        "pipeline_status": "complete",
    }
