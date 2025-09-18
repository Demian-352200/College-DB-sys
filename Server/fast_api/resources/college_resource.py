from fastapi import Body, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Optional, List, Union
from sqlalchemy.orm import Session

from Server.fast_api.resources import app, get_db_session
from Server.fast_api.services import CollegeService
from Server.fast_api.model import CollegeModel
from Server.fast_api.services.base import get_current_user


class CollegeOut(BaseModel):
    college_id: int
    shape: Optional[str]
    province: str
    name: str
    category: str
    nature: str
    type: Optional[str]
    is_985: int
    is_211: int
    is_double_first: int
    city: str
    affiliation: Optional[str]
    address: Optional[str]
    longitude: float
    latitude: float
    admin_code: Optional[str]

    class Config:
        from_attributes = True


class CollegeSearchSchema(BaseModel):
    name: Optional[str] = Field(None, description="高校名称",examples=["中南大学"])
    province: Optional[str] = Field(None, description="省份",examples=["湖南"])
    city: Optional[str] = Field(None, description="城市",examples=["长沙"])
    category: Optional[str] = Field(None, description="类别",examples=["综合类","理工类","师范类"])
    nature: Optional[str] = Field(None, description="性质",examples=["公办","民办","中外合办"])
    type: Optional[str] = Field(None, description="类型",examples=["普通本科","专科（高职）"])
    is_985: Optional[bool] = Field(None, description="是否985高校",examples=[0,1])
    is_211: Optional[bool] = Field(None, description="是否211高校",examples=[0,1])
    is_double_first: Optional[bool] = Field(None, description="是否双一流高校",examples=[0,1])

class CollegeCreateSchema(BaseModel):
    college_id:int = Field(..., description="高校ID")
    shape: str = Field(..., description="高校地理位置几何信息，格式如 'POINT(纬度 经度)'",examples=["POINT(23.121 112.654)"])
    province: str = Field(..., description="省份",examples=["湖南"])
    name: str = Field(..., description="高校名称",examples=["中南大学"])
    category: str = Field(..., description="高校类别",examples=["综合类","理工类","师范类"])
    nature: str = Field(..., description="高校性质",examples=["公办","民办","中外合办"])
    type: Optional[str] = Field(None, description="高校类型",examples=["普通本科","专科（高职）"])
    is_985: int = Field(0, description="是否985高校，0或1",examples=[0,1])
    is_211: int = Field(0, description="是否211高校，0或1",examples=[0,1])
    is_double_first: int = Field(0, description="是否双一流高校，0或1",examples=[0,1])
    city: str = Field(..., description="城市",examples=["长沙"])
    affiliation: Optional[str] = Field(None, description="隶属单位",examples=["教育部"])
    address: Optional[str] = Field(None, description="详细地址")
    longitude: float = Field(..., description="经度")
    latitude: float = Field(..., description="纬度")
    admin_code: Optional[str] = Field(None, description="行政区划代码",examples=["156211300"])

class CollegeUpdateSchema(BaseModel):
    shape: Optional[str] = Field(None, description="高校地理位置几何信息，格式如 'POINT(经度 纬度)'",examples=["POINT(113.2 23.1)"])
    province: Optional[str] = Field(None, description="省份",examples=["湖南"])
    name: Optional[str] = Field(None, description="高校名称",examples=["中南大学"])
    category: Optional[str] = Field(None, description="高校类别",examples=["综合类","理工类","师范类"])
    nature: Optional[str] = Field(None, description="高校性质",examples=["公办","民办","中外合办"])
    type: Optional[str] = Field(None, description="高校类型",examples=["普通本科","专科（高职）"])
    is_985: Optional[int] = Field(None, description="是否985高校，0或1",examples=[0,1])
    is_211: Optional[int] = Field(None, description="是否211高校，0或1",examples=[0,1])
    is_double_first: Optional[int] = Field(None, description="是否双一流高校，0或1",examples=[0,1])
    city: Optional[str] = Field(None, description="城市",examples=["长沙"])
    affiliation: Optional[str] = Field(None, description="隶属单位",examples=["教育部"])
    address: Optional[str] = Field(None, description="详细地址")
    longitude: Optional[float] = Field(None, description="经度")
    latitude: Optional[float] = Field(None, description="纬度")
    admin_code: Optional[str] = Field(None, description="行政区划代码",examples=["156211300"])

