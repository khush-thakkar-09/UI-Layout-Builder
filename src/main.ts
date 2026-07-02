import readline from "node:readline";
import dotenv from "dotenv";
import { buildGraph } from "./graph.js";
import { MemorySaver } from "@langchain/langgraph";
import { Command } from "@langchain/langgraph";

dotenv.config();

// ANSI colors for premium terminal styling
const BLUE = "\x1b[94m";
const GREEN = "\x1b[92m";
const YELLOW = "\x1b[93m";
const RED = "\x1b[91m";
const CYAN = "\x1b[96m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

function printHeader() {
  console.clear();
  console.log(`${CYAN}${BOLD}` + "=".repeat(60));
  console.log("      ✨ UI LAYOUT BUILDER — PROMPT PIPELINE (NODE)      ");
  console.log("=".repeat(60) + `${RESET}\n`);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

async function main() {
  const apiKey = process.env.QWEN_API_KEY;
  if (!apiKey) {
    console.error(`${RED}${BOLD}Error:${RESET} Qwen API key (QWEN_API_KEY) is not configured in .env!`);
    process.exit(1);
  }

  printHeader();

  const checkpointer = new MemorySaver();
  const graph = buildGraph(checkpointer);

  try {
    while (true) {
      console.log(`${BOLD}Step 1: Enter your layout request${RESET}`);
      const prompt = (await askQuestion(`${BLUE}Prompt (or 'exit' to quit):${RESET} `)).trim();

      if (!prompt) {
        continue;
      }
      if (prompt.toLowerCase() === "exit" || prompt.toLowerCase() === "quit") {
        console.log(`\n${GREEN}Thank you for using UI Layout Builder! Goodbye!${RESET}\n`);
        rl.close();
        break;
      }

      console.log(`\n${YELLOW}Evaluating prompt and running pipeline...${RESET}`);

      const runUuid = crypto.randomUUID();
      const initialConfig = { configurable: { thread_id: runUuid } };

      const initialState = {
        project_id: runUuid,
        user_prompt: prompt,
        input_evaluation: "fail" as const,
        input_evaluation_reason: "",
        enhanced_prompt: "",
        human_approved_prompt: false,
        pipeline_status: "running" as const,
        failure_reason: "",
        coded_sections: [],
        final_html: "",
        output_path: "",
      };

      console.log(`[${CYAN}Checkpointing${RESET}] Thread ID: ${runUuid}`);

      // Execute graph with config
      await graph.invoke(initialState, initialConfig);

      // Loop for interrupts/actions
      while (true) {
        const stateInfo = await graph.getState(initialConfig);
        if (!stateInfo.next || stateInfo.next.length === 0) {
          break;
        }

        const pendingTasks = stateInfo.tasks;
        if (pendingTasks && pendingTasks.length > 0 && pendingTasks[0].interrupts && pendingTasks[0].interrupts.length > 0) {
          const intr = pendingTasks[0].interrupts[0];
          const intrVal = intr.value as any;

          if (intrVal?.type === "prompt_approval") {
            console.log("\n" + "=".repeat(50));
            console.log("PROMPT ENHANCER SUGGESTION (Interrupt):");
            console.log("-".repeat(50));
            console.log(intrVal.enhanced_prompt);
            const questions = intrVal.questions || [];
            if (questions.length > 0) {
              console.log("-".repeat(50));
              console.log("CLARIFICATION QUESTIONS:");
              for (const q of questions) {
                console.log(`- ${q}`);
              }
            }
            console.log("=".repeat(50) + "\n");

            console.log("Do you approve this enhanced prompt?");
            console.log("[1] Approve as-is");
            console.log("[2] Provide feedback / answers to questions / edits");

            let choice = "";
            while (choice !== "1" && choice !== "2") {
              choice = (await askQuestion("Enter choice (1 or 2): ")).trim();
            }

            let resumeVal;
            if (choice === "1") {
              resumeVal = { choice: "1", feedback: "" };
            } else {
              const feedback = (await askQuestion("\nEnter your feedback/suggestions/answers: ")).trim();
              resumeVal = { choice: "2", feedback };
            }

            await graph.invoke(new Command({ resume: resumeVal }), initialConfig);
          } else if (intrVal?.type === "section_approval") {
            const sectionName = intrVal.section_name;
            const description = intrVal.description;

            console.log("\n" + "=".repeat(50));
            console.log(`SECTION: ${sectionName.toUpperCase()} (Interrupt)`);
            console.log("-".repeat(50));
            console.log(description);
            console.log("=".repeat(50) + "\n");

            console.log("Do you approve this section description?");
            console.log("[1] Approve as-is");
            console.log("[2] Provide feedback / edits");

            let choice = "";
            while (choice !== "1" && choice !== "2") {
              choice = (await askQuestion("Enter choice (1 or 2): ")).trim();
            }

            let resumeVal;
            if (choice === "1") {
              resumeVal = { choice: "1", feedback: "" };
            } else {
              const feedback = (await askQuestion("\nEnter your feedback/suggestions: ")).trim();
              resumeVal = { choice: "2", feedback };
            }

            await graph.invoke(new Command({ resume: resumeVal }), initialConfig);
          }
        } else {
          break;
        }
      }

      // Print Pipeline Summary
      const finalStateInfo = await graph.getState(initialConfig);
      const finalState = finalStateInfo.values as any;

      console.log(`\n${CYAN}${BOLD}` + "-".repeat(60) + `${RESET}`);
      console.log(`${BOLD}PIPELINE RUN SUMMARY:${RESET}`);
      console.log(
        `Status: ${
          finalState.pipeline_status === "complete" ? GREEN : RED
        }${finalState.pipeline_status.toUpperCase()}${RESET}`
      );

      if (finalState.pipeline_status === "failed") {
        const reason = finalState.failure_reason || finalState.input_evaluation_reason;
        console.log(`Reason: ${RED}${reason}${RESET}`);
      } else {
        console.log(`\n${BOLD}Final Approved Enhanced Prompt:${RESET}`);
        console.log(`${GREEN}${finalState.enhanced_prompt}${RESET}\n`);

        const sections = finalState.sections || [];
        const codedSections = finalState.coded_sections || [];

        if (sections.length > 0) {
          console.log(`${BOLD}Generated & Coded Sections (${sections.length}):${RESET}`);
          for (const s of sections) {
            const codedInfo = codedSections.find((cs: any) => cs.section_id === s.id);
            const statusStr =
              codedInfo && codedInfo.status === "success"
                ? `${GREEN}Coded Successfully${RESET}`
                : `${RED}Coding Failed${RESET}`;
            console.log(`  ${CYAN}✓ [${s.id}] ${s.name}${RESET} — ${statusStr}`);
            const desc = s.description.replace(/\n/g, " ");
            const snippet = desc.length > 100 ? desc.substring(0, 100) + "..." : desc;
            console.log(`    ${snippet}`);
          }
        }

        if (finalState.output_path) {
          console.log(`\n${GREEN}${BOLD}✓ React + CMS layout integrated into local project!${RESET}`);
          console.log(`  Output JSX File:    ${finalState.output_path}`);
        }
      }

      console.log(`${CYAN}${BOLD}` + "-".repeat(60) + `${RESET}\n`);
      await askQuestion("Press Enter to continue...");
      printHeader();
    }
  } catch (err: any) {
    console.error("Error running pipeline:", err);
    rl.close();
  }
}

main();
