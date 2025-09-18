from sqlalchemy import Integer, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from Server.fast_api.resources import Base
from Server.fast_api.model.College_model import CollegeModel


class EvaluationModel(Base):
    __tablename__ = "Evaluation"
    evaluation_id: Mapped[int] = mapped_column(Integer, primary_key=True,autoincrement=True)
    college_id: Mapped[int] = mapped_column(Integer, ForeignKey('College.college_id'), nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    Dietary_evaluation: Mapped[str] = mapped_column(Text, nullable=True)
    Traffic_evaluation: Mapped[str] = mapped_column(Text, nullable=True)
    Evaluation: Mapped[str] = mapped_column(Text, nullable=True)

    def serialize(self):
        return {
            'evaluation_id': self.evaluation_id,
            'college_id': self.college_id,
            'user_id': self.user_id,
            'Dietary_evaluation': self.Dietary_evaluation,
            'Traffic_evaluation': self.Traffic_evaluation,
            'Evaluation': self.Evaluation,
        }