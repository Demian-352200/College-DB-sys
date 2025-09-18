from typing import List

from autogen_core import (AgentId,
                          MessageContext,
                          message_handler,
                          )
from autogen_core.models import (AssistantMessage,
                                 )
from autogen_core.tools import Tool
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_ext.tools.mcp import StdioMcpToolAdapter

from .base import BaseAgent
from .messages import (
    UserRequest,
    AgentResponse,
    TOPICS,
)


class Commander(BaseAgent):
    def __init__(self,
                 description,
                 system_message: str,
                 model_client: OpenAIChatCompletionClient,
                 tools: List[Tool] | list[StdioMcpToolAdapter],
                 delegate_tools: List[Tool]) -> None:
        super().__init__(description,model_client, system_message, tools, delegate_tools)
