import os
import json
import requests
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain_core.messages import AIMessage

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

def get_openrouter_llm(model_name: str = None, temperature: float = 0.7, max_tokens: int = None, timeout: float = 60.0) -> ChatOpenAI:
    """
    Initializes and returns the ChatOpenAI client configured for OpenRouter.
    Uses OPENROUTER_API_KEY from environment variables.
    """
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY environment variable is not set.")
        
    if not model_name:
        model_name = os.getenv("OPENROUTER_MODEL", "nvidia/nemotron-3-ultra-550b-a55b:free")
        
    return ChatOpenAI(
        model=model_name,
        openai_api_key=api_key,
        openai_api_base="https://openrouter.ai/api/v1",
        temperature=temperature,
        max_tokens=max_tokens,
        timeout=timeout,
    )


class QwenBedrockResponse:
    """
    Wraps the raw Bedrock HTTP response to be compatible with LangChain's
    AIMessage interface and our token_tracker utility.
    """
    def __init__(self, content: str, usage: dict = None):
        self.content = content
        self.usage_metadata = {
            "input_tokens": usage.get("prompt_tokens", 0) if usage else 0,
            "output_tokens": usage.get("completion_tokens", 0) if usage else 0,
            "total_tokens": usage.get("total_tokens", 0) if usage else 0,
        }


def invoke_qwen(messages: list, temperature: float = 0.2, max_tokens: int = 8192, timeout: float = 120.0) -> QwenBedrockResponse:
    """
    Calls the Qwen model on Bedrock directly via HTTP.
    
    The Bedrock endpoint uses a custom URL structure (/model/{id}/invoke)
    rather than OpenAI's /v1/chat/completions, so we use requests directly.
    
    Args:
        messages: List of LangChain message objects (SystemMessage, HumanMessage, etc.)
        temperature: Sampling temperature
        max_tokens: Maximum output tokens
        timeout: Request timeout in seconds
        
    Returns:
        QwenBedrockResponse with .content and .usage_metadata attributes
    """
    api_key = os.getenv("QWEN_API_KEY")
    if not api_key:
        raise ValueError("QWEN_API_KEY environment variable is not set.")
    
    model_name = os.getenv("QWEN_MODEL", "qwen.qwen3-coder-next")
    base_url = "https://bedrock-runtime.us-east-1.amazonaws.com"
    url = f"{base_url}/model/{model_name}/invoke"
    
    # Convert LangChain messages to OpenAI format
    formatted_messages = []
    for msg in messages:
        if hasattr(msg, 'type'):
            # LangChain message object
            role_map = {"human": "user", "ai": "assistant", "system": "system"}
            role = role_map.get(msg.type, msg.type)
        else:
            role = msg.get("role", "user")
        
        content = msg.content if hasattr(msg, 'content') else msg.get("content", "")
        # Handle list content (Gemini-style response content)
        if isinstance(content, list):
            parts = []
            for part in content:
                if isinstance(part, str):
                    parts.append(part)
                elif isinstance(part, dict) and "text" in part:
                    parts.append(part["text"])
                elif hasattr(part, "text"):
                    parts.append(getattr(part, "text"))
                else:
                    parts.append(str(part))
            content = "".join(parts)
        
        formatted_messages.append({"role": role, "content": content})
    
    payload = {
        "messages": formatted_messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
    }
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    }
    
    response = requests.post(url, headers=headers, json=payload, timeout=timeout)
    
    if response.status_code != 200:
        raise RuntimeError(
            f"Qwen Bedrock API error (HTTP {response.status_code}): {response.text}"
        )
    
    data = response.json()
    
    # Extract content from OpenAI-style response
    content = ""
    if "choices" in data and len(data["choices"]) > 0:
        content = data["choices"][0].get("message", {}).get("content", "")
    elif "output" in data:
        # Some Bedrock endpoints use "output" key
        content = data["output"]
    elif "content" in data:
        content = data["content"]
    
    usage = data.get("usage", {})
    
    return QwenBedrockResponse(content=content, usage=usage)
