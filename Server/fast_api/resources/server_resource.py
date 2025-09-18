import asyncio
import os
import json

from pydantic import BaseModel, Field
from fastapi import Body, Depends,BackgroundTasks,HTTPException, Response,Path
from fastapi.responses import StreamingResponse
from Server.fast_api.resources import app,get_db_session
from autogen_core.models import (UserMessage)
from Server.fast_api.services import ServerService
from Server.fast_api.common import result_queue
from sqlalchemy.orm import Session
from Server.fast_api.services.base import get_current_user


class InputModel(BaseModel):
    Content:str=Field(...,description="用户输入")
    
@app.post("/server",
          tags=["Server"],
          summary="对话助手",
          description="与数据库助手进行对话交互",
          response_class=StreamingResponse
          )
async def handle_user_input(*,input_model:InputModel=Body(...)):
    # 1. 发布消息
    await ServerService().publish_message(input_model.Content)
    # 2. 流式生成响应
    async def generate_stream():
        try:
            timeout = 30.0  # 设置超时时间(秒)
            start_time = asyncio.get_event_loop().time()

            while (asyncio.get_event_loop().time() - start_time) < timeout:
                try:
                    # 使用异步等待获取结果
                    result = await asyncio.wait_for(
                        result_queue.get(),
                        timeout=0.1
                    )
                    yield json.dumps({"data": result},ensure_ascii=False) + "\n"
                    start_time = asyncio.get_event_loop().time()
                except asyncio.TimeoutError:
                     continue

        except Exception as e:
            yield json.dumps({"error": str(e)}) + "\n"

    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no"
        }
    )

@app.post("/server/traffic/{college_id}",
          tags=["Server"],
          summary="交通分析",
          description="生源地与目标院校之间的交通分析",
          )
async def traffic_analysis(
        college_id: int = Path(..., description="目标院校id"),
        user_id: int = Depends(get_current_user),
        db_session: Session = Depends(get_db_session)
):
    try:
        result = await ServerService().traffic_analysis(college_id, user_id, db_session)
        from Server.agents.toolbox import ai_response
        response = await ai_response(result,task="traffic")
        return response
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.post("/server/climate/{college_id}",
          tags=["Server"],
          summary="气候分析",
          description="生源地与目标院校之间的气候差异分析",
          )
async def climate_analysis(
        college_id: int = Path(..., description="目标院校id"),
        user_id: int = Depends(get_current_user),
        db_session: Session = Depends(get_db_session)
):
    try:
        result = await ServerService().climate_analysis(college_id, user_id, db_session)
        from Server.agents.toolbox import ai_response
        response = await ai_response(result,task = "climate")
        return response
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )