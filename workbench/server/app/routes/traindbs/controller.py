from typing import List

from database.engine import get_system_db
from database.models import TrainDB
from fastapi import APIRouter, Depends
from queryhandlers import TrainDBQueryHandler
from sqlalchemy.orm import Session

from .dto import (
    CreateTrainDBDto,
    FindTrainDBDto,
    TestTrainDBConnectionRequestDto,
    TestTrainDBConnectionResponseDto,
    UpdateTrainDBDto,
)

router = APIRouter(
    prefix="/traindbs",
    tags=["TrainDB"],
)


@router.get("")
async def find_traindbs(db: Session = Depends(get_system_db)) -> List[FindTrainDBDto]:
    print("find_traindbs")
    return db.query(TrainDB).order_by(TrainDB.updated_at.desc()).all()


@router.get("/{traindb_id}")
async def find_traindb(
    traindb_id: int, db: Session = Depends(get_system_db)
) -> FindTrainDBDto:
    return db.query(TrainDB).filter(TrainDB.id == traindb_id).first()


@router.post("/test_connection")
async def test_connection(
    dto: TestTrainDBConnectionRequestDto,
) -> TestTrainDBConnectionResponseDto:
    handler = TrainDBQueryHandler(
        dto.host,
        dto.port,
        dto.username,
        dto.password,
    )
    return TestTrainDBConnectionResponseDto(success=handler.test_connection())


@router.post("")
async def create_traindb(dto: CreateTrainDBDto, db: Session = Depends(get_system_db)):
    traindb = TrainDB(**dto.model_dump())
    db.add(traindb)
    db.commit()


@router.put("/{traindb_id}")
async def update_traindb(
    traindb_id: int, dto: UpdateTrainDBDto, db: Session = Depends(get_system_db)
):
    db.query(TrainDB).filter(TrainDB.id == traindb_id).update(dto.model_dump())
    db.commit()


@router.delete("/{traindb_id}")
async def delete_traindb(traindb_id: int, db: Session = Depends(get_system_db)):
    traindb = db.query(TrainDB).filter(TrainDB.id == traindb_id).first()
    if traindb:
        db.delete(traindb)
        db.commit()
