from .base import (
    BaseMessage,
    USER_TOPIC_TYPE,
    RESPONSE_TOPIC_TYPE,
    user_topic_id,
    response_topic_id,
    TOPICS
)
from .user import UserRequest,AgentResponse

# 所有消息类型的列表
MESSAGES = [
    UserRequest,
    AgentResponse,
]
__all__ = [
    'BaseMessage',
    'USER_TOPIC_TYPE',
    'RESPONSE_TOPIC_TYPE',
    'user_topic_id',
    'response_topic_id',
    'TOPICS',
    'UserRequest',
    'AgentResponse',
    'MESSAGES'
]


