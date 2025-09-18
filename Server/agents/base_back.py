import json
from typing import List, Tuple,Optional

from autogen_core import (MessageContext,
                          RoutedAgent,
                          message_handler,
                          FunctionCall,
                          CancellationToken,
                          )
from autogen_core.models import (SystemMessage,
                                 LLMMessage,
                                 FunctionExecutionResult,
                                 FunctionExecutionResultMessage,
                                 AssistantMessage,
                                 UserMessage,)
from autogen_core.tools import Tool
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_ext.tools.mcp import StdioMcpToolAdapter
from .messages import (
    UserRequest,
    AgentResponse,
    TOPICS,
    USER_TOPIC_TYPE,
    MESSAGES,
)


class BaseAgent(RoutedAgent):
    def __init__(
        self,
        description:str,
        model_client: OpenAIChatCompletionClient,
        system_message:str,
        tools: List[Tool] | list[StdioMcpToolAdapter] ,
        delegate_tools:Optional[List[Tool]]
    ) -> None:
        super().__init__(description=description)
        self._model_client = model_client
        self._system_message = system_message
        self._tools = dict([(tool.name, tool) for tool in tools])
        self._tool_schema = [tool.schema for tool in tools]
        self._delegate_tools = dict([(tool.name, tool) for tool in delegate_tools])
        self._delegate_tool_schema = [tool.schema for tool in delegate_tools]
        self._session: List[LLMMessage] = []
        self._session.append(SystemMessage(content=system_message))

    async def _execute_tool(self, call: FunctionCall, message: UserRequest, ctx: MessageContext) -> Tuple[
        List[FunctionExecutionResult], List[Tuple[str, UserRequest]]]:
        """
        执行工具并处理结果。

        :param call: 函数调用对象
        :param message: 用户请求消息
        :param ctx: 消息上下文
        :return: 工具执行结果列表和委托目标列表
        """
        tool_call_results: List[FunctionExecutionResult] = []
        delegate_targets: List[Tuple[str, UserRequest]] = []

        arguments = json.loads(call.arguments)
        if call.name in self._tools:
            # 直接执行工具
            result = await self._tools[call.name].run_json(arguments, ctx.cancellation_token)
            result_as_str = self._tools[call.name].return_value_as_string(result)
            tool_call_results.append(
                FunctionExecutionResult(call_id=call.id, content=result_as_str, is_error=False, name=call.name)
            )
        elif call.name in self._delegate_tools:
            # 执行工具以获取委托代理的类型
            result = await self._delegate_tools[call.name].run_json(arguments, ctx.cancellation_token)
            agent_type = self._delegate_tools[call.name].return_value_as_string(result)
            # 创建委托代理的上下文，包括函数调用和结果
            delegate_messages = message.context + [
                AssistantMessage(content=[call], source=self.id.type),
                FunctionExecutionResultMessage(
                    content=[
                        FunctionExecutionResult(
                            call_id=call.id,
                            content=f"Transferred to {agent_type}. Adopt persona immediately.",
                            is_error=False,
                            name=call.name,
                        )
                    ]
                ),
            ]
            delegate_targets.append((agent_type, UserRequest(context=delegate_messages)))
        else:
            raise ValueError(f"Unknown tool: {call.name}")

        return tool_call_results, delegate_targets

    @message_handler
    async def handle_user_request(self, message: UserRequest, ctx: MessageContext) -> None:
        try:
            self._session.extend(message.context)
            # 使用流式响应处理
            response_content = ""
            async for chunk in self._model_client.create_stream(
                messages=self._session,
                tools=self._tool_schema + self._delegate_tool_schema,
                cancellation_token=CancellationToken(),
            ):
                if isinstance(chunk, str):
                    response_content += chunk
                    # 实时发送每个文本块
                    await self.publish_message(topic_id=TOPICS["response_topic_id"], message=AgentResponse(
                        context=[AssistantMessage(content=chunk, source=self.id.type)]))
            
            # 添加完整消息到会话历史
            if response_content:
                self._session.append(AssistantMessage(content=response_content, source=self.id.type))

        except Exception as e:
            await self.publish_message(topic_id=TOPICS["response_topic_id"], message=AgentResponse(
                context=[AssistantMessage(content=f"处理用户请求时发生错误: {e}", source=self.id.type)]))
