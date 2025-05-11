from sqlalchemy import Column, Integer, String, JSON
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    color_rankings = Column(JSON, nullable=False, default=dict)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if self.color_rankings is None:
            self.color_rankings = {} 