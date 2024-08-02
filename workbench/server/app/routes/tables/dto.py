from typing import Any, List

from pydantic import BaseModel


class Table(BaseModel):
    name: str
    type: str


class Schema(BaseModel):
    name: str
    tables: List[Table]


class Column(BaseModel):
    name: str
    type: str


class TablePreviewRequest(BaseModel):
    database_id: int
    schema: str
    table: str
    columns: List[str]


class TablePreviewResponse(BaseModel):
    columns: List[str]
    data: List[List[Any]]
