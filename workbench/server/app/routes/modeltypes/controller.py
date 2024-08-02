from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.engine import get_system_db
from database.models import TrainDB
from queryhandlers import TrainDBQueryHandler
from .dto import CreateModeltypeDto, FindModeltypeDto

router = APIRouter(
    prefix="/modeltypes",
    tags=["Model Types"],
)


@router.get("")
async def find_modeltypes(traindb_id: int, db: Session = Depends(get_system_db)) -> List[FindModeltypeDto]:
    traindb = db.query(TrainDB).filter(TrainDB.id == traindb_id).first()
    if traindb is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="TrainDB not found")
    handler = TrainDBQueryHandler(
        traindb.host,
        traindb.port,
        traindb.username,
        traindb.password,
    )
    modeltypes = handler.show_modeltypes()
    columns = ("name", "category", "location", "className", "uri")
    return [FindModeltypeDto(**dict(zip(columns, modeltype))) for modeltype in modeltypes]


@router.post("")
async def create_modeltype(traindb_id: int, dto: CreateModeltypeDto, db: Session = Depends(get_system_db)):
    traindb = db.query(TrainDB).filter(TrainDB.id == traindb_id).first()
    if traindb is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="TrainDB not found")
    handler = TrainDBQueryHandler(
        traindb.host,
        traindb.port,
        traindb.username,
        traindb.password,
    )
    modeltype_names = [modeltype[0] for modeltype in handler.show_modeltypes()]
    if dto.name in modeltype_names:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Model Type Name already exists")
    handler.execute_statement(
        f"CREATE MODELTYPE {dto.name} FOR {dto.category} AS {dto.location} CLASS '{dto.className}' IN '{dto.uri}'"
    )


@router.delete("/{name}")
async def delete_modeltype(name: str, traindb_id: int, db: Session = Depends(get_system_db)):
    traindb = db.query(TrainDB).filter(TrainDB.id == traindb_id).first()
    if traindb is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="TrainDB not found")
    handler = TrainDBQueryHandler(
        traindb.host,
        traindb.port,
        traindb.username,
        traindb.password,
    )
    modeltype_names = [modeltype[0] for modeltype in handler.show_modeltypes()]
    if name not in modeltype_names:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ModelType not found")
    handler.execute_statement(
        f"DROP MODELTYPE {name}"
    )
