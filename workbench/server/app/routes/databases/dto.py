from datetime import datetime

from pydantic import BaseModel

from routes.traindbs.dto import FindTrainDBDto


class DatabaseDto(BaseModel):
    dbms: str
    host: str
    port: int
    username: str | None = None
    password: str | None = None


class CreateDatabaseDto(DatabaseDto):
    name: str
    traindb_id: int


class UpdateDatabaseDto(DatabaseDto):
    name: str
    traindb_id: int


class FindDatabaseDto(DatabaseDto):
    id: int
    name: str
    traindb_id: int
    traindb: FindTrainDBDto
    created_at: datetime
    updated_at: datetime


class TestDatabaseConnectionRequestDto(DatabaseDto):
    server_host: str | None = None
    server_port: int | str | None = None


class TestDatabaseConnectionResponseDto(BaseModel):
    success: bool
