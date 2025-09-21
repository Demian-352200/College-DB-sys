from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

engine = create_engine('mysql+mysqldb://')

class Base(DeclarativeBase):
    pass

Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)

title="College_DB API"
description="""全国高校生活评价空间信息数据库 RESTful API"""
version="0.0.1"
tags_metadata=[
    {
        "name":"AdminDivision",
        "description":"行政区划相关接口"
    },
    {
        "name":"ClimateData",
        "description":"气候数据相关接口"
    },
    {
        "name":"College",
        "description":"高校数据相关接口"
    },
    {
        "name": "User",
        "description": "用户管理相关接口"
    },
    {
        "name": "Server",
        "description": "服务相关接口"
    }
]

app=FastAPI(title=title,
            description=description,
            version=version,
            openapi_tags=tags_metadata,
            swagger_ui_parameters={"syntaxHighlight.theme": "obsidian"},
            # 添加安全配置
            swagger_ui_oauth2_redirect_url="/docs/oauth2-redirect",
            openapi_security=[{"HTTPBearer": []}])

def get_db_session():
    db_session = Session()
    try:
        yield db_session
    finally:
        db_session.close()

from Server.fast_api.resources import (
    user_resource,
    college_resource,
    server_resource,
    climate_resource,
    admindivision_resource,
)