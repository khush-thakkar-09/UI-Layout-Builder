import os
import json
import requests
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain_core.messages import AIMessage, SystemMessage
import re

# Load environment variables
load_dotenv()

class ChatQwen:
    """
    LangChain compatible wrapper for invoking Qwen.
    """
    def __init__(self, temperature: float = 0.2, max_tokens: int = None):
        self.temperature = temperature
        self.max_tokens = max_tokens or 8192

    def invoke(self, messages: list, **kwargs) -> AIMessage:
        res = invoke_qwen(messages, temperature=self.temperature, max_tokens=self.max_tokens)
        ai_msg = AIMessage(content=res.content)
        ai_msg.usage_metadata = res.usage_metadata
        return ai_msg

    def with_structured_output(self, schema):
        return StructuredQwen(self, schema)

class StructuredQwen:
    def __init__(self, chat_model: ChatQwen, schema):
        self.chat_model = chat_model
        self.schema = schema

    def invoke(self, messages: list, **kwargs):
        # Handle both Pydantic v1 & v2 schemas
        if hasattr(self.schema, "schema"):
            schema_json = json.dumps(self.schema.schema(), indent=2)
        else:
            schema_json = json.dumps(self.schema.model_json_schema(), indent=2)
            
        system_instructions = f"\n\nYou MUST respond with a single JSON block matching this JSON schema:\n{schema_json}\nReturn ONLY the JSON and nothing else."
        
        new_messages = []
        has_system = False
        for msg in messages:
            if isinstance(msg, SystemMessage) or (hasattr(msg, 'type') and msg.type == 'system'):
                new_messages.append(SystemMessage(content=msg.content + system_instructions))
                has_system = True
            else:
                new_messages.append(msg)
        if not has_system:
            new_messages.insert(0, SystemMessage(content=system_instructions))
            
        res_message = self.chat_model.invoke(new_messages)
        content = res_message.content.strip()
        
        json_match = re.search(r'```json\s*\n(.*?)```', content, re.DOTALL)
        if json_match:
            content = json_match.group(1).strip()
        else:
            code_match = re.search(r'```\s*\n(.*?)```', content, re.DOTALL)
            if code_match:
                content = code_match.group(1).strip()
        
        content = content.replace("```json", "").replace("```", "").strip()
        
        try:
            parsed_data = json.loads(content)
        except Exception:
            parsed_data = {}
            
        pydantic_res = self.schema(**parsed_data)
        object.__setattr__(pydantic_res, "usage_metadata", res_message.usage_metadata)
        return pydantic_res

def get_llm(temperature: float = 0.7, max_tokens: int = None) -> ChatQwen:
    """
    Initializes and returns the ChatQwen client wrapper.
    Uses credentials from environment variables.
    """
    api_key = os.getenv("QWEN_API_KEY")
    if not api_key:
        raise ValueError("QWEN_API_KEY environment variable is not set.")
    return ChatQwen(temperature=temperature, max_tokens=max_tokens)

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
