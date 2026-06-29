import re
import asyncio
from typing import Dict, Any, List
from langchain_core.messages import SystemMessage, HumanMessage
from src.state import GlobalState, SectionCode
from src.llm import invoke_qwen
from src.prompts.section_coder_prompt import SECTION_CODER_SYSTEM_PROMPT
from src.utils.token_tracker import log_token_usage


def parse_code_blocks(response_text: str) -> tuple:
    """
    Parses the model's response to extract HTML and CSS from fenced code blocks.
    Returns (html_string, css_string).
    Raises ValueError if parsing fails.
    """
    # First, try strict matching
    jsx_match = re.search(r'```(?:jsx|javascript|react)\s*\n(.*?)```', response_text, re.DOTALL)
    css_match = re.search(r'```css\s*\n(.*?)```', response_text, re.DOTALL)
    
    jsx = jsx_match.group(1).strip() if jsx_match else ""
    css = css_match.group(1).strip() if css_match else ""
    
    # If strict matching failed, try finding any code blocks
    if not jsx or not css:
        blocks = re.findall(r'```[a-z]*\s*\n(.*?)```', response_text, re.DOTALL)
        if len(blocks) >= 2:
            if not jsx: jsx = blocks[0].strip()
            if not css: css = blocks[1].strip()
        elif len(blocks) == 1:
            if not jsx: jsx = blocks[0].strip()
    
    # If css is STILL empty, check if it was embedded in the JSX block via <style> tags
    style_match = re.search(r'<style>(.*?)</style>', jsx, re.DOTALL | re.IGNORECASE)
    if style_match and not css:
        css = style_match.group(1).strip()
        # Remove the style block from JSX
        jsx = re.sub(r'<style>.*?</style>', '', jsx, flags=re.DOTALL | re.IGNORECASE).strip()
        
    if not jsx:
        raise ValueError("Could not find JSX content in model response")
    if not css:
        raise ValueError("Could not find CSS content in model response")
        
    return jsx, css


async def code_single_section(section_info: dict, enhanced_prompt: str) -> SectionCode:
    """
    Codes a single section by calling Qwen via Bedrock.
    Runs in an executor since invoke_qwen is synchronous HTTP.
    """
    section_id = section_info["id"]
    section_name = section_info["name"]
    section_description = section_info["description"]
    cms_data = section_info.get("cms", {})
    
    section_component_name = "".join(word.capitalize() for word in re.split(r'[^a-zA-Z0-9]', section_name))
    
    print(f"  [Coding Agent] Starting section {section_id}: '{section_name}'...")
    
    system_prompt = SECTION_CODER_SYSTEM_PROMPT.format(
        section_number=section_id,
        section_component_name=section_component_name
    )
    
    import json
    user_prompt = f"""Build the following section:

**Section Name**: {section_name}

**Detailed Description**:
{section_description}

**Generated CMS Data schema (cmsData prop)**:
{json.dumps(cms_data, indent=2)}

Remember: output EXACTLY one ```jsx block and one ```css block. Nothing else."""
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt),
    ]
    
    try:
        # Run synchronous HTTP call in executor to not block the event loop
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: invoke_qwen(messages, temperature=0.2, max_tokens=8192, timeout=180.0)
        )
        
        log_token_usage(f"Section Coder ({section_name})", response)
        
        html, css = parse_code_blocks(response.content)
        
        # Validate that JSX contains the correct section class
        expected_class = f"section-{section_id}"
        if expected_class not in html:
            # Try to fix by wrapping
            html = f'<section className="{expected_class}">\n{html}\n</section>'
        
        print(f"  [Coding Agent] ✓ Section {section_id}: '{section_name}' coded successfully")
        
        return SectionCode(
            section_id=section_id,
            section_name=section_name,
            jsx=html,
            css=css,
            status="success",
            error=None,
        )
        
    except Exception as e:
        error_msg = str(e)
        print(f"  [Coding Agent] ✗ Section {section_id}: '{section_name}' FAILED — {error_msg}")
        
        # Retry once with a simplified prompt
        try:
            print(f"  [Coding Agent] Retrying section {section_id}...")
            retry_prompt = f"""Generate React JSX and CSS for a web section with className="section-{section_id}".

Section: {section_name}
Brief: {section_description[:500]}
CMS Context: {json.dumps(cms_data)[:1000]}

Output ONLY:
1. A ```jsx block with export default function {section_component_name}({{ cmsData }}) returning a <section className="section-{section_id}"> element
2. A ```css block with all selectors scoped under .section-{section_id}

Use var(--bg-primary), var(--text-primary), var(--accent-color) for theming."""

            retry_messages = [
                SystemMessage(content="You are a frontend React developer. Output only JSX and CSS code blocks."),
                HumanMessage(content=retry_prompt),
            ]
            
            retry_response = await loop.run_in_executor(
                None,
                lambda: invoke_qwen(retry_messages, temperature=0.1, max_tokens=6144, timeout=180.0)
            )
            
            log_token_usage(f"Section Coder Retry ({section_name})", retry_response)
            
            html, css = parse_code_blocks(retry_response.content)
            
            expected_class = f"section-{section_id}"
            if expected_class not in html:
                html = f'<section className="{expected_class}">\n{html}\n</section>'
            
            print(f"  [Coding Agent] ✓ Section {section_id}: '{section_name}' coded on retry")
            
            return SectionCode(
                section_id=section_id,
                section_name=section_name,
                jsx=html,
                css=css,
                status="success",
                error=None,
            )
            
        except Exception as retry_e:
            print(f"  [Coding Agent] ✗ Section {section_id}: retry also failed — {retry_e}")
            return SectionCode(
                section_id=section_id,
                section_name=section_name,
                jsx="",
                css="",
                status="failed",
                error=f"Original: {error_msg} | Retry: {str(retry_e)}",
            )


