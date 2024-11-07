from datetime import datetime
from typing import Any, List

from pydantic import BaseModel

from routes.databases.dto import FindDatabaseDto
from routes.traindbs.dto import FindTrainDBDto


class Query(BaseModel):
    name: str
    traindb_id: int
    database_id: int
    is_approximate: bool
    sql: str


class FindQueryDto(Query):
    id: int
    traindb: FindTrainDBDto
    database: FindDatabaseDto
    created_at: datetime
    updated_at: datetime


class CreateQueryDto(Query):
    pass


class UpdateQueryDto(Query):
    pass


class RunQueryResponseDto(BaseModel):
    columns: List[str]
    types: List[str]
    data: List[List[Any]]
    execution_time: float | int
