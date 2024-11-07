from datetime import datetime
from typing import List, Literal

from pydantic import BaseModel

from database.types import ChartType
from routes.queries.dto import FindQueryDto


class BaseDashboardItemDto(BaseModel):
    title: str | None = None
    type: ChartType


class ChartItemDto(BaseDashboardItemDto):
    x_column: str
    y_column: str
    type: Literal[ChartType.BAR, ChartType.LINE, ChartType.SCATTER, ChartType.PIE]


class BubbleChartItemDto(ChartItemDto):
    z_column: str
    type: Literal[ChartType.BUBBLE]


DashboardItemDto = ChartItemDto | BubbleChartItemDto


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
