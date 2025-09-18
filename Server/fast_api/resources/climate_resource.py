from fastapi import Body, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Union
from sqlalchemy.orm import Session

from Server.fast_api.resources import app, get_db_session
from Server.fast_api.services import ClimateService
from Server.fast_api.model import CollegeModel
from Server.fast_api.services.base import get_current_user

class ClimateOut(BaseModel):
    year: int = Field(..., description="年份")
    month: int = Field(..., description="月份")
    annual_avg_temp: float = Field(..., description="年平均气温")
    monthly_avg_temp: float = Field(..., description="月平均气温")
    annual_precipitation:  float = Field(..., description="年平均降水量")
    monthly_avg_precip: float = Field(..., description="月平均降水量")
    admin_code:int = Field(..., description="行政区划代码")
    class Config:
        from_attributes = True

class ClimateCreate(ClimateOut):
    ...

@app.get("/climate/",
         tags=["ClimateData"],
         summary="获取所有气候数据",
         description="获取所有气候数据")
async def get_all_climate(db_session: Session = Depends(get_db_session)):
    try:
        climate = ClimateService().get_all_climate(db_session)
        return [ClimateOut(**college.serialize()) for college in climate]
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.get("/climate/{climate_id}",
         tags=["ClimateData"],
         summary="获取特定区域气候详细信息",
         description="根据气候ID获取特定区域详细气候信息")
async def get_climate_info(climate_id: int, db_session: Session = Depends(get_db_session)):
    try:
        result = ClimateService().get_climate_by_id(climate_id, db_session)
        if result:
            # 处理college对象的序列化
            college_data = ClimateOut(**result.serialize())
            return college_data
        else:
            raise HTTPException(status_code=404, detail=f"Climate with ID {climate_id} does not exist")
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.post("/climate/",
          tags=["ClimateData"],
          summary="添加新气候数据",
          description="添加新气候数据信息，仅管理员可添加")
async def add_climate(
        climate_data: ClimateCreate,
        user_id: int = Depends(get_current_user),
        db_session: Session = Depends(get_db_session)
):
    try:
        climate_dict = climate_data.model_dump()

        result = ClimateService().add_climate(climate_dict, user_id, db_session)

        return ClimateOut(**result.serialize())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))