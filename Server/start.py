import os
import asyncio
import json
from typing import List
from colorama import Fore, init
init(autoreset=True)
from autogen_ext.runtimes.grpc import GrpcWorkerAgentRuntimeHost,GrpcWorkerAgentRuntime

import models
from agents import Commander
from agents.messages import *
from prompts import *
from agents.toolbox import tool_box_for_agent
from autogen_core.models import (UserMessage)
from autogen_core import (
    MessageContext,
    TypeSubscription,
    try_get_known_serializers_for_type,
    ClosureAgent,
    ClosureContext,
)
from Server.fast_api.common import SERVER_URL,result_queue

runtime_closure = GrpcWorkerAgentRuntime(host_address="localhost:50051")
CLOSURE_AGENT_TYPE = "collect_result_agent"

with open('config.json','r',encoding='utf-8') as f:
    config=json.load(f)

async def collect_result(_agent: ClosureContext, message: AgentResponse, ctx: MessageContext)->None:
    context=message.context
    for msg in context:
        if msg.type=="UserMessage":
            print(f"{str(msg.source).center(60, '=')}\n{msg.content}\n")
            await result_queue.put({"Sender": msg.source,"Content": msg.content})
        elif msg.type == 'AssistantMessage':
            # 如果 content 是 FunctionCall 列表，进一步解析
            if isinstance(msg.content, list):
                for func_call in msg.content:
                    print(f"{Fore.BLUE}{str(msg.source).center(60, '=')}\n工具ID：{func_call.id}\n工具名称：{func_call.name}\n工具参数：{func_call.arguments}\n")
                    response=f"工具ID：{func_call.id}\n工具名称：{func_call.name}\n工具参数：{func_call.arguments}"
                    await result_queue.put({"Sender": msg.source,"Content": response }  )
            elif isinstance(msg.content, str):
                print(f"{str(msg.source).center(60, '=')}\n {msg.content}\n")
                await result_queue.put({"Sender": msg.source, "Content": msg.content})
        elif msg.type == 'FunctionExecutionResultMessage':
            pass
        else:
            raise Exception(f"未知消息类型:{msg.type}")

def create_subscriptions(subs: List[dict]) -> List[TypeSubscription]:
    return [TypeSubscription(topic_type=sub["topic_type"], agent_type=sub["agent_type"]) for sub in subs]
async def worker_runtime(
    agent_type: str,
    agent_name: str,
    model_client: any,
    tools: list,
    delegate_tools: list,
    system_message: str,
    subscriptions: List[dict],
    message_serializer_types: list,
) -> GrpcWorkerAgentRuntime:
    runtime = GrpcWorkerAgentRuntime(host_address="localhost:50051")
    for msg in message_serializer_types:
        runtime.add_message_serializer(try_get_known_serializers_for_type(msg))
    await runtime.start()

    agent_instance = lambda: globals()[agent_type](
        description=agent_name,
        model_client=model_client,
        tools=tools,
        delegate_tools=delegate_tools,
        system_message=system_message
    )

    await globals()[agent_type].register(runtime, agent_name, agent_instance)

    for sub in create_subscriptions(subscriptions):
        await runtime.add_subscription(sub)

    return runtime

async def mas_main() -> None:
    service = GrpcWorkerAgentRuntimeHost(address="localhost:50051")
    service.start()
    model_client = models.model
    tool_list=tool_box_for_agent
    agent_type={
        "Commander":"Commander",
    }
    runtime_commander = await worker_runtime(
        agent_type=agent_type["Commander"],
        agent_name=agent_type["Commander"],
        model_client=model_client,
        tools=tool_list,
        delegate_tools=[],
        system_message=commander_prompt,
        message_serializer_types=MESSAGES,
        subscriptions=[
            {
                "topic_type": USER_TOPIC_TYPE,
                "agent_type": agent_type["Commander"],
            },
        ]
    )

    runtime_closure.add_message_serializer(try_get_known_serializers_for_type(AgentResponse))
    runtime_closure.add_message_serializer(try_get_known_serializers_for_type(UserRequest))
    await runtime_closure.start()
    await ClosureAgent.register_closure(
        runtime_closure,
        CLOSURE_AGENT_TYPE,
        collect_result,
        subscriptions=lambda: [TypeSubscription(topic_type=RESPONSE_TOPIC_TYPE, agent_type=CLOSURE_AGENT_TYPE),
                               TypeSubscription(topic_type="default", agent_type=CLOSURE_AGENT_TYPE)],
    )

    try:
        # Wait for the service to stop
        if os.name == "nt":
            # On Windows, the signal is not available, so we wait for a new event
            await asyncio.Event().wait()
        else:
            await runtime_closure.stop_when_signal()
            await runtime_commander.stop_when_signal()
            await service.stop_when_signal()
    except KeyboardInterrupt:
        print("Stopping service...")
    finally:
        await service.stop()
async def run_both():
    import uvicorn
    # 在一个事件循环中同时运行两个服务
    server = uvicorn.Server(
        config=uvicorn.Config(
            app="Server.fast_api.resources:app",
            host="0.0.0.0",
            port=8080,
            reload=True
        )
    )
    await asyncio.gather(
        server.serve(),
        mas_main()
    )

if __name__ == "__main__":
    asyncio.run(run_both())