class EvaluationCreateSchema(BaseModel):
    Dietary_evaluation: Optional[str] = Field(None, description="饮食评价")
    Traffic_evaluation: Optional[str] = Field(None, description="交通评价")
    Evaluation: Optional[str] = Field(None, description="自由补充评价")

class EvaluationUpdateSchema(EvaluationCreateSchema):
    ...

class CollegeOutWithId(CollegeOut):

    class Config:
        from_attributes = True


@app.get("/colleges/",
         tags=["College"],
         summary="获取所有高校数据",
         description="获取所有高校基本信息")
async def get_all_colleges(db_session: Session = Depends(get_db_session)):
    try:
        colleges = CollegeService().get_all_colleges(db_session)
        return [CollegeOut(**college.serialize()) for college in colleges]
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.get("/colleges/{college_id}",
         tags=["College"],
         summary="获取特定高校详细信息",
         description="根据高校ID获取特定高校详细信息及评价")
async def get_college_info(college_id: int, db_session: Session = Depends(get_db_session)):
    try:
        result = CollegeService().get_college_with_evaluation(college_id, db_session)
        if result:
            # 处理college对象的序列化
            college_data = CollegeOut(**result["college"].serialize())
            return {
                "college": college_data,
                "evaluations": result["evaluations"]
            }
        else:
            raise HTTPException(status_code=404, detail=f"College with ID {college_id} does not exist")
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.get("/colleges/search/",
         tags=["College"],
         summary="多条件组合筛选高校",
         description="根据多个条件筛选高校数据")
async def search_colleges(
        name: Optional[str] = Query(None, description="高校名称"),
        province: Optional[str] = Query(None, description="省份"),
        city: Optional[str] = Query(None, description="城市"),
        category: Optional[str] = Query(None, description="类别"),
        nature: Optional[str] = Query(None, description="性质"),
        type: Optional[str] = Query(None, description="类型"),
        is_985: Optional[bool] = Query(None, description="是否985高校"),
        is_211: Optional[bool] = Query(None, description="是否211高校"),
        is_double_first: Optional[bool] = Query(None, description="是否双一流高校"),
        db_session: Session = Depends(get_db_session)
):
    try:
        colleges = CollegeService().search_colleges(
            name=name, province=province, city=city, category=category,
            nature=nature, type=type, is_985=is_985, is_211=is_211,
            is_double_first=is_double_first, db_session=db_session
        )
        colleges = [CollegeOut(**college.serialize()) for college in colleges]
        return colleges
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.post("/colleges/",
          tags=["College"],
          summary="添加新高校",
          description="添加新高校信息，普通用户添加需审核，管理员添加直接发布")
async def add_college(
        college_data: CollegeCreateSchema,
        user_id: int = Depends(get_current_user),
        db_session: Session = Depends(get_db_session)
):
    try:
        # 将Pydantic模型转换为字典
        college_dict = college_data.model_dump()
        
        # 调用服务添加高校，传递用户ID
        result = CollegeService().add_college(college_dict, user_id, db_session)
        
        # 根据返回结果类型进行处理
        if isinstance(result, dict) and "message" in result:
            # 普通用户添加高校，返回审核信息
            return result
        else:
            # 管理员添加高校，直接返回高校信息
            # 使用序列化方法确保正确处理几何字段
            return CollegeOutWithId(**result.serialize())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/colleges/{college_id}/evaluations/",
          tags=["College"],
          summary="添加高校评价",
          description="为指定高校添加评价信息，认证用户可直接发布")
async def add_evaluation(
        college_id: int,
        evaluation_data: EvaluationCreateSchema,
        user_id: int = Depends(get_current_user),
        db_session: Session = Depends(get_db_session)
):
    try:
        # 将Pydantic模型转换为字典
        evaluation_dict = evaluation_data.model_dump()
        evaluation_dict['college_id'] = college_id
        
        # 调用服务添加评价，传递用户ID
        new_evaluation = CollegeService().add_evaluation(evaluation_dict, user_id, db_session)
        
        return new_evaluation.serialize()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/colleges/evaluations/{evaluation_id}",
         tags=["College"],
         summary="更新高校评价",
         description="更新指定高校评价")
