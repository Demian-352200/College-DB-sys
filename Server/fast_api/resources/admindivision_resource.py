from fastapi import Body, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Union
from sqlalchemy.orm import Session

from Server.fast_api.resources import app, get_db_session
from Server.fast_api.services import AdminDivisionService
from Server.fast_api.model import CollegeModel
from Server.fast_api.services.base import get_current_user

class AdminDivisionOut(BaseModel):
    OBJECTID: int = Field(..., description="OBJECTID")
    shape: str = Field(..., description="高校地理位置几何信息，格式如 'POINT(纬度 经度)'",examples=["POINT(23.145 112.564)"])
    name: str = Field(..., description="名称")
    admin_code: int = Field(..., description="行政区划代码")
    class Config:
        from_attributes = True

class AdminDivisionCreate(AdminDivisionOut):
    OBJECTID:Optional[int] = Field(None, description="OBJECTID")

@app.get("/admin/",
         tags=["AdminDivision"],
         summary="获取所有行政区划数据",
         description="获取所有行政区划数据")
async def get_all_admin(db_session: Session = Depends(get_db_session)):
    try:
        admin = AdminDivisionService().get_all_admin(db_session)
        return [AdminDivisionOut(**admin.serialize()) for admin in admin]
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.get("/admin/{admin_code}",
         tags=["AdminDivision"],
         summary="获取特定行政区划详细信息",
         description="根据行政区划编码获取特定区域详细信息")
async def get_admin_info(admin_code: int, db_session: Session = Depends(get_db_session)):
    try:
        result = AdminDivisionService().get_admin_by_id(admin_code, db_session)
        if result:
            admin_data = AdminDivisionOut(**result.serialize())
            return admin_data
        else:
            raise HTTPException(status_code=404, detail=f"Admin with ID {admin_code} does not exist")
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.post("/admin/",
          tags=["AdminDivision"],
          summary="添加新行政区划数据",
          description="添加新行政区划数据信息，仅管理员可添加")
async def add_admin(
        admin_data: AdminDivisionCreate,
        user_id: int = Depends(get_current_user),
        db_session: Session = Depends(get_db_session)
):
    try:
        admin_dict = admin_data.model_dump()

        result = AdminDivisionService().add_admin(admin_dict, user_id, db_session)

        return AdminDivisionOut(**result.serialize())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))