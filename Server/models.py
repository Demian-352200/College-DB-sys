from autogen_ext.models.openai import OpenAIChatCompletionClient
import os
import json
with open('config.json','r',encoding='utf-8') as f:
    config=json.load(f)
def get_model_client() -> OpenAIChatCompletionClient:  # type: ignore
    return OpenAIChatCompletionClient(
        model=config['model']['name'],
        api_key= config['model']['API_KEY'] ,
        base_url=config['model']['base_url'],
        model_info={
            "json_output": True,
            "vision": True,
            "function_calling": True,
            "structured_output":True,
            "family":"unknown"
        },
    )

model=get_model_client()