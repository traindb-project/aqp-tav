from typing import List

from pydantic import BaseModel


class Synopsis(BaseModel):
    name: str
    model: str
    schema: str
    table: str
    columns: List[str]
    rows: int
    ratio: str
    external: str
    status: str
    statistics: str


class FindSynopsis(Synopsis):
    pass


class CreateSynopsis(BaseModel):
    name: str
    model: str
    limit_rows: str
    is_percent: bool | None = None


class UpdateSynopsis(BaseModel):
    name: str | None = None
    status: str | None = None
