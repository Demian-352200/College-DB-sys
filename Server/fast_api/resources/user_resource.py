import jwt
from fastapi import Body, Depends, HTTPException, status
from future.utils import raise_
from pydantic import BaseModel, Field
from typing import Optional
from sqlalchemy.orm import Session
import hashlib

from Server.fast_api.common import LOGIN_SECRET
from Server.fast_api.resources import app, Session, get_db_session
from Server.fast_api.services import UserService
from Server.fast_api.model import UserModel


class LoginRequestSchema(BaseModel):
    username: str = Field(..., min_length=1, examples=["zhangsan"])
    password: str = Field(..., min_length=6)


class RegisterRequestSchema(BaseModel):
    username: str = Field(..., min_length=1, description="用户名", examples=["zhangsan"])
    password: str = Field(..., min_length=6, description="密码（至少6位）", examples=["password123"])
    province: str = Field(..., description="省份", examples=["湖南"])
    city: str = Field(..., description="城市", examples=["长沙"])
    address: str = Field(..., description="详细地址", examples=["湖南省长沙市岳麓区岳麓街道升华公寓"])
    
    
class UserOut(BaseModel):
    user_id: int
    username: str
    province: str
    city: str
    address: str
    location: str
    adcode: int
    citycode: str

    class Config:
        from_attributes = True


@app.post("/register", tags=["User"], summary="用户注册", description="注册新用户")
async def register_user(
    register_data: RegisterRequestSchema = Body(...), 
    db_session: Session = Depends(get_db_session)
):
    try:
        user = UserService().register(
            username=register_data.username,
            password=register_data.password,
            province=register_data.province,
            city=register_data.city,
            address=register_data.address,
            db_session=db_session
        )
        return {"message": "User registered successfully", "user_id": user.user_id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/login", tags=["User"], summary="用户登录", description="用户登录")
async def login(
    login_data: LoginRequestSchema = Body(...), 
    db_session: Session = Depends(get_db_session)
):
    try:
        username = login_data.username
        password = login_data.password
        if username and password:
            user_model = UserService().login(
                username=username, 
                password=password, 
                db_session=db_session
            )
            if user_model:
                # 使用UserOut模型来序列化用户信息
                user_out = UserOut.model_validate(user_model)
                user_dict = user_out.model_dump()
                # 生成JWT token
                jwt_token = jwt.encode(user_dict, LOGIN_SECRET, algorithm="HS256")
                user_dict['Authorization'] = jwt_token
                return user_dict
            else:
                raise HTTPException(status_code=401, detail="用户名或密码错误")
        else:
            raise HTTPException(status_code=400, detail="请提供用户名和密码")
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

@app.get("/user/{user_id}",tags=["User"],summary="获取用户信息",description="获取用户信息")
async def get_user_by_id(user_id: int,db_session: Session = Depends(get_db_session)):
    try:
        result = UserService().get_user_by_id(user_id, db_session)
        if result:
            user_data = UserOut(**result.serialize())
            return user_data
        else:
            raise HTTPException(status_code=404, detail="用户不存在")
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))

@app.get("/user",tags=["User"],summary="获取所有用户列表",description="获取所有用户列表")
async def get_all_users(db_session: Session = Depends(get_db_session)):
    try:
        result = UserService().get_all_users(db_session)
        if result:
            users_data = [UserOut(**user.serialize()) for user in result]
            return users_data
        else:
            raise HTTPException(status_code=404, detail="用户列表为空")
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))