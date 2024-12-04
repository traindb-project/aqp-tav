from datetime import datetime
from typing import List, Literal

from pydantic import BaseModel

from database.types import ChartType
from routes.queries.dto import FindQueryDto


class BaseDashboardItemDto(BaseModel):
    title: str | None = None
    type: ChartType


class TableItemDto(BaseDashboardItemDto):
    type: Literal[ChartType.TABLE]
    columns: List[str] = []


class ChartItemDto(BaseDashboardItemDto):
    type: Literal[ChartType.BAR, ChartType.LINE, ChartType.SCATTER, ChartType.PIE]
    x_column: str
    y_column: str
    min_y: int | None = None
    max_y: int | None = None


class MapItemDto(BaseDashboardItemDto):
    type: Literal[ChartType.MAP]
    x_column: str | None = None
    y_column: str | None = None
    geo_column: str


# class BubbleChartItemDto(ChartItemDto):
#     z_column: str
#     type: Literal[ChartType.BUBBLE]


DashboardItemDto = TableItemDto | ChartItemDto | MapItemDto


class DashboardDto(BaseModel):
    name: str
    traindb_id: int
    query_id: int


class CreateDashboardDto(DashboardDto):
    items: List[DashboardItemDto]


class UpdateDashboardDto(DashboardDto):
    items: List[DashboardItemDto]


class FindDashboardDto(DashboardDto):
    id: int
    query: FindQueryDto
    items: List[DashboardItemDto]
    created_at: datetime
    updated_at: datetime
