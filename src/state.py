from typing import TypedDict, Literal, List, Optional

class SectionInfo(TypedDict):
    id: int
    name: str
    description: str
    cms: Optional[dict]

class SectionCode(TypedDict):
    """Output from the Coding Agent for a single section."""
    section_id: int           # Matches SectionInfo.id (positional order)
    section_name: str         # Human-readable name
    jsx: str                  # React JSX block for this section
    css: str                  # Scoped CSS for this section
    status: str               # "success" | "failed"
    error: Optional[str]      # Error message if failed

class GlobalState(TypedDict):
    project_id: str
    # --- Parts 1-4: Input Evaluation, Prompt Enhancement, Section Identification ---
    user_prompt: str
    input_evaluation: Literal["pass", "fail"]
    input_evaluation_reason: str
    enhanced_prompt: str
    human_approved_prompt: bool
    pipeline_status: Literal["running", "complete", "failed", "awaiting_human_response"]
    planned_sections: List[str]
    sections: List[SectionInfo]
    current_section_index: int
    current_section_name: str
    current_description: str
    failure_reason: str
    # --- Part 5 & 6: Section Coding Agent + Synthesizer ---
    coded_sections: List[SectionCode]        # Individual coded section outputs
    final_html: str                          # Assembled full-page HTML
    output_path: str                         # Path to saved index.html