def run_section_coder(state: GlobalState) -> Dict[str, Any]:
    """
    LangGraph node: codes all approved sections.
    First runs CMS generation sequentially (to avoid index/field name collisions),
    then codes the sections in parallel using Qwen.
    """
    sections = state.get("sections", [])
    enhanced_prompt = state.get("enhanced_prompt", "")
    project_name = state.get("user_prompt", "LayoutBuilder").replace(" ", "")
    
    if not sections:
        print("\n[Coding Agent] No sections to code!")
        return {
            "pipeline_status": "failed",
            "failure_reason": "No approved sections found to code",
        }
    
    print(f"\n[Coding Agent] Generating CMS schemas sequentially...")
    from src.nodes.cms_generator import generate_cms_for_single_section
    
    previous_sections = []
    for section in sections:
        cms = generate_cms_for_single_section(section, previous_sections, project_name)
        section["cms"] = cms
        previous_sections.append(section)
        
    print(f"\n[Coding Agent] Coding {len(sections)} React sections in parallel...")
    
    # Run all section coding tasks concurrently
    async def code_all():
        tasks = [
            code_single_section(section, enhanced_prompt)
            for section in sections
        ]
        return await asyncio.gather(*tasks)
    
    coded_sections = asyncio.run(code_all())
    
    # Sort by section_id to maintain order
    coded_sections = sorted(coded_sections, key=lambda s: s["section_id"])
    
    # Report results
    success_count = sum(1 for s in coded_sections if s["status"] == "success")
    failed_count = sum(1 for s in coded_sections if s["status"] == "failed")
    
    print(f"\n[Coding Agent] Results: {success_count} succeeded, {failed_count} failed")
    
    if success_count == 0:
        return {
            "sections": sections,
            "coded_sections": list(coded_sections),
            "pipeline_status": "failed",
            "failure_reason": "All sections failed to code",
        }
    
    if failed_count > 0:
        failed_names = [s["section_name"] for s in coded_sections if s["status"] == "failed"]
        print(f"[Coding Agent] ⚠ Failed sections: {', '.join(failed_names)}")
        print("[Coding Agent] Continuing with successfully coded sections...")
    
    return {
        "sections": sections,
        "coded_sections": list(coded_sections),
        "pipeline_status": "running",
    }
