import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables
load_dotenv()

def get_llm(temperature: float = 0.7, max_tokens: int = None) -> ChatGoogleGenerativeAI:
    """
    Initializes and returns the ChatGoogleGenerativeAI client.
    Uses credentials from environment variables.
    """
    model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    
    if not api_key:
        raise ValueError("GEMINI_API_KEY or GOOGLE_API_KEY environment variable is not set.")
    
    return ChatGoogleGenerativeAI(
        model=model_name,
        google_api_key=api_key,
        temperature=temperature,
        max_output_tokens=max_tokens,
    )
