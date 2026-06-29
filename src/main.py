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

def main():
    load_dotenv()
    
    # Check if keys are loaded
    api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
    if not api_key:
        print(f"{RED}{BOLD}Error:{RESET} Google/Gemini API key is not configured in .env!")
        print("Please configure GOOGLE_API_KEY or GEMINI_API_KEY first.\n")
        sys.exit(1)
        
    print_header()
    graph = build_graph()
    
    try:
        while True:
            print(f"{BOLD}Step 1: Enter your layout request{RESET}")
            prompt = input(f"{BLUE}Prompt (or 'exit' to quit):{RESET} ").strip()
            
            if not prompt:
                continue
            if prompt.lower() in ["exit", "quit"]:
                print(f"\n{GREEN}Thank you for using UI Layout Builder! Goodbye!{RESET}\n")
                break
                
            print(f"\n{YELLOW}Evaluating prompt and running pipeline...{RESET}")
            
            # Initialize State
            initial_state = {
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
            
            # Execute the Graph
            final_state = graph.invoke(initial_state)
            
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
                    print(f"  CSS Stylesheet:       [index.css](file://{os.path.join(react_dir, 'App.css')})")
                    print(f"  CMS JSON Dataset:     [cms_data.json](file://{os.path.join(react_dir, 'cms_data.json')})")
                
            print(f"{CYAN}{BOLD}" + "-"*60 + f"{RESET}\n")
            
            input("Press Enter to continue...")
            print_header()

            
    except KeyboardInterrupt:
        print(f"\n\n{GREEN}Exited by user. Goodbye!{RESET}\n")

if __name__ == "__main__":
    main()
