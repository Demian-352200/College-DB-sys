from sqlalchemy import Integer, String, Float, Enum, TIMESTAMP, TEXT
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.mysql import TINYINT
from geoalchemy2 import Geometry

from Server.fast_api.resources import Base
from datetime import datetime


class CollegeModel(Base):
    __tablename__ = "College"
    OBJECTID: Mapped[int] = mapped_column(Integer, unique=True, autoincrement=True,nullable=False)
    college_id: Mapped[int] = mapped_column(Integer,primary_key=True,nullable=False)
    shape: Mapped[Geometry] = mapped_column(Geometry(srid=4326), nullable=False)
    province: Mapped[str] = mapped_column(String(254), nullable=False)
    name: Mapped[str] = mapped_column(String(254), nullable=False)
    category: Mapped[str] = mapped_column(
        Enum('综合类', '理工类', '师范类', '医药类', '财经类', '艺术类', '农林类', '政法类', '其他', '语言类', '体育类', '军事类', '民族类',
             name='college_category_enum'), nullable=True)
    nature: Mapped[str] = mapped_column(String(254), nullable=True)
    type: Mapped[str] = mapped_column(String(254), nullable=True)
    is_985: Mapped[int] = mapped_column(TINYINT(1), nullable=False, default=0)
    is_211: Mapped[int] = mapped_column(TINYINT(1), nullable=False, default=0)
    is_double_first: Mapped[int] = mapped_column(TINYINT(1), nullable=False, default=0)
    city: Mapped[str] = mapped_column(String(254), nullable=True)
    affiliation: Mapped[str] = mapped_column(String(254), nullable=True)
    address: Mapped[str] = mapped_column(String(254), nullable=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=True)
    admin_code: Mapped[str] = mapped_column(String(9), nullable=True)

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
            'college_id': self.college_id,
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
        }


class CollegeReviewModel(Base):
    __tablename__ = "CollegeReview"
    review_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    college_id: Mapped[int] = mapped_column(Integer, nullable=True)  # 对应的高校ID，可为空表示新添加的高校
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)  # 提交用户ID
    status: Mapped[str] = mapped_column(Enum('pending', 'approved', 'rejected', name='review_status_enum'), 
                                        nullable=False, default='pending')  # 审核状态
    submit_time: Mapped[datetime] = mapped_column(TIMESTAMP, nullable=False)  # 提交时间
    review_time: Mapped[datetime] = mapped_column(TIMESTAMP, nullable=True)  # 审核时间
    reviewer_id: Mapped[int] = mapped_column(Integer, nullable=True)  # 审核人ID
    review_comment: Mapped[str] = mapped_column(TEXT, nullable=True)  # 审核意见
    review_type: Mapped[str] = mapped_column(Enum('new', 'update', name='review_type_enum'),
                                             nullable=False, default='new')  # 审核类型

    def serialize(self):
        return {
            'review_id': self.review_id,
            'college_id': self.college_id,
            'user_id': self.user_id,
            'status': self.status,
            'submit_time': self.submit_time.isoformat() if self.submit_time else None,
            'review_time': self.review_time.isoformat() if self.review_time else None,
            'reviewer_id': self.reviewer_id,
            'review_comment': self.review_comment,
            'review_type': self.review_type
        }