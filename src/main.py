import sys
import os
from dotenv import load_dotenv

# Add workspace to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.graph import build_graph

# ANSI colors for premium terminal styling
BLUE = "\033[94m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"

def print_header():
    os.system('clear' if os.name == 'posix' else 'cls')
    print(f"{CYAN}{BOLD}" + "="*60)
    print("      ✨ UI LAYOUT BUILDER — PROMPT PIPELINE (1-6) ✨      ")
    print("="*60 + f"{RESET}\n")

import uuid
from langgraph.checkpoint.mongodb import MongoDBSaver

def main():
    load_dotenv()
    
    # Check if keys are loaded
    api_key = os.getenv("QWEN_API_KEY")
    if not api_key:
        print(f"{RED}{BOLD}Error:{RESET} QWEN_API_KEY is not configured in .env!")
        print("Please configure QWEN_API_KEY first.\n")
        sys.exit(1)
        
    mongodb_uri = os.getenv("MONGODB_URI")
    if not mongodb_uri:
        print(f"{RED}{BOLD}Error:{RESET} MONGODB_URI is not configured in .env!")
        sys.exit(1)
        
    print_header()
    
    try:
        with MongoDBSaver.from_conn_string(mongodb_uri, db_name="UI-Layout-DB") as checkpointer:
            graph = build_graph(checkpointer=checkpointer)
            
            while True:
                print(f"{BOLD}Step 1: Enter your layout request{RESET}")
                prompt = input(f"{BLUE}Prompt (or 'exit' to quit):{RESET} ").strip()
                
                if not prompt:
                    continue
                if prompt.lower() in ["exit", "quit"]:
                    print(f"\n{GREEN}Thank you for using UI Layout Builder! Goodbye!{RESET}\n")
                    break
                    
                print(f"\n{YELLOW}Evaluating prompt and running pipeline...{RESET}")
                
                # Generate a run UUID for thread configuration and project identification
                run_uuid = str(uuid.uuid4())
                
                # Initialize State
                initial_state = {
                    "project_id": run_uuid,
                    "user_prompt": prompt,
                    "input_evaluation": "fail",
                    "input_evaluation_reason": "",
                    "enhanced_prompt": "",
                    "human_approved_prompt": False,
                    "pipeline_status": "running",
                    "failure_reason": "",
                    "coded_sections": [],
                    "final_html": "",
                    "output_path": ""
                }
                
                config = {"configurable": {"thread_id": run_uuid}}
                print(f"[{CYAN}Checkpointing{RESET}] Thread ID: {run_uuid}")
                
                # Execute the Graph with config
                graph.invoke(initial_state, config=config)
                
                # Check for interrupts and process them until complete
                while True:
                    state_info = graph.get_state(config)
                    if not state_info.next:
                        final_state = state_info.values
                        break
                        
                    pending_tasks = state_info.tasks
                    if pending_tasks and pending_tasks[0].interrupts:
                        intr = pending_tasks[0].interrupts[0]
                        intr_val = intr.value
                        
                        if intr_val.get("type") == "prompt_approval":
                            print("\n" + "="*50)
                            print("PROMPT ENHANCER SUGGESTION (Interrupt):")
                            print("-"*50)
                            print(intr_val.get("enhanced_prompt"))
                            questions = intr_val.get("questions", [])
                            if questions:
                                print("-"*50)
                                print("CLARIFICATION QUESTIONS:")
                                for q in questions:
                                    print(f"- {q}")
                            print("="*50 + "\n")
                            
                            print("Do you approve this enhanced prompt?")
                            print("[1] Approve as-is")
                            print("[2] Provide feedback / answers to questions / edits")
                            
                            choice = ""
                            while choice not in ["1", "2"]:
                                choice = input("Enter choice (1 or 2): ").strip()
                                
                            if choice == "1":
                                resume_val = {"choice": "1", "feedback": ""}
                            else:
                                feedback = input("\nEnter your feedback/suggestions/answers: ").strip()
                                resume_val = {"choice": "2", "feedback": feedback}
                                
                            from langgraph.types import Command
                            graph.invoke(Command(resume=resume_val), config=config)
                            
                        elif intr_val.get("type") == "section_approval":
                            section_name = intr_val.get("section_name")
                            description = intr_val.get("description")
                            
                            print("\n" + "="*50)
                            print(f"SECTION: {section_name.upper()} (Interrupt)")
                            print("-" * 50)
                            print(description)
                            print("="*50 + "\n")
                            
                            print("Do you approve this section description?")
                            print("[1] Approve as-is")
                            print("[2] Provide feedback / edits")
                            
                            choice = ""
                            while choice not in ["1", "2"]:
                                choice = input("Enter choice (1 or 2): ").strip()
                                
                            if choice == "1":
                                resume_val = {"choice": "1", "feedback": ""}
                            else:
                                feedback = input("\nEnter your feedback/suggestions: ").strip()
                                resume_val = {"choice": "2", "feedback": feedback}
                                
                            from langgraph.types import Command
                            graph.invoke(Command(resume=resume_val), config=config)
                    else:
                        # Fallback if next is set but task list is empty
                        final_state = state_info.values
                        break
                
                # Print Pipeline Summary
                print(f"\n{CYAN}{BOLD}" + "-"*60 + f"{RESET}")
                print(f"{BOLD}PIPELINE RUN SUMMARY:{RESET}")
                print(f"Status: {GREEN if final_state.get('pipeline_status') == 'complete' else RED}{final_state.get('pipeline_status').upper()}{RESET}")
                
                if final_state.get("pipeline_status") == "failed":
                    reason = final_state.get("failure_reason") or final_state.get("input_evaluation_reason")
                    print(f"Reason: {RED}{reason}{RESET}")
                else:
                    print(f"\n{BOLD}Final Approved Enhanced Prompt:{RESET}")
                    print(f"{GREEN}{final_state.get('enhanced_prompt')}{RESET}\n")
                    
                    sections = final_state.get('sections', [])
                    coded_sections = final_state.get('coded_sections', [])
                    
                    if sections:
                        print(f"{BOLD}Generated & Coded Sections ({len(sections)}):{RESET}")
                        for s in sections:
                            coded_info = next((cs for cs in coded_sections if cs["section_id"] == s["id"]), None)
                            status_str = f"{GREEN}Coded Successfully{RESET}" if (coded_info and coded_info["status"] == "success") else f"{RED}Coding Failed{RESET}"
                            print(f"  {CYAN}✓ [{s['id']}] {s['name']}{RESET} — {status_str}")
                            # Print a snippet of the description
                            desc = s['description'].replace('\n', ' ')
                            snippet = (desc[:100] + '...') if len(desc) > 100 else desc
                            print(f"    {snippet}")
                    
                    if final_state.get("output_path"):
                        out_path = final_state.get("output_path")
                        out_dir = os.path.dirname(out_path)
                        print(f"\n{GREEN}{BOLD}✓ React + CMS layout integrated into local project!{RESET}")
                        react_dir = os.path.join(os.path.dirname(out_dir), 'testing_react', 'src')
                        print(f"  Vite App Entry:       [App.jsx](file://{os.path.join(react_dir, 'App.jsx')})")
                        print(f"  CSS Stylesheet:       [index.css](file://{os.path.join(react_dir, 'index.css')})")
                        print(f"  CMS JSON Dataset:     [cms_data.json](file://{os.path.join(react_dir, 'cms_data.json')})")
                    
                print(f"{CYAN}{BOLD}" + "-"*60 + f"{RESET}\n")
                
                input("Press Enter to continue...")
                print_header()
                
    except KeyboardInterrupt:
        print(f"\n\n{GREEN}Exited by user. Goodbye!{RESET}\n")

if __name__ == "__main__":
    main()
