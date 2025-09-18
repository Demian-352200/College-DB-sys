from pydantic import BaseModel
from autogen_core import TopicId

class BaseMessage(BaseModel):
    """所有消息的基类"""
    pass


# 主题ID定义
USER_TOPIC_TYPE = "User"
RESPONSE_TOPIC_TYPE= "Response"

user_topic_id = TopicId(type=USER_TOPIC_TYPE, source="default")
response_topic_id = TopicId(type=RESPONSE_TOPIC_TYPE, source="default")

TOPICS = {
    "user_topic_id": user_topic_id,
    "response_topic_id":response_topic_id
}
