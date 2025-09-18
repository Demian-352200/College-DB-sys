import asyncio
from colorama import Fore, init
init(autoreset=True)
from autogen_core.models import (UserMessage)
from autogen_core import (
    ClosureAgent,
    ClosureContext,
    MessageContext,
    TypeSubscription,
    try_get_known_serializers_for_type,
)
from autogen_ext.runtimes.grpc import GrpcWorkerAgentRuntime
from agents.messages import AgentResponse,UserRequest,RESPONSE_TOPIC_TYPE,user_topic_id

queue = asyncio.Queue[AgentResponse]()
CLOSURE_AGENT_TYPE = "collect_result_agent"
runtime = GrpcWorkerAgentRuntime(host_address="localhost:50051")
input_event = asyncio.Event()
async def handle_input() -> None:
    while True:
        loop = asyncio.get_running_loop()
        user_input = await loop.run_in_executor(
            None, input, f"{Fore.CYAN}等待输入:"
        )

        try:
            await runtime.publish_message(
                message=UserRequest(context=[UserMessage(content=user_input, source="User")]),
                topic_id=user_topic_id,
            )

        except Exception as e:
            print(f"{Fore.RED}处理用户输入时出错: {e}")
            await handle_input()

        input_event.clear()  # 重置事件状态
        # 等待回复处理完成
        await input_event.wait()



async def collect_result(_agent: ClosureContext, message: AgentResponse, ctx: MessageContext) -> None:
    context=message.context
    for msg in context:
        if msg.type=="UserMessage":
            print(f"{str(msg.source).center(60, '=')}\n{msg.content}\n")
        if msg.type == 'AssistantMessage':
            # 如果 content 是 FunctionCall 列表，进一步解析
            if isinstance(msg.content, list):
                for func_call in msg.content:
                    print(f"{Fore.BLUE}{str(msg.source).center(60, '=')}\n工具ID：{func_call.id}\n工具名称：{func_call.name}\n工具参数：{func_call.arguments}\n")
            elif isinstance(msg.content, str):
                print(f"{str(msg.source).center(60, '=')}\n {msg.content}\n")
        if msg.type == 'FunctionExecutionResultMessage':
            pass
        else:
            print(f"{Fore.RED}未知消息类型: {msg.type}\n")

    input_event.set()




async def main() -> None:
    runtime.add_message_serializer(try_get_known_serializers_for_type(AgentResponse))
    runtime.add_message_serializer(try_get_known_serializers_for_type(UserRequest))

    await runtime.start()

    await ClosureAgent.register_closure(
        runtime,
        CLOSURE_AGENT_TYPE,
        collect_result,
        subscriptions=lambda: [TypeSubscription(topic_type=RESPONSE_TOPIC_TYPE, agent_type=CLOSURE_AGENT_TYPE),
                               TypeSubscription(topic_type="default", agent_type=CLOSURE_AGENT_TYPE)],
    )

    asyncio.create_task(handle_input())

    await runtime.stop_when_signal()

if __name__ == "__main__":
    print("系统已启动！正在等待消息...")
    asyncio.run(main())