from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.engine import get_system_db
from database.models import Dashboard
from .dto import CreateDashboardDto, FindDashboardDto, UpdateDashboardDto

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("")
async def find_dashboards(
    traindb_id: int, db: Session = Depends(get_system_db)
) -> List[FindDashboardDto]:
    return (
        db.query(Dashboard)
        .filter(Dashboard.traindb_id == traindb_id)
        .order_by(Dashboard.id.desc())
        .all()
    )


@router.post("")
async def create_dashboard(
    dto: CreateDashboardDto, db: Session = Depends(get_system_db)
):
    dashboard = Dashboard(**dto.model_dump())
    db.add(dashboard)
    db.commit()


@router.put("/{dashboard_id}")
async def update_dashboard(
    dashboard_id: int, dto: UpdateDashboardDto, db: Session = Depends(get_system_db)
):
    db.query(Dashboard).filter(Dashboard.id == dashboard_id).update(dto.model_dump())
    db.commit()


@router.delete("/{dashboard_id}")
async def delete_dashboard(dashboard_id: int, db: Session = Depends(get_system_db)):
    dashboard = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()
    if dashboard:
        db.delete(dashboard)
        db.commit()
