import os
import re
from typing import Dict, Any
from src.state import GlobalState

def run_synthesizer_react(state: GlobalState) -> Dict[str, Any]:
    """
    LangGraph node: Combines JSX code from all coded sections into a single react component programmatically.
    Writes the final file to output/output_react.jsx.
    """
    coded_sections = state.get("coded_sections", [])
    user_prompt = state.get("user_prompt", "AI Generated React Page")
    
    if not coded_sections:
        print("\n[React Synthesizer] No coded sections to synthesize!")
        return {
            "pipeline_status": "failed",
            "failure_reason": "No coded sections found to synthesize",
        }
        
    print("\n[React Synthesizer] Compiling and synthesizing React code blocks programmatically...")
    
    # Filter to only successfully coded sections
    successful_sections = [s for s in coded_sections if s["status"] == "success"]
    
    if not successful_sections:
        return {
            "pipeline_status": "failed",
            "failure_reason": "All sections failed to code",
        }
        
    # We build the final JSX string starting with react imports
    final_jsx_lines = [
        "import React, { useState, useEffect, useRef } from 'react';",
        "",
        "// === Generated Section Components ===",
        ""
    ]
    
    # List of component names to mount inside App
    sections_to_mount = []
    
    for sec in successful_sections:
        sec_id = sec["section_id"]
        sec_jsx = sec["jsx"]
        
        # Clean any import statements the model might have outputted despite instructions
        clean_jsx_lines = []
        for line in sec_jsx.split("\n"):
            if re.match(r'^\s*import\s+', line, re.IGNORECASE):
                continue
            clean_jsx_lines.append(line)
        
        clean_jsx = "\n".join(clean_jsx_lines).strip()
        
        final_jsx_lines.append(f"// --- Section {sec_id}: {sec['section_name']} ---")
        final_jsx_lines.append(clean_jsx)
        final_jsx_lines.append("")
        
        sections_to_mount.append(f"Section{sec_id}")
        
    # Build default exported App component wrapper
    app_wrapper_lines = [
        "// === Main App Component ===",
        "export default function App() {",
        "  return (",
        "    <div className=\"bg-slate-950 text-slate-100 min-h-screen selection:bg-cyan-500/30 selection:text-cyan-200\">",
    ]
    
    for comp in sections_to_mount:
        app_wrapper_lines.append(f"      <{comp} />")
        
    app_wrapper_lines.extend([
        "    </div>",
        "  );",
        "}"
    ])
    
    final_jsx_lines.extend(app_wrapper_lines)
    final_jsx = "\n".join(final_jsx_lines)
    
    # Ensure the output directory exists
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "output")
    os.makedirs(output_dir, exist_ok=True)
    
    output_file = os.path.join(output_dir, "output_react.jsx")
    
    try:
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(final_jsx)
        print(f"[React Synthesizer] ✓ Final React page successfully written to: {output_file}")
    except Exception as e:
        print(f"[React Synthesizer] ✗ Failed to write file: {e}")
        return {
            "pipeline_status": "failed",
            "failure_reason": f"Writing synthesized react file failed: {e}",
        }
        
    return {
        "final_jsx": final_jsx,
        "output_path": output_file,
        "pipeline_status": "complete",
    }
