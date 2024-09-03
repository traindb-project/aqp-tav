from typing import List

from pydantic import BaseModel

from database.types import ChartType
from routes.queries.dto import FindQueryDto


class DashboardItemDto(BaseModel):
    x_column: str
    y_column: str
    type: ChartType


class DashboardDto(BaseModel):
    name: str
    traindb_id: int
    query_id: int


class CreateDashboardDto(DashboardDto):
    items: List[DashboardItemDto]


class UpdateDashboardDto(DashboardDto):
    items: List[DashboardItemDto]


class FindDashboardItemDto(DashboardItemDto):
    id: int
    dashboard_id: int


class FindDashboardDto(DashboardDto):
    id: int
    query: FindQueryDto
    items: List[FindDashboardItemDto]