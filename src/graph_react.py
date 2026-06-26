from langgraph.graph import StateGraph, END
from src.state import GlobalState
from src.nodes.input_evaluator import evaluate_input
from src.nodes.prompt_enhancer import run_prompt_enhancer
from src.nodes.section_identifier import run_section_identifier
from src.nodes.section_coder_react import run_section_coder_react
from src.nodes.synthesizer_react import run_synthesizer_react

def route_evaluation(state: GlobalState):
    """
    Routes to prompt_enhancer or invalid_input based on input_evaluation value.
    """
    if state.get("input_evaluation") == "pass":
        return "prompt_enhancer"
    else:
        return "invalid_input"

def handle_invalid_input(state: GlobalState):
    """
    Terminal node when evaluation fails.
    """
    print(f"\n[System] Evaluation Failed!")
    print(f"Reason: {state.get('input_evaluation_reason')}\n")
    return {
        "pipeline_status": "failed",
        "failure_reason": state.get("input_evaluation_reason")
    }

def build_react_graph():
    """
    Builds and compiles the state graph for React components.
    """
    workflow = StateGraph(GlobalState)
    
    # Register nodes
    workflow.add_node("input_evaluator", evaluate_input)
    workflow.add_node("prompt_enhancer", run_prompt_enhancer)
    workflow.add_node("section_identifier", run_section_identifier)
    workflow.add_node("section_coder_react", run_section_coder_react)
    workflow.add_node("synthesizer_react", run_synthesizer_react)
    workflow.add_node("invalid_input", handle_invalid_input)
    
    # Set entry point
    workflow.set_entry_point("input_evaluator")
    
    # Add conditional route
    workflow.add_conditional_edges(
        "input_evaluator",
        route_evaluation,
        {
            "prompt_enhancer": "prompt_enhancer",
            "invalid_input": "invalid_input"
        }
    )
    
    # Set terminal edges
    workflow.add_edge("prompt_enhancer", "section_identifier")
    workflow.add_edge("section_identifier", "section_coder_react")
    workflow.add_edge("section_coder_react", "synthesizer_react")
    workflow.add_edge("synthesizer_react", END)
    workflow.add_edge("invalid_input", END)
    
    return workflow.compile()
