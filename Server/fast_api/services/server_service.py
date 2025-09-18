import json

import requests
from autogen_core import try_get_known_serializers_for_type
from autogen_core.models import (UserMessage)
from autogen_ext.runtimes.grpc import GrpcWorkerAgentRuntime
from fastapi import HTTPException

from Server.agents.messages import (
    UserRequest,
    user_topic_id)
from Server.fast_api.common import SERVER_URL
from Server.fast_api.services import BaseService
from sqlalchemy.orm import Session
from Server.fast_api.model import CollegeModel


class ServerService(BaseService):
    def __init__(self):
        self.runtime = GrpcWorkerAgentRuntime(host_address="localhost:50051")

    async def publish_message(self,content: str):
        try:
            self.runtime.add_message_serializer(try_get_known_serializers_for_type(UserRequest))
            await self.runtime.start()
            if content.startswith("@"):
                parts = content.split(maxsplit=1)
                if len(parts) > 1:
                    agent_name = parts[0][1:]
                    message_content = parts[1]
                    if agent_name in ['GeoAnalyst', 'UAVController']:
                        topic_id = gis_topic_id if agent_name == 'GeoAnalyst' else uav_topic_id
                        await self.runtime.publish_message(
                            message=UserRequest(context=[UserMessage(content=message_content, source="User")]),
                            topic_id=topic_id,
                        )
                    else:
                        print(f"@对象名无效，请检查输入")
                        raise HTTPException(status_code=400, detail="Invalid agent name")
            else:
                await self.runtime.publish_message(
                    message=UserRequest(context=[UserMessage(content=content, source="User")]),
                    topic_id=user_topic_id,
                )
        except Exception as e:
            print(f"处理消息时出错: {e}")
            raise HTTPException(status_code=500, detail=f"{e}")
        finally:
            await self.runtime.stop()

    async def traffic_analysis(self,college_id:int,user_id:int,db_session:Session)->str:
        college = db_session.get(CollegeModel, college_id)
        try:
            if not college:
                raise HTTPException(status_code=404, detail="College not found")
            college_location = f"{college.longitude},{college.latitude}"

            from Server.fast_api.services import UserService
            user = UserService().get_user_by_id(user_id, db_session)
            user_location = user.location

            from Server.agents.toolbox import plan_transit_route
            route_data = plan_transit_route(origin=user_location,
                                            destination=college_location,
                                            city=user.city,
                                            cityd=str(college.city))
            
            # 删除返回数据中的segments字段
            if "route" in route_data and "transits" in route_data["route"]:
                for transit in route_data["route"]["transits"]:
                    if "segments" in transit:
                        del transit["segments"]
            
            route_data=json.dumps(route_data,ensure_ascii=False)
            print(route_data)
            return route_data
        except Exception as e:
            raise ValueError(f"Failed to plan transit route: {e}")

    async def climate_analysis(self,college_id:int,user_id:int,db_session:Session)->str:
        college = db_session.get(CollegeModel, college_id)
        try:
            if not college:
                raise HTTPException(status_code=404, detail="College not found")
            college_province = college.province

            from Server.fast_api.services import UserService
            user = UserService().get_user_by_id(user_id, db_session)
            user_province = user.province

            prompt=f"""
            我是{user_province}省的高考生，我想去{college_province}省的{college.name}大学，请帮我比较两地的气候差异，并给出比较结果。
            """
            return prompt
        except Exception as e:
            raise ValueError(f"Failed to plan transit route: {e}")

