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

def run_section_identifier(state: GlobalState) -> Dict[str, Any]:
    """
    Identifies sections based on the enhanced prompt, generating them one by one using Gemini.
    Handles human-in-the-loop per section.
    """
    enhanced_prompt = state.get("enhanced_prompt", "")
    print(f"\n[Section Identifier] Planning sections...")
    
    # Initialize Gemini LLM
    try:
        # We use temperature 0.2 for planning and structured layout tasks for stability
        llm = get_llm(temperature=0.3)
    except ValueError as e:
        print(f"Error initializing Gemini LLM: {e}")
        return {"pipeline_status": "failed", "failure_reason": f"LLM initialization error: {e}"}

    # --- Phase 1: Section Planning ---
    planner_messages = [
        SystemMessage(content=SECTION_PLANNER_SYSTEM_PROMPT),
        HumanMessage(content=f"Enhanced UI Prompt: {enhanced_prompt}")
    ]
    
    try:
        planner_response = llm.invoke(planner_messages)
        log_token_usage("Section Planner", planner_response)
        
        # Parse sections
        content = extract_content_text(planner_response.content)
        planned_sections = [s.strip("- *1234567890.") for s in content.split("\n") if s.strip()]
        
        # Limit to max 5
        if len(planned_sections) > 5:
            planned_sections = planned_sections[:5]
            
        print(f"\n[Section Identifier] Planned {len(planned_sections)} sections:")
        for idx, sec in enumerate(planned_sections):
            print(f"  {idx+1}. {sec}")
            
    except Exception as e:
        print(f"Error during section planning: {e}")
        return {"pipeline_status": "failed", "failure_reason": f"Section planning failed: {e}"}

    # --- Phase 2: Section Detailing (One by One) ---
    approved_sections = []
    
    # Detailer can use slightly higher temperature for richer descriptions
    try:
        detailer_llm = get_llm(temperature=0.5)
    except ValueError as e:
        print(f"Error initializing Gemini LLM for detailer: {e}")
        return {"pipeline_status": "failed", "failure_reason": f"LLM initialization error: {e}"}

    for idx, section_name in enumerate(planned_sections):
        print(f"\n[Section Detailer] Generating details for section {idx+1}/{len(planned_sections)}: '{section_name}'...")
        
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
            
        # Human-in-the-loop for this section
        print("\n" + "="*50)
        print(f"SECTION: {section_name.upper()}")
        print("-" * 50)
        print(current_description)
        print("="*50 + "\n")
        
        print("Do you approve this section description?")
        print("[1] Approve as-is")
        print("[2] Provide feedback / edits")
        
        choice = ""
        while choice not in ["1", "2"]:
            choice = input("Enter choice (1 or 2): ").strip()
            
        if choice == "1":
            print(f"\n[Section Identifier] '{section_name}' approved.")
        else:
            feedback = input("\nEnter your feedback/suggestions: ").strip()
            print(f"\n[Section Identifier] Re-generating '{section_name}' with feedback...")
            
            refine_messages = detailer_messages + [
                detail_response,
                HumanMessage(content=f"The user provided this feedback: '{feedback}'. Please update the description incorporating this feedback while adhering to the original rules. Output ONLY the updated description.")
            ]
            
            try:
                refined_response = detailer_llm.invoke(refine_messages)
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
        approved_sections.append({
            "id": idx + 1,
            "name": section_name,
            "description": current_description
        })

    return {
        "planned_sections": planned_sections,
        "sections": approved_sections,
        "current_section_index": len(approved_sections),
        "pipeline_status": "running"
    }


