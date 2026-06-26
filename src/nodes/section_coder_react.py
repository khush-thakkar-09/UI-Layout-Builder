import re
import asyncio
from typing import Dict, Any, List
from langchain_core.messages import SystemMessage, HumanMessage
from src.state import GlobalState, SectionCode
from src.llm import invoke_qwen
from src.prompts.section_coder_react_prompt import SECTION_CODER_REACT_SYSTEM_PROMPT
from src.utils.token_tracker import log_token_usage

def extract_content_text(content) -> str:
    """
    Safely extracts string content from response, handling cases where it is returned
    as a list of parts (like in some LangChain response structures).
    """
    if isinstance(content, str):
        return content.strip()
    if isinstance(content, list):
        parts = []
        for part in content:
            if isinstance(part, str):
                parts.append(part)
            elif isinstance(part, dict) and "text" in part:
                parts.append(part["text"])
            elif hasattr(part, "text"):
                parts.append(getattr(part, "text"))
            else:
                parts.append(str(part))
        return "".join(parts).strip()
    return str(content).strip()

def extract_jsx_block(response_content) -> str:
    """
    Parses the model's response to extract JSX from fenced code blocks.
    """
    response_text = extract_content_text(response_content)
    # Try finding any jsx/tsx/javascript blocks
    match = re.search(r'```(?:jsx|tsx|javascript|js)\s*\n(.*?)```', response_text, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()
        
    # Try generic code blocks
    match = re.search(r'```\s*\n(.*?)```', response_text, re.DOTALL)
    if match:
        return match.group(1).strip()
        
    # Fallback to entire text if no code blocks are present
    return response_text.strip()

async def code_single_react_section(section_info: dict, enhanced_prompt: str) -> SectionCode:
    """
    Codes a single React section by calling Qwen via Bedrock.
    Runs in an executor since invoke_qwen is synchronous HTTP.
    """
    section_id = section_info["id"]
    section_name = section_info["name"]
    section_description = section_info["description"]
    
    print(f"  [React Coder] Starting section {section_id}: '{section_name}'...")
    
    system_prompt = SECTION_CODER_REACT_SYSTEM_PROMPT.format(section_number=section_id)
    
    user_prompt = f"""Build the following React section using Tailwind CSS:

**Section Name**: {section_name}

**Detailed Description**:
{section_description}

Remember: output ONLY the ```jsx block. No explanations, no comments, no markdown formatting outside the code block."""
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt),
    ]
    
    try:
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: invoke_qwen(messages, temperature=0.2, max_tokens=8192, timeout=180.0)
        )
        
        log_token_usage(f"React Coder ({section_name})", response)
        
        jsx = extract_jsx_block(response.content)
        
        if not jsx:
            raise ValueError("Could not find React JSX content in model response")
            
        print(f"  [React Coder] ✓ Section {section_id}: '{section_name}' coded successfully")
        
        return SectionCode(
            section_id=section_id,
            section_name=section_name,
            html="",
            css="",
            jsx=jsx,
            status="success",
            error=None,
        )
        
    except Exception as e:
        error_msg = str(e)
        print(f"  [React Coder] ✗ Section {section_id}: '{section_name}' FAILED — {error_msg}")
        
        # Retry once with a simplified prompt
        try:
            print(f"  [React Coder] Retrying section {section_id}...")
            retry_prompt = f"""Generate a React component for class/section: {section_name}.
Brief: {section_description[:500]}
Output ONLY the ```jsx block."""

            retry_messages = [
                SystemMessage(content="You are a frontend developer. Output only a ```jsx React code block."),
                HumanMessage(content=retry_prompt),
            ]
            
            retry_response = await loop.run_in_executor(
                None,
                lambda: invoke_qwen(retry_messages, temperature=0.1, max_tokens=6144, timeout=180.0)
            )
            
            log_token_usage(f"React Coder Retry ({section_name})", retry_response)
            jsx = extract_jsx_block(retry_response.content)
            
            if not jsx:
                raise ValueError("Could not find React JSX content in retry response")
                
            print(f"  [React Coder] ✓ Section {section_id}: '{section_name}' coded on retry")
            
            return SectionCode(
                section_id=section_id,
                section_name=section_name,
                html="",
                css="",
                jsx=jsx,
                status="success",
                error=None,
            )
            
        except Exception as retry_e:
            print(f"  [React Coder] ✗ Section {section_id}: retry also failed — {retry_e}")
            return SectionCode(
                section_id=section_id,
                section_name=section_name,
                html="",
                css="",
                jsx="",
                status="failed",
                error=f"Original: {error_msg} | Retry: {str(retry_e)}",
            )

def run_section_coder_react(state: GlobalState) -> Dict[str, Any]:
    """
    LangGraph node: codes all approved sections in parallel using Qwen for React JSX.
    Takes state["sections"] and produces state["coded_sections"].
    """
    sections = state.get("sections", [])
    enhanced_prompt = state.get("enhanced_prompt", "")
    
    if not sections:
        print("\n[React Coder] No sections to code!")
        return {
            "pipeline_status": "failed",
            "failure_reason": "No approved sections found to code",
        }
    
    print(f"\n[React Coder] Coding {len(sections)} sections in parallel...")
    
    async def code_all():
        tasks = [
            code_single_react_section(section, enhanced_prompt)
            for section in sections
        ]
        return await asyncio.gather(*tasks)
    
    coded_sections = asyncio.run(code_all())
    coded_sections = sorted(coded_sections, key=lambda s: s["section_id"])
    
    success_count = sum(1 for s in coded_sections if s["status"] == "success")
    failed_count = sum(1 for s in coded_sections if s["status"] == "failed")
    
    print(f"\n[React Coder] Results: {success_count} succeeded, {failed_count} failed")
    
    if success_count == 0:
        return {
            "coded_sections": list(coded_sections),
            "pipeline_status": "failed",
            "failure_reason": "All sections failed to code",
        }
        
    if failed_count > 0:
        failed_names = [s["section_name"] for s in coded_sections if s["status"] == "failed"]
        print(f"[React Coder] ⚠ Failed sections: {', '.join(failed_names)}")
        print("[React Coder] Continuing with successfully coded sections...")
        
    return {
        "coded_sections": list(coded_sections),
        "pipeline_status": "running",
    }
