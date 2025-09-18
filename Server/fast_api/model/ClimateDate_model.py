from sqlalchemy import Integer, Float, String,DOUBLE
from sqlalchemy.orm import Mapped, mapped_column

from Server.fast_api.resources import Base


class ClimateDataModel(Base):
    __tablename__ = "ClimateData"
    admin_code: Mapped[str] = mapped_column(String(9), primary_key=True, nullable=False)
    # 2022年温度数据
    y202201_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202202_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202203_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202204_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202205_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202206_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202207_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202208_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202209_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202210_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202211_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202212_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    
    # 2023年温度数据
    y202301_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202302_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202303_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202304_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202305_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202306_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202307_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202308_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202309_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202310_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202311_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202312_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    
    # 2024年温度数据
    y202401_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202402_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202403_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202404_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202405_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202406_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202407_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202408_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202409_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202410_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202411_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202412_avg_temp: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    
    # 2021年降水数据
    y202101_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202102_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202103_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202104_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202105_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202106_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202107_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202108_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202109_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202110_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202111_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202112_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    
    # 2022年降水数据
    y202201_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202202_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202203_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202204_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202205_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202206_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202207_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202208_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202209_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202210_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202211_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202212_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    
    # 2023年降水数据
    y202301_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202302_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202303_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202304_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202305_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202306_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202307_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202308_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202309_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202310_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202311_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)
    y202312_avg_precip: Mapped[float] = mapped_column(DOUBLE, nullable=True)

    def serialize(self):
        return {
            'admin_code': self.admin_code,
            
            # 2022年温度数据
            'y202201_avg_temp': self.y202201_avg_temp,
            'y202202_avg_temp': self.y202202_avg_temp,
            'y202203_avg_temp': self.y202203_avg_temp,
            'y202204_avg_temp': self.y202204_avg_temp,
            'y202205_avg_temp': self.y202205_avg_temp,
            'y202206_avg_temp': self.y202206_avg_temp,
            'y202207_avg_temp': self.y202207_avg_temp,
            'y202208_avg_temp': self.y202208_avg_temp,
            'y202209_avg_temp': self.y202209_avg_temp,
            'y202210_avg_temp': self.y202210_avg_temp,
            'y202211_avg_temp': self.y202211_avg_temp,
            'y202212_avg_temp': self.y202212_avg_temp,
            
            # 2023年温度数据
            'y202301_avg_temp': self.y202301_avg_temp,
            'y202302_avg_temp': self.y202302_avg_temp,
            'y202303_avg_temp': self.y202303_avg_temp,
            'y202304_avg_temp': self.y202304_avg_temp,
            'y202305_avg_temp': self.y202305_avg_temp,
            'y202306_avg_temp': self.y202306_avg_temp,
            'y202307_avg_temp': self.y202307_avg_temp,
            'y202308_avg_temp': self.y202308_avg_temp,
            'y202309_avg_temp': self.y202309_avg_temp,
            'y202310_avg_temp': self.y202310_avg_temp,
            'y202311_avg_temp': self.y202311_avg_temp,
            'y202312_avg_temp': self.y202312_avg_temp,
            
            # 2024年温度数据
            'y202401_avg_temp': self.y202401_avg_temp,
            'y202402_avg_temp': self.y202402_avg_temp,
            'y202403_avg_temp': self.y202403_avg_temp,
            'y202404_avg_temp': self.y202404_avg_temp,
            'y202405_avg_temp': self.y202405_avg_temp,
            'y202406_avg_temp': self.y202406_avg_temp,
            'y202407_avg_temp': self.y202407_avg_temp,
            'y202408_avg_temp': self.y202408_avg_temp,
            'y202409_avg_temp': self.y202409_avg_temp,
            'y202410_avg_temp': self.y202410_avg_temp,
            'y202411_avg_temp': self.y202411_avg_temp,
            'y202412_avg_temp': self.y202412_avg_temp,
            
            # 2021年降水数据
            'y202101_avg_precip': self.y202101_avg_precip,
            'y202102_avg_precip': self.y202102_avg_precip,
            'y202103_avg_precip': self.y202103_avg_precip,
            'y202104_avg_precip': self.y202104_avg_precip,
            'y202105_avg_precip': self.y202105_avg_precip,
            'y202106_avg_precip': self.y202106_avg_precip,
            'y202107_avg_precip': self.y202107_avg_precip,
            'y202108_avg_precip': self.y202108_avg_precip,
            'y202109_avg_precip': self.y202109_avg_precip,
            'y202110_avg_precip': self.y202110_avg_precip,
            'y202111_avg_precip': self.y202111_avg_precip,
            'y202112_avg_precip': self.y202112_avg_precip,
            
            # 2022年降水数据
            'y202201_avg_precip': self.y202201_avg_precip,
            'y202202_avg_precip': self.y202202_avg_precip,
            'y202203_avg_precip': self.y202203_avg_precip,
            'y202204_avg_precip': self.y202204_avg_precip,
            'y202205_avg_precip': self.y202205_avg_precip,
            'y202206_avg_precip': self.y202206_avg_precip,
            'y202207_avg_precip': self.y202207_avg_precip,
            'y202208_avg_precip': self.y202208_avg_precip,
            'y202209_avg_precip': self.y202209_avg_precip,
            'y202210_avg_precip': self.y202210_avg_precip,
            'y202211_avg_precip': self.y202211_avg_precip,
            'y202212_avg_precip': self.y202212_avg_precip,
            
            # 2023年降水数据
            'y202301_avg_precip': self.y202301_avg_precip,
            'y202302_avg_precip': self.y202302_avg_precip,
            'y202303_avg_precip': self.y202303_avg_precip,
            'y202304_avg_precip': self.y202304_avg_precip,
            'y202305_avg_precip': self.y202305_avg_precip,
            'y202306_avg_precip': self.y202306_avg_precip,
            'y202307_avg_precip': self.y202307_avg_precip,
            'y202308_avg_precip': self.y202308_avg_precip,
            'y202309_avg_precip': self.y202309_avg_precip,
            'y202310_avg_precip': self.y202310_avg_precip,
            'y202311_avg_precip': self.y202311_avg_precip,
            'y202312_avg_precip': self.y202312_avg_precip,
        }