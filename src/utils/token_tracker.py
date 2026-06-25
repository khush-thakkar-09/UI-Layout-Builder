import os
from datetime import datetime

TRACKER_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "tracker.txt")

def log_token_usage(agent_name: str, response: any):
    """
    Extracts usage_metadata from an AIMessage and appends it to tracker.txt.
    """
    try:
        # Some structured outputs wrap the original message, or the message itself has usage_metadata
        # Try to find usage_metadata
        metadata = None
        if hasattr(response, "usage_metadata"):
            metadata = response.usage_metadata
        elif isinstance(response, dict) and "usage_metadata" in response:
            metadata = response["usage_metadata"]
            
        if metadata:
            input_tokens = metadata.get("input_tokens", 0)
            output_tokens = metadata.get("output_tokens", 0)
            total_tokens = metadata.get("total_tokens", 0)
            
            log_line = f"[{datetime.now().isoformat()}] {agent_name} | Input: {input_tokens} | Output: {output_tokens} | Total: {total_tokens}\n"
            
            with open(TRACKER_FILE, "a") as f:
                f.write(log_line)
    except Exception as e:
        # Silently fail if tracker has issues so we don't break the pipeline
        pass
