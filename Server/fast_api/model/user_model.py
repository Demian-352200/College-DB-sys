from sqlalchemy import Integer, String , Enum
from sqlalchemy.orm import Mapped, mapped_column

from Server.fast_api.resources import Base


class UserModel(Base):
    __tablename__ = "User"
    user_id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    province: Mapped[str] = mapped_column(String(20), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(Enum('admin', 'user', name='user_role'), nullable=False,default='user')
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    citycode: Mapped[str] = mapped_column(String(20), nullable=False)
    adcode: Mapped[int] = mapped_column(Integer, nullable=False)

    def serialize(self):
        return {
            'user_id': self.user_id,
            'username': self.username,
            'province': self.province,
            'city': self.city,
            'address': self.address,
            'role': self.role,
            'location': self.location,
            'citycode': self.citycode,
            'adcode': self.adcode
        }