async def update_evaluation(
        evaluation_id: int,
        evaluation_data: EvaluationUpdateSchema,
        user_id: int = Depends(get_current_user),
        db_session: Session = Depends(get_db_session)
):
    try:
        # 将Pydantic模型转换为字典
        evaluation_dict = evaluation_data.model_dump()

        # 调用服务更新评价，传递用户ID
        updated_evaluation = CollegeService().update_evaluation(evaluation_id, evaluation_dict, user_id, db_session)

        return updated_evaluation.serialize()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/colleges/evaluations/{evaluation_id}",
            tags=["College"],
            summary="删除高校评价",
            description="删除指定高校评价")
async def delete_evaluation(
        evaluation_id: int,
        user_id: int = Depends(get_current_user),
        db_session: Session = Depends(get_db_session)
):
    try:
        # 调用服务删除评价，传递用户ID
        result = CollegeService().delete_evaluation(evaluation_id, user_id, db_session)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/colleges/evaluations/",
            tags=["College"],
            summary="查看用户所有评价",
            description="查看用户对高校的所有评价")
async def get_all_evaluations(
        user_id: int = Depends(get_current_user),
        db_session: Session = Depends(get_db_session)
):
    try:
        result = CollegeService().get_all_evaluations(user_id, db_session)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/colleges/{college_id}",
            tags=["College"],
            summary="删除高校",
            description="删除指定高校及其相关评价，仅管理员")
async def delete_college(
        college_id: int,
        user_id: int = Depends(get_current_user),
        db_session: Session = Depends(get_db_session)
):
    try:
        # 调用服务删除高校，传递用户ID
        result = CollegeService().delete_college(college_id, user_id, db_session)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/colleges/review/{review_id}",
         tags=["College"],
         summary="审核高校信息",
         description="审核待审核的高校信息，仅管理员")
async def review_pending_college(
        review_id: int,
        status: str,
        comment: Optional[str] = None,
        user_id: int = Depends(get_current_user),
        db_session: Session = Depends(get_db_session)
):
    try:
        # 调用服务审核高校，传递用户ID
        result = CollegeService().review_pending_college(review_id, status, comment, user_id, db_session)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/colleges/review/pending",
         tags=["College"],
         summary="获取所有待审核信息",
         description="获取所有待审核的高校信息和高校信息更新请求，仅管理员"
         )
async def get_pending_reviews(
        user_id: int = Depends(get_current_user),
        db_session: Session = Depends(get_db_session)
):
    try:
        # 调用服务获取所有待审核信息，传递用户ID
        result = CollegeService().get_pending_reviews(user_id, db_session)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/colleges/review/{review_id}",
         tags=["College"],
         summary="获取待审核表单",
         description="获取待审核表单的详细信息，仅管理员"
         )
async def get_pendingdetail_reviews(
        review_id:int,
        user_id: int = Depends(get_current_user),
        db_session: Session = Depends(get_db_session)
):
    try:
        result = CollegeService().get_pendingdetail_reviews(user_id,review_id, db_session)
        return result.serialize()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/colleges/{college_id}/",
         tags=["College"],
         summary="更新高校信息",
         description="更新指定高校信息，管理员直接更新，普通用户需要审核"
         )
async def update_college(
        college_id: int,
        college_data: CollegeUpdateSchema,
        user_id: int = Depends(get_current_user),
        db_session: Session = Depends(get_db_session)
):
    try:
        # 将Pydantic模型转换为字典
        college_dict = college_data.model_dump(exclude_unset=True)

        # 调用服务更新高校信息，传递用户ID
        result = CollegeService().update_college(college_id, college_dict, user_id, db_session)

        # 根据返回结果类型进行处理
        if isinstance(result, dict) and "message" in result:
            # 普通用户更新高校信息，返回审核信息
            return result
        else:
            # 管理员更新高校信息，直接返回更新后的信息
            return CollegeOutWithId(**result.serialize())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

