from typing import Dict, Any, List
from pydantic import BaseModel, Field
from langchain_core.messages import SystemMessage, HumanMessage
from src.state import GlobalState
from src.llm import get_llm
from src.prompts.prompt_enhancer_prompt import PROMPT_ENHANCER_SYSTEM_PROMPT
from src.utils.token_tracker import log_token_usage

class EnhancedPromptResult(BaseModel):
    enhanced_prompt: str = Field(description="Refined and concise description of the UI layout topic and theme (max 250 tokens).")
    clarification_questions: List[str] = Field(description="1-3 short clarification questions if the user request is ambiguous, otherwise empty list.")

def run_prompt_enhancer(state: GlobalState) -> Dict[str, Any]:
    """
    Enhances the user prompt using Gemini and handles CLI human-in-the-loop approval.
    """
    raw_prompt = state.get("user_prompt", "")
    print(f"\n[Prompt Enhancer] Enhancing raw prompt: '{raw_prompt}'...")
    
    # Initialize LLM with max 250 tokens
    llm = get_llm(temperature=0.3, max_tokens=250)
    structured_llm = llm.with_structured_output(EnhancedPromptResult)
    
    # First enhancement pass
    messages = [
        SystemMessage(content=PROMPT_ENHANCER_SYSTEM_PROMPT),
        HumanMessage(content=f"Raw user prompt: {raw_prompt}")
    ]
    
    try:
        # with_structured_output returns the parsed object if include_raw=False, which is default.
        # But we still try to get usage if it's attached or we can change it later if needed.
        response: EnhancedPromptResult = structured_llm.invoke(messages)
        log_token_usage("Prompt Enhancer Pass 1", response)
    except Exception as e:
        print(f"Error calling LLM for prompt enhancement: {e}")
        # Fallback in case of model issues
        response = EnhancedPromptResult(
            enhanced_prompt=f"UI layout request for: {raw_prompt}",
            clarification_questions=[]
        )
    
    enhanced = response.enhanced_prompt
    questions = response.clarification_questions
    
    print("\n" + "="*50)
    print("PROMPT ENHANCER SUGGESTION:")
    print("-"*50)
    print(enhanced)
    if questions:
        print("-"*50)
        print("CLARIFICATION QUESTIONS:")
        for q in questions:
            print(f"- {q}")
    print("="*50 + "\n")
    
    # LangGraph Native Human-in-the-Loop Interrupt
    from langgraph.types import interrupt
    
    human_response = interrupt({
        "type": "prompt_approval",
        "enhanced_prompt": enhanced,
        "questions": questions
    })
    
    choice = human_response.get("choice")
    feedback = human_response.get("feedback", "")
    
    if choice == "1":
        print("\n[Prompt Enhancer] Prompt approved as-is.")
        return {
            "enhanced_prompt": enhanced,
            "human_approved_prompt": True,
            "pipeline_status": "running"
        }
    else:
        print(f"\n[Prompt Enhancer] Re-enhancing prompt with feedback: '{feedback}'...")
        
        # Second pass: merge feedback into a single final prompt
        merge_messages = [
            SystemMessage(content=(
                "You are a prompt consolidator. Combine the initial raw prompt, the enhanced recommendation, "
                "and the human feedback/clarifications into a final, unified, and concise UI layout description (max 250 tokens). "
                "Do NOT include any questions in the output. "
                "Do NOT identify specific layout sections, HTML elements, or components. "
                "Focus strictly on the layout topic, brand identity, visual style, theme, color palettes, and overall design goals."
            )),
            HumanMessage(content=(
                f"Initial Prompt: {raw_prompt}\n"
                f"Enhanced Recommendation: {enhanced}\n"
                f"Human Feedback: {feedback}"
            ))
        ]
        
        try:
            # We can use standard LLM invocation for this text consolidation
            second_response = llm.invoke(merge_messages)
            log_token_usage("Prompt Enhancer Pass 2", second_response)
            content = second_response.content
            if isinstance(content, list):
                parts = []
                for part in content:
                    if isinstance(part, str):
                        parts.append(part)
                    elif isinstance(part, dict) and "text" in part:
                        parts.append(part["text"])
                    else:
                        parts.append(str(part))
                final_prompt = "".join(parts).strip()
            else:
                final_prompt = content.strip()
        except Exception as e:
            print(f"Error during prompt consolidation: {e}")
            final_prompt = f"{enhanced} (Feedback: {feedback})"
            
        print("\n" + "="*50)
        print("FINAL ENHANCED PROMPT:")
        print("-"*50)
        print(final_prompt)
        print("="*50 + "\n")
        
        return {
            "enhanced_prompt": final_prompt,
            "human_approved_prompt": True,
            "pipeline_status": "running"
        }
