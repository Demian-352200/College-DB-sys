from sqlalchemy import Integer, String, Float, Enum, TIMESTAMP, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.mysql import TINYINT
from geoalchemy2 import Geometry
from datetime import datetime

from Server.fast_api.resources import Base


class PendingCollegeModel(Base):
    __tablename__ = "PendingCollege"
    review_id: Mapped[int] = mapped_column(Integer, ForeignKey('CollegeReview.review_id'), primary_key=True)  # 使用review_id作为主键
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('User.user_id'), nullable=False)
    shape: Mapped[Geometry] = mapped_column(Geometry(), nullable=False)
    province: Mapped[str] = mapped_column(String(20), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(
        Enum('综合类', '理工类', '师范类', '医药类', '财经类', '艺术类', '农林类', '政法类', '其他', '语言类', '体育类', '军事类', '民族类',
             name='pending_college_category_enum'), nullable=False)
    nature: Mapped[str] = mapped_column(Enum('公办', '民办', '中外合办', name='pending_college_nature_enum'), nullable=False)
    type: Mapped[str] = mapped_column(String(254), nullable=True)
    is_985: Mapped[int] = mapped_column(TINYINT(1), nullable=False, default=0)
    is_211: Mapped[int] = mapped_column(TINYINT(1), nullable=False, default=0)
    is_double_first: Mapped[int] = mapped_column(TINYINT(1), nullable=False, default=0)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    affiliation: Mapped[str] = mapped_column(String(255), nullable=True)
    address: Mapped[str] = mapped_column(String(255), nullable=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    admin_code: Mapped[int] = mapped_column(Integer, ForeignKey('AdminDivision.admin_code'), nullable=True)
    submit_time: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)
    college_id: Mapped[str] = mapped_column(String(9), nullable=False)

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
            'review_id': self.review_id,
            'user_id': self.user_id,
            'college_id':self.college_id,
            'shape': shape_wkt,
            'province': self.province,
            'name': self.name,
            'category': self.category,
            'nature': self.nature,
            'type': self.type,
            'is_985': self.is_985,
            'is_211': self.is_211,
            'is_double_first': self.is_double_first,
            'city': self.city,
            'affiliation': self.affiliation,
            'address': self.address,
            'longitude': self.longitude,
            'latitude': self.latitude,
            'admin_code': self.admin_code,
            'submit_time': self.submit_time.isoformat() if self.submit_time else None
        }