from typing import Any, List

from pydantic import BaseModel


class Model(BaseModel):
    name: str
    modeltype: str
    schema: str
    table: str
    columns: List[str]
    table_rows: int
    trained_rows: int
    status: str
    server: str | None = None
    start: str | None = None
    training_status: str | None = None
    options: Any


class FindModelDto(Model):
    pass


class TrainModelOptionDto(BaseModel):
    value: str


class TrainModelDto(BaseModel):
    database_id: int
    schema: str
    table: str
    columns: List[str]
    modeltype: str
    sample: str | None = None
    options: List[TrainModelOptionDto]


class UpdateModelDto(BaseModel):
    status: str | None = None


class ImportModelDto(BaseModel):
    file: str
