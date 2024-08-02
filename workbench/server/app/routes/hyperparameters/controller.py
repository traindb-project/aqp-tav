from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.engine import get_system_db
from database.models import TrainDB
from queryhandlers import TrainDBQueryHandler
from .dto import Hyperparameter

router = APIRouter(
    prefix="/hyperparameters",
    tags=["Hyper Parameters"],
)


@router.get("")
async def find_hyperparameters(traindb_id: int, db: Session = Depends(get_system_db)):
    traindb = db.query(TrainDB).filter(TrainDB.id == traindb_id).first()
    if not traindb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="TrainDB not found")
    handler = TrainDBQueryHandler(
        traindb.host,
        traindb.port,
        traindb.username,
        traindb.password,
    )
    columns = ("modeltype", "name", "type", "default_value", "description")
    hyperparams = handler.show_hyperparameters()
    return [Hyperparameter(**dict(zip(columns, hyperparam))) for hyperparam in hyperparams]
