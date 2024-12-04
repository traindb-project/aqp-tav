from typing import Any, List, Tuple

from pydantic import BaseModel


class ModelTable(BaseModel):
    name: str
    columns: List[str]


class ModelSchema(BaseModel):
    schema: str
    table: ModelTable


class JoinColumn(BaseModel):
    schema: str
    table: str
    column: str


class Model(BaseModel):
    name: str
    modeltype: str
    schemas: List[ModelSchema]
    on: List[Tuple[JoinColumn, JoinColumn]]
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
    name: str
    value: str


class TrainModelDto(BaseModel):
    name: str
    database_id: int
    modeltype: str
    schemas: List[ModelSchema]
    sample: str | None = None
    on: List[Tuple[str, str]] | None = None
    options: List[TrainModelOptionDto]


class AdditionalTrainModelDto(BaseModel):
    name: str
    database_id: int
    sample: str | None = None
    on: List[str]
    options: List[TrainModelOptionDto]


class UpdateModelDto(BaseModel):
    status: str | None = None


class ImportModelDto(BaseModel):
    file: str
