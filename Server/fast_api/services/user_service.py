from Server.fast_api.services import BaseService
from sqlalchemy import Select
from Server.fast_api.model import UserModel
from Server.fast_api.resources import Session, get_db_session
import hashlib
from Server.agents.toolbox import get_geo_info


class UserService(BaseService):
    def login(self, username: str, password: str, db_session: Session):
        # 对密码进行哈希处理后再比较
        hashed_password = hashlib.sha256(password.encode('utf-8')).hexdigest()
        query = Select(UserModel).where(UserModel.username == username)
        user_model = db_session.execute(query).scalars().first()
        if user_model and user_model.password == hashed_password:
            return user_model
        else:
            return None

    def register(self, username: str, password: str, province: str, city: str, address: str, db_session: Session):
        # 检查用户名是否已存在
        query = Select(UserModel).where(UserModel.username == username)
        existing_user = db_session.execute(query).scalars().first()
        if existing_user:
            raise ValueError("Username already exists")

        # 对密码进行哈希处理
        hashed_password = hashlib.sha256(password.encode('utf-8')).hexdigest()
        try:
            result = get_geo_info(address, city)
            geo_info = result.get("geocodes")
            location = geo_info[0].get("location")
            adcode = int(geo_info[0].get("adcode"))
            citycode = geo_info[0].get("citycode")
        except Exception as e:
            raise ValueError(f"wrong: {e}")


        # 创建新用户，默认为普通用户角色
        new_user = UserModel(
            username=username,
            password=hashed_password,
            province=province,
            city=city,
            address=address,
            role='user',  # 默认为普通用户
            location=location,
            adcode=adcode,
            citycode=citycode
        )

        db_session.add(new_user)
        db_session.commit()
        db_session.refresh(new_user)
        return new_user

    def get_user_by_id(self, user_id: int, db_session: Session):
        """
        根据用户ID获取用户信息
        """
        query = Select(UserModel).where(UserModel.user_id == user_id)
        user_model = db_session.execute(query).scalars().first()
        return user_model

    def get_all_users(self, db_session: Session):
        """
        获取所有用户信息
        """
        query = Select(UserModel)
        users = db_session.execute(query).scalars().all()
        return users