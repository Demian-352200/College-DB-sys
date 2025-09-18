from sqlalchemy import Integer, String, Text, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from Server.fast_api.resources import Base


class ModificationHistoryModel(Base):
    __tablename__ = "ModificationHistory"
    history_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    # 修改的实体类型（高校、评价等）
    entity_type: Mapped[str] = mapped_column(
        Enum('college', 'evaluation', name='entity_type_enum'), nullable=False)
    # 被修改的实体ID
    entity_id: Mapped[int] = mapped_column(Integer, nullable=False)
    # 修改前的数据（JSON格式）
    old_data: Mapped[str] = mapped_column(Text, nullable=True)
    # 修改后的数据（JSON格式）
    new_data: Mapped[str] = mapped_column(Text, nullable=True)
    # 修改用户ID
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    # 修改时间
    modification_time: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    # 修改类型（更新、删除等）
    modification_type: Mapped[str] = mapped_column(
        Enum('update', 'delete', name='modification_type_enum'), nullable=False)

    def serialize(self):
        return {
            'history_id': self.history_id,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'old_data': self.old_data,
            'new_data': self.new_data,
            'user_id': self.user_id,
            'modification_time': self.modification_time.isoformat() if self.modification_time else None,
            'modification_type': self.modification_type
        }