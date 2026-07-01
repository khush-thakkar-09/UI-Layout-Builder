from typing import Dict, Any
from langchain_core.messages import SystemMessage, HumanMessage
from src.state import GlobalState
from src.llm import get_llm
from src.prompts.section_identifier_prompt import SECTION_PLANNER_SYSTEM_PROMPT, SECTION_DETAILER_SYSTEM_PROMPT
from src.utils.token_tracker import log_token_usage

def extract_content_text(content) -> str:
    """
    Safely extracts string content from response, handling cases where it is returned
    as a list of parts (like in some LangChain Gemini response structures).
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

def run_section_detailer(state: GlobalState) -> Dict[str, Any]:
    """
    Identifies sections based on the enhanced prompt (if not already planned),
    then generates the description for the next unapproved section.
    """
    enhanced_prompt = state.get("enhanced_prompt", "")
    planned_sections = state.get("planned_sections")
    sections = state.get("sections", [])
    
    # Phase 1: Section Planning (only run once if not planned yet)
    if not planned_sections:
        print(f"\n[Section Detailer] Planning sections...")
        try:
            # We use temperature 0.3 for planning and structured layout tasks for stability
            llm = get_llm(temperature=0.3)
        except ValueError as e:
            print(f"Error initializing Qwen LLM: {e}")
            return {"pipeline_status": "failed", "failure_reason": f"LLM initialization error: {e}"}

        planner_messages = [
            SystemMessage(content=SECTION_PLANNER_SYSTEM_PROMPT),
            HumanMessage(content=f"Enhanced UI Prompt: {enhanced_prompt}")
        ]
        try:
            planner_response = llm.invoke(planner_messages)
            log_token_usage("Section Planner", planner_response)
            
            content = extract_content_text(planner_response.content)
            planned_sections = [s.strip("- *1234567890.") for s in content.split("\n") if s.strip()]
            
            if len(planned_sections) > 5:
                planned_sections = planned_sections[:5]
                
            print(f"\n[Section Detailer] Planned {len(planned_sections)} sections:")
            for idx, sec in enumerate(planned_sections):
                print(f"  {idx+1}. {sec}")
        except Exception as e:
            print(f"Error during section planning: {e}")
            return {"pipeline_status": "failed", "failure_reason": f"Section planning failed: {e}"}

    # Determine which section to detail next
    idx = len(sections)
    if idx >= len(planned_sections):
        return {"planned_sections": planned_sections}
        
    section_name = planned_sections[idx]
    print(f"\n[Section Detailer] Generating details for section {idx+1}/{len(planned_sections)}: '{section_name}'...")
    
    try:
        detailer_llm = get_llm(temperature=0.5)
    except ValueError as e:
        print(f"Error initializing Qwen LLM for detailer: {e}")
        return {"pipeline_status": "failed", "failure_reason": f"LLM initialization error: {e}"}

    detailer_prompt = SECTION_DETAILER_SYSTEM_PROMPT.format(
        section_name=section_name,
        enhanced_prompt=enhanced_prompt
    )
    
    detailer_messages = [
        SystemMessage(content=detailer_prompt),
        HumanMessage(content="Please provide the detailed description for this section.")
    ]
    
    try:
        detail_response = detailer_llm.invoke(detailer_messages)
        log_token_usage(f"Section Detailer ({section_name})", detail_response)
        current_description = extract_content_text(detail_response.content)
    except Exception as e:
        print(f"Error generating details for '{section_name}': {e}")
        return {"pipeline_status": "failed", "failure_reason": f"Generating details for '{section_name}' failed: {e}"}

    return {
        "planned_sections": planned_sections,
        "current_section_name": section_name,
        "current_description": current_description,
        "pipeline_status": "running"
    }

def run_section_approval(state: GlobalState) -> Dict[str, Any]:
    """
    Handles human-in-the-loop per section and refines if feedback is provided.
    """
    section_name = state.get("current_section_name", "")
    current_description = state.get("current_description", "")
    enhanced_prompt = state.get("enhanced_prompt", "")
    sections = state.get("sections", [])
    
    from langgraph.types import interrupt
    
    human_response = interrupt({
        "type": "section_approval",
        "section_name": section_name,
        "description": current_description
    })
    
    choice = human_response.get("choice")
    feedback = human_response.get("feedback", "")
    
    if choice == "1":
        print(f"\n[Section Approval] '{section_name}' approved.")
    else:
        print(f"\n[Section Approval] Re-generating '{section_name}' with feedback...")
        try:
            detailer_llm = get_llm(temperature=0.5)
        except ValueError as e:
            return {"pipeline_status": "failed", "failure_reason": f"LLM init error: {e}"}

        detailer_prompt = SECTION_DETAILER_SYSTEM_PROMPT.format(
            section_name=section_name,
            enhanced_prompt=enhanced_prompt
        )
        
        detailer_messages = [
            SystemMessage(content=detailer_prompt),
            HumanMessage(content="Please provide the detailed description for this section."),
            # Using the previous description as context for the refinement
            HumanMessage(content=f"Previous description: {current_description}\n\nThe user provided this feedback: '{feedback}'. Please update the description incorporating this feedback while adhering to the original rules. Output ONLY the updated description.")
        ]
        
        try:
            refined_response = detailer_llm.invoke(detailer_messages)
            log_token_usage(f"Section Detailer Refine ({section_name})", refined_response)
            current_description = extract_content_text(refined_response.content)
            
            print("\n" + "="*50)
            print(f"UPDATED SECTION: {section_name.upper()}")
            print("-" * 50)
            print(current_description)
            print("="*50 + "\n")
        except Exception as e:
            print(f"Error refining section '{section_name}': {e}")
            return {"pipeline_status": "failed", "failure_reason": f"Refining section '{section_name}' failed: {e}"}

    # Store approved section
    sections.append({
        "id": len(sections) + 1,
        "name": section_name,
        "description": current_description
    })

    return {
        "sections": sections,
        "current_section_index": len(sections),
        "pipeline_status": "running"
    }


