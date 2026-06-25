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
    html_match = re.search(r'```html\s*\n(.*?)```', response_text, re.DOTALL)
    css_match = re.search(r'```css\s*\n(.*?)```', response_text, re.DOTALL)
    
    html = html_match.group(1).strip() if html_match else ""
    css = css_match.group(1).strip() if css_match else ""
    
    # If strict matching failed, try finding any code blocks
    if not html or not css:
        blocks = re.findall(r'```[a-z]*\s*\n(.*?)```', response_text, re.DOTALL)
        if len(blocks) >= 2:
            if not html: html = blocks[0].strip()
            if not css: css = blocks[1].strip()
        elif len(blocks) == 1:
            if not html: html = blocks[0].strip()
    
    # If css is STILL empty, check if it was embedded in the HTML block via <style> tags
    style_match = re.search(r'<style>(.*?)</style>', html, re.DOTALL | re.IGNORECASE)
    if style_match and not css:
        css = style_match.group(1).strip()
        # Remove the style block from HTML
        html = re.sub(r'<style>.*?</style>', '', html, flags=re.DOTALL | re.IGNORECASE).strip()
        
    if not html:
        raise ValueError("Could not find HTML content in model response")
    if not css:
        raise ValueError("Could not find CSS content in model response")
        
    return html, css


async def code_single_section(section_info: dict, enhanced_prompt: str) -> SectionCode:
    """
    Codes a single section by calling Qwen via Bedrock.
    Runs in an executor since invoke_qwen is synchronous HTTP.
    """
    section_id = section_info["id"]
    section_name = section_info["name"]
    section_description = section_info["description"]
    
    print(f"  [Coding Agent] Starting section {section_id}: '{section_name}'...")
    
    system_prompt = SECTION_CODER_SYSTEM_PROMPT.format(section_number=section_id)
    
    user_prompt = f"""Build the following section:

**Section Name**: {section_name}

**Detailed Description**:
{section_description}

Remember: output EXACTLY one ```html block and one ```css block. Nothing else."""
    
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
        
        # Validate that HTML contains the correct section class
        expected_class = f"section-{section_id}"
        if expected_class not in html:
            # Try to fix by wrapping
            html = f'<section class="{expected_class}">\n{html}\n</section>'
        
        print(f"  [Coding Agent] ✓ Section {section_id}: '{section_name}' coded successfully")
        
        return SectionCode(
            section_id=section_id,
            section_name=section_name,
            html=html,
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
            retry_prompt = f"""Generate HTML and CSS for a web section with class="section-{section_id}".

Section: {section_name}
Brief: {section_description[:500]}

Output ONLY:
1. A ```html block with a <section class="section-{section_id}"> element
2. A ```css block with all selectors scoped under .section-{section_id}

Use var(--bg-primary), var(--text-primary), var(--accent-color) for theming."""

            retry_messages = [
                SystemMessage(content="You are a frontend developer. Output only HTML and CSS code blocks."),
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
                html = f'<section class="{expected_class}">\n{html}\n</section>'
            
            print(f"  [Coding Agent] ✓ Section {section_id}: '{section_name}' coded on retry")
            
            return SectionCode(
                section_id=section_id,
                section_name=section_name,
                html=html,
                css=css,
                status="success",
                error=None,
            )
            
        except Exception as retry_e:
            print(f"  [Coding Agent] ✗ Section {section_id}: retry also failed — {retry_e}")
            return SectionCode(
                section_id=section_id,
                section_name=section_name,
                html="",
                css="",
                status="failed",
                error=f"Original: {error_msg} | Retry: {str(retry_e)}",
            )


def run_section_coder(state: GlobalState) -> Dict[str, Any]:
    """
    LangGraph node: codes all approved sections in parallel using Qwen.
    Takes state["sections"] and produces state["coded_sections"].
    """
    sections = state.get("sections", [])
    enhanced_prompt = state.get("enhanced_prompt", "")
    
    if not sections:
        print("\n[Coding Agent] No sections to code!")
        return {
            "pipeline_status": "failed",
            "failure_reason": "No approved sections found to code",
        }
    
    print(f"\n[Coding Agent] Coding {len(sections)} sections in parallel...")
    
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
            "coded_sections": list(coded_sections),
            "pipeline_status": "failed",
            "failure_reason": "All sections failed to code",
        }
    
    if failed_count > 0:
        failed_names = [s["section_name"] for s in coded_sections if s["status"] == "failed"]
        print(f"[Coding Agent] ⚠ Failed sections: {', '.join(failed_names)}")
        print("[Coding Agent] Continuing with successfully coded sections...")
    
    return {
        "coded_sections": list(coded_sections),
        "pipeline_status": "running",
    }
