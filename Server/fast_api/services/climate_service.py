from Server.fast_api.services import BaseService
from Server.fast_api.resources import Session, get_db_session
from Server.fast_api.model import ClimateDataModel,UserModel
from sqlalchemy import Select


class ClimateService(BaseService):
    def get_climate_by_id(self, admin_code: int, db_session: Session):
        """
        根据ID获取特定区域气候信息
        """
        return db_session.get(ClimateDataModel, admin_code)

    def get_all_climate(self, db_session: Session):
        """
        获取所有气候数据
        """
        query = Select(ClimateDataModel)
        result = db_session.execute(query).scalars().all()
        return result

    def add_climate(self, climate_data: dict, user_id:int ,db_session: Session):
        """
        添加新气候数据
        """
        # 获取用户信息以检查权限
        user = db_session.get(UserModel, user_id)
        if not user:
            raise ValueError("用户不存在")

        if user.role == 'admin':
            new_climate = ClimateDataModel(**climate_data)
            db_session.add(new_climate)
            db_session.commit()
            db_session.refresh(new_climate)
            return new_climate

        else:
            # 普通用户无权创建
            raise ValueError("无权限")