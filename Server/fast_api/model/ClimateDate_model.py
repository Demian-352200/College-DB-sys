from sqlalchemy import Integer, Float,ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.mysql import TINYINT

from Server.fast_api.resources import Base


class ClimateDataModel(Base):
    __tablename__ = "ClimateData"
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    month: Mapped[int] = mapped_column(Integer, nullable=False)
    annual_avg_temp: Mapped[float] = mapped_column(Float, nullable=True)
    monthly_avg_temp: Mapped[float] = mapped_column(Float, nullable=True)
    annual_precipitation: Mapped[float] = mapped_column(Float, nullable=True)
    monthly_avg_precip: Mapped[float] = mapped_column(Float, nullable=True)
    admin_code: Mapped[int] = mapped_column(Integer,ForeignKey('AdminDivision.admin_code'), nullable=False,primary_key=True)

    def serialize(self):
        return {
            'year': self.year,
            'month': self.month,
            'annual_avg_temp': self.annual_avg_temp,
            'monthly_avg_temp': self.monthly_avg_temp,
            'annual_precipitation': self.annual_precipitation,
            'monthly_avg_precip': self.monthly_avg_precip,
            'admin_code': self.admin_code,
        }