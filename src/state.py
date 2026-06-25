from typing import TypedDict, Literal

class GlobalState(TypedDict):
    user_prompt: str
    input_evaluation: Literal["pass", "fail"]
    input_evaluation_reason: str
    enhanced_prompt: str
    human_approved_prompt: bool
    pipeline_status: Literal["running", "complete", "failed", "awaiting_human_response"]
