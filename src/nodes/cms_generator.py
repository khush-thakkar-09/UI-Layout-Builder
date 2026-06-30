import re
import json
from typing import Dict, Any, List
from langchain_core.messages import SystemMessage, HumanMessage
from src.state import GlobalState, SectionInfo
from src.llm import get_llm
from src.prompts.cms_generator_prompt import CMS_GENERATOR_SYSTEM_PROMPT
from src.utils.token_tracker import log_token_usage
from src.nodes.section_identifier import extract_content_text


def parse_json_block(response_text: str) -> dict:
    """
    Extracts and parses a JSON code block from the model's response.
    """
    # Try to find ```json ... ``` block
    json_match = re.search(r'```json\s*\n(.*?)```', response_text, re.DOTALL)
    if json_match:
        content = json_match.group(1).strip()
    else:
        # Fallback: check generic code block
        code_match = re.search(r'```\s*\n(.*?)```', response_text, re.DOTALL)
        if code_match:
            content = code_match.group(1).strip()
        else:
            # Last fallback: clean text
            content = response_text.strip()

    # Clean up JSON formatting artifacts if present
    content = content.replace("```json", "").replace("```", "").strip()
    
    return json.loads(content)


def generate_cms_for_single_section(
    section_info: dict,
    previous_sections: List[dict],
    project_name: str,
    page_name: str = "home"
) -> dict:
    """
    Generates the CMS JSON schema for a single section.
    """
    section_id = section_info["id"]
    section_name = section_info["name"]
    section_description = section_info["description"]
    
    print(f"  [CMS Generator] Generating CMS configuration for section {section_id}: '{section_name}'...")
    
    # 1. Build context of previous sections to avoid name/index collisions
    prev_summary_items = []
    for prev in previous_sections:
        if prev.get("cms"):
            meta = prev["cms"].get("metadata", {})
            elements = prev["cms"].get("elements", [])
            elem_names = [e.get("elementName") for e in elements if e.get("elementName")]
            prev_summary_items.append(
                f"- Section ID {meta.get('sectionId')} ('{meta.get('sectionName')}'): "
                f"Index={meta.get('index')}, ElementNames={elem_names}"
            )
            
    if not prev_summary_items:
        previous_cms_summary = "None (this is the first section)."
    else:
        previous_cms_summary = "\n".join(prev_summary_items)

    # 2. Initialize Gemini LLM (using low temperature for strict schema adherence)
    llm = get_llm(temperature=0.2)
    
    # 3. Format the prompts
    system_prompt = CMS_GENERATOR_SYSTEM_PROMPT.format(
        project_name=project_name,
        page_name=page_name,
        previous_cms_summary=previous_cms_summary,
        section_name=section_name,
        section_description=section_description
    )
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content="Generate the CMS JSON matching the exact schema requirements.")
    ]
    
    try:
        response = llm.invoke(messages)
        log_token_usage(f"CMS Generator ({section_name})", response)
        
        response_text = extract_content_text(response.content)
        cms_dict = parse_json_block(response_text)
        
        # 4. Strict validation and formatting checks
        metadata = cms_dict.get("metadata", {})
        elements = cms_dict.get("elements", [])
        
        # Ensure metadata values exist
        metadata["sectionName"] = section_name
        metadata["pageName"] = page_name
        
        # Ensure section index is correct and sequential
        planned_index = section_id # Default sequential order matching section planning ID
        if previous_sections:
            prev_indexes = [
                p["cms"]["metadata"].get("index", 0) 
                for p in previous_sections if p.get("cms") and "metadata" in p["cms"]
            ]
            max_prev = max(prev_indexes) if prev_indexes else 0
            metadata["index"] = max(max_prev + 1, planned_index)
        else:
            metadata["index"] = planned_index
            
        # propagate generated section ID to all elements
        import uuid
        section_id_val = str(uuid.uuid4())
        metadata["sectionId"] = section_id_val
        
        for elem in elements:
            elem["sectionId"] = section_id_val
            elem["section"] = section_name
            elem["projectName"] = project_name
            elem["pageName"] = page_name
            
            # Ensure globally unique fieldId
            elem["fieldId"] = str(uuid.uuid4())
            
            # Ensure globally unique fieldId inside loop arrays
            if "loop" in elem and isinstance(elem["loop"], list):
                for item in elem["loop"]:
                    for i in range(1, 11):
                        field_id_key = f"fieldId{i}"
                        if field_id_key in item:
                            item[field_id_key] = str(uuid.uuid4())
            
        cms_dict["metadata"] = metadata
        cms_dict["elements"] = elements
        
        print(f"  [CMS Generator] ✓ CMS generated successfully for section {section_id}")
        return cms_dict
        
    except Exception as e:
        error_msg = str(e)
        print(f"  [CMS Generator] ✗ CMS generation FAILED for section {section_id}: {error_msg}")
        # Fallback baseline CMS schema if model fails to parse or generate
        import uuid
        fallback_sec_id = str(uuid.uuid4())
        fallback_cms = {
            "metadata": {
                "sectionId": fallback_sec_id,
                "sectionName": section_name,
                "sectionStatus": "Active",
                "variations": 1,
                "sectionType": "",
                "path": f"/client/{project_name}/{section_name.replace(' ', '')}/Variation1",
                "isAiGenerated": True,
                "pageName": page_name,
                "index": section_id
            },
            "elements": [
                {
                    "sectionId": fallback_sec_id,
                    "elementName": f"{section_name.lower().replace(' ', '')}Title",
                    "fieldId": str(uuid.uuid4()),
                    "content": section_name,
                    "contentType": "Text",
                    "section": section_name,
                    "projectName": project_name,
                    "pageName": page_name,
                    "isCustom": True,
                    "isCustomEdit": True
                }
            ]
        }
        return fallback_cms
