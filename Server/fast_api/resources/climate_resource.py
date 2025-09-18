from fastapi import Body, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Union
from sqlalchemy.orm import Session

from Server.fast_api.resources import app, get_db_session
from Server.fast_api.services import ClimateService
from Server.fast_api.model import CollegeModel
from Server.fast_api.services.base import get_current_user

class ClimateOut(BaseModel):
    admin_code: str = Field(..., description="行政区划代码")
    
    # 2022年温度数据
    y202201_avg_temp: Optional[float] = Field(None, description="2022年1月平均温度")
    y202202_avg_temp: Optional[float] = Field(None, description="2022年2月平均温度")
    y202203_avg_temp: Optional[float] = Field(None, description="2022年3月平均温度")
    y202204_avg_temp: Optional[float] = Field(None, description="2022年4月平均温度")
    y202205_avg_temp: Optional[float] = Field(None, description="2022年5月平均温度")
    y202206_avg_temp: Optional[float] = Field(None, description="2022年6月平均温度")
    y202207_avg_temp: Optional[float] = Field(None, description="2022年7月平均温度")
    y202208_avg_temp: Optional[float] = Field(None, description="2022年8月平均温度")
    y202209_avg_temp: Optional[float] = Field(None, description="2022年9月平均温度")
    y202210_avg_temp: Optional[float] = Field(None, description="2022年10月平均温度")
    y202211_avg_temp: Optional[float] = Field(None, description="2022年11月平均温度")
    y202212_avg_temp: Optional[float] = Field(None, description="2022年12月平均温度")
    
    # 2023年温度数据
    y202301_avg_temp: Optional[float] = Field(None, description="2023年1月平均温度")
    y202302_avg_temp: Optional[float] = Field(None, description="2023年2月平均温度")
    y202303_avg_temp: Optional[float] = Field(None, description="2023年3月平均温度")
    y202304_avg_temp: Optional[float] = Field(None, description="2023年4月平均温度")
    y202305_avg_temp: Optional[float] = Field(None, description="2023年5月平均温度")
    y202306_avg_temp: Optional[float] = Field(None, description="2023年6月平均温度")
    y202307_avg_temp: Optional[float] = Field(None, description="2023年7月平均温度")
    y202308_avg_temp: Optional[float] = Field(None, description="2023年8月平均温度")
    y202309_avg_temp: Optional[float] = Field(None, description="2023年9月平均温度")
    y202310_avg_temp: Optional[float] = Field(None, description="2023年10月平均温度")
    y202311_avg_temp: Optional[float] = Field(None, description="2023年11月平均温度")
    y202312_avg_temp: Optional[float] = Field(None, description="2023年12月平均温度")
    
    # 2024年温度数据
    y202401_avg_temp: Optional[float] = Field(None, description="2024年1月平均温度")
    y202402_avg_temp: Optional[float] = Field(None, description="2024年2月平均温度")
    y202403_avg_temp: Optional[float] = Field(None, description="2024年3月平均温度")
    y202404_avg_temp: Optional[float] = Field(None, description="2024年4月平均温度")
    y202405_avg_temp: Optional[float] = Field(None, description="2024年5月平均温度")
    y202406_avg_temp: Optional[float] = Field(None, description="2024年6月平均温度")
    y202407_avg_temp: Optional[float] = Field(None, description="2024年7月平均温度")
    y202408_avg_temp: Optional[float] = Field(None, description="2024年8月平均温度")
    y202409_avg_temp: Optional[float] = Field(None, description="2024年9月平均温度")
    y202410_avg_temp: Optional[float] = Field(None, description="2024年10月平均温度")
    y202411_avg_temp: Optional[float] = Field(None, description="2024年11月平均温度")
    y202412_avg_temp: Optional[float] = Field(None, description="2024年12月平均温度")
    
    # 2021年降水数据
    y202101_avg_precip: Optional[float] = Field(None, description="2021年1月平均降水量")
    y202102_avg_precip: Optional[float] = Field(None, description="2021年2月平均降水量")
    y202103_avg_precip: Optional[float] = Field(None, description="2021年3月平均降水量")
    y202104_avg_precip: Optional[float] = Field(None, description="2021年4月平均降水量")
    y202105_avg_precip: Optional[float] = Field(None, description="2021年5月平均降水量")
    y202106_avg_precip: Optional[float] = Field(None, description="2021年6月平均降水量")
    y202107_avg_precip: Optional[float] = Field(None, description="2021年7月平均降水量")
    y202108_avg_precip: Optional[float] = Field(None, description="2021年8月平均降水量")
    y202109_avg_precip: Optional[float] = Field(None, description="2021年9月平均降水量")
    y202110_avg_precip: Optional[float] = Field(None, description="2021年10月平均降水量")
    y202111_avg_precip: Optional[float] = Field(None, description="2021年11月平均降水量")
    y202112_avg_precip: Optional[float] = Field(None, description="2021年12月平均降水量")
    
    # 2022年降水数据
    y202201_avg_precip: Optional[float] = Field(None, description="2022年1月平均降水量")
    y202202_avg_precip: Optional[float] = Field(None, description="2022年2月平均降水量")
    y202203_avg_precip: Optional[float] = Field(None, description="2022年3月平均降水量")
    y202204_avg_precip: Optional[float] = Field(None, description="2022年4月平均降水量")
    y202205_avg_precip: Optional[float] = Field(None, description="2022年5月平均降水量")
    y202206_avg_precip: Optional[float] = Field(None, description="2022年6月平均降水量")
    y202207_avg_precip: Optional[float] = Field(None, description="2022年7月平均降水量")
    y202208_avg_precip: Optional[float] = Field(None, description="2022年8月平均降水量")
    y202209_avg_precip: Optional[float] = Field(None, description="2022年9月平均降水量")
    y202210_avg_precip: Optional[float] = Field(None, description="2022年10月平均降水量")
    y202211_avg_precip: Optional[float] = Field(None, description="2022年11月平均降水量")
    y202212_avg_precip: Optional[float] = Field(None, description="2022年12月平均降水量")
    
    # 2023年降水数据
    y202301_avg_precip: Optional[float] = Field(None, description="2023年1月平均降水量")
    y202302_avg_precip: Optional[float] = Field(None, description="2023年2月平均降水量")
    y202303_avg_precip: Optional[float] = Field(None, description="2023年3月平均降水量")
    y202304_avg_precip: Optional[float] = Field(None, description="2023年4月平均降水量")
    y202305_avg_precip: Optional[float] = Field(None, description="2023年5月平均降水量")
    y202306_avg_precip: Optional[float] = Field(None, description="2023年6月平均降水量")
    y202307_avg_precip: Optional[float] = Field(None, description="2023年7月平均降水量")
    y202308_avg_precip: Optional[float] = Field(None, description="2023年8月平均降水量")
    y202309_avg_precip: Optional[float] = Field(None, description="2023年9月平均降水量")
    y202310_avg_precip: Optional[float] = Field(None, description="2023年10月平均降水量")
    y202311_avg_precip: Optional[float] = Field(None, description="2023年11月平均降水量")
    y202312_avg_precip: Optional[float] = Field(None, description="2023年12月平均降水量")
    
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


@app.get("/climate/{admin_code}",
         tags=["ClimateData"],
         summary="获取特定区域气候详细信息",
         description="根据气候ID获取特定区域详细气候信息")
async def get_climate_info(admin_code: str, db_session: Session = Depends(get_db_session)):
    try:
        result = ClimateService().get_climate_by_id(admin_code, db_session)
        if result:
            # 处理college对象的序列化
            college_data = ClimateOut(**result.serialize())
            return college_data
        else:
            raise HTTPException(status_code=404, detail=f"Climate with ID {admin_code} does not exist")
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