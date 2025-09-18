from pydantic import BaseModel
from typing import List,Optional
from autogen_core.models import LLMMessage
from .base import BaseMessage,RESPONSE_TOPIC_TYPE


class UserLogin(BaseMessage):
    """用户登录消息"""
    context: List[LLMMessage]

class UserRequest(BaseMessage):
    """用户请求消息""" 
    context: List[LLMMessage]

class AgentResponse(BaseMessage):
    """智能体响应消息"""
    context: List[LLMMessage]
