from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class TrainDBDto(BaseModel):
    host: str
    port: int | str
    username: Optional[str] = None
    password: Optional[str] = None


class TestTrainDBConnectionResponseDto(BaseModel):
    success: bool


class TestTrainDBConnectionRequestDto(TrainDBDto):
    pass


class CreateTrainDBDto(TrainDBDto):
    name: str


class UpdateTrainDBDto(TrainDBDto):
    name: str


class FindTrainDBDto(TrainDBDto):
    id: int
    name: str
    created_at: datetime
    updated_at: datetime
