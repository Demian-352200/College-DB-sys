from Server.models import model
from autogen_core.models import (SystemMessage,
                                 UserMessage,)
from autogen_core import CancellationToken
import asyncio
model_client = model
from typing import Literal

async def ai_response(content: str,task:Literal['traffic','climate']):
    traffic_system_message = """
    # 你的角色： 路线规划分析师
    # 背景:你将收到一份关于高考生与目标院校之间的路线规划文件，请帮助用户分析交通便利度
    # 任务要求如下：
    - 简要分析每条路线所需的路程，时间，花销成本
    - 总结分析两地间的交通便利度，寒暑假往返是否便捷

    # 注意：
    1. 语言简洁清晰，不说多余的话
    2. 使用纯文本回答，不使用代码格式
    """
    climate_system_message = """
    # 你的角色： 气候差异分析师
    # 背景: 高考生正在进行志愿填报，他们将家乡与目标院校所在地的气候差异作为重要标准
    # 任务要求如下：
    - 简要分析两地的气候差异
    - 总结分析两地间的显著差异指标，给出择校建议

    # 注意：
    1. 语言简洁清晰，不说多余的话
    2. 使用纯文本回答，不使用代码格式
    """

    system_message = traffic_system_message if task == "traffic" else climate_system_message

    response = await model_client.create(
        messages = [
            SystemMessage(content=system_message),
            UserMessage(content=content,source="user")
        ],
        cancellation_token=CancellationToken(),
    )

    return response.content
async def main():
    response = await ai_response("",task="traffic")
    print(response)
if __name__ == "__main__":
    asyncio.run(main())