from sqlalchemy import Integer, String, Enum
from sqlalchemy.orm import Mapped, mapped_column
from geoalchemy2 import Geometry

from Server.fast_api.resources import Base


class AdminDivisionModel(Base):
    __tablename__ = "AdminDivision"
    OBJECTID: Mapped[int] = mapped_column(Integer, unique=True, autoincrement=True)
    admin_code: Mapped[str] = mapped_column(String(9), primary_key=True)
    shape: Mapped[Geometry] = mapped_column(Geometry(srid=4326), nullable=False)
    name: Mapped[str] = mapped_column(String(33), nullable=False)

    def serialize(self):
        # 处理几何字段的序列化
        shape_wkt = None
        if self.shape is not None:
            try:
                # 尝试获取几何对象的WKT表示
                shape_wkt = str(self.shape)
            except:
                # 如果无法转换，则设为None
                shape_wkt = None
        return {
            'admin_code': self.admin_code,
            'shape': shape_wkt,
            'name': self.name,
        }