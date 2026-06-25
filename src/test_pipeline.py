import unittest
from unittest.mock import patch
import sys
import os

# Add workspace to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.graph import build_graph
from src.state import GlobalState

class TestPipeline(unittest.TestCase):
    def setUp(self):
        self.graph = build_graph()

    def test_invalid_prompt(self):
        """Verify that non-UI prompts fail evaluation."""
        state = {
            "user_prompt": "What is the capital of Japan?",
            "input_evaluation": "fail",
            "input_evaluation_reason": "",
            "enhanced_prompt": "",
            "human_approved_prompt": False,
            "pipeline_status": "running"
        }
        res = self.graph.invoke(state)
        self.assertEqual(res["input_evaluation"], "fail")
        self.assertEqual(res["pipeline_status"], "failed")
        self.assertIn("does not appear to be related to UI", res["input_evaluation_reason"])

    @patch('builtins.input')
    def test_valid_prompt_approve_asis(self, mock_input):
        """Verify that UI prompt is enhanced and approved as-is."""
        # Mock choice '1' (approve as-is)
        mock_input.return_value = "1"
        
        state = {
            "user_prompt": "Build a modern landing page for a coffee shop with a dark theme.",
            "input_evaluation": "fail",
            "input_evaluation_reason": "",
            "enhanced_prompt": "",
            "human_approved_prompt": False,
            "pipeline_status": "running",
            "coded_sections": [],
            "final_html": "",
            "output_path": ""
        }
        res = self.graph.invoke(state)
        self.assertEqual(res["input_evaluation"], "pass")
        self.assertEqual(res["pipeline_status"], "complete")
        self.assertTrue(res["human_approved_prompt"])
        self.assertTrue(len(res["enhanced_prompt"]) > 0)
        # Ensure we didn't output questions in the final approved prompt
        self.assertNotIn("clarification_questions", res["enhanced_prompt"])

    @patch('builtins.input')
    def test_valid_prompt_with_feedback(self, mock_input):
        """Verify that UI prompt works when feedback is provided."""
        # Mock inputs: first choice '2' (edit), then feedback string, then '1' for sections
        mock_input.side_effect = ["2", "Make sure to emphasize the wood-roasted brewing method and use brown/gold colors.", "1", "1", "1", "1", "1"]
        
        state = {
            "user_prompt": "Build a modern landing page for a coffee shop with a dark theme.",
            "input_evaluation": "fail",
            "input_evaluation_reason": "",
            "enhanced_prompt": "",
            "human_approved_prompt": False,
            "pipeline_status": "running",
            "coded_sections": [],
            "final_html": "",
            "output_path": ""
        }
        res = self.graph.invoke(state)
        self.assertEqual(res["input_evaluation"], "pass")
        self.assertEqual(res["pipeline_status"], "complete")
        self.assertTrue(res["human_approved_prompt"])
        # The final prompt should contain elements of feedback or be successfully updated
        self.assertTrue(len(res["enhanced_prompt"]) > 0)


if __name__ == "__main__":
    unittest.main()
