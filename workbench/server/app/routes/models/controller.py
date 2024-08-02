import json
from io import BytesIO
from typing import List

import jpype
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database.engine import get_system_db
from database.models import Database, TrainDB
from queryhandlers import DatabaseQueryHandler, TrainDBQueryHandler
from .dto import FindModelDto, TrainModelDto, UpdateModelDto

router = APIRouter(
    prefix="/models",
    tags=["Models"],
)


@router.get("")
async def find_models(traindb_id: int, db: Session = Depends(get_system_db)) -> List[FindModelDto]:
    def map_fn(model):
        cols = model["columns"]
        model["columns"] = cols[1:-1].split(", ") if cols[0] == "[" and cols[-1] == "]" else [cols]
        model["options"] = json.loads(model["options"])
        return model

    def merge(model, trainings):
        for training in trainings:
            name, server, start, training_status = training
            if model["name"] == name:
                model["server"] = server
                model["start"] = start
                model["training_status"] = training_status
        return model

    traindb = db.query(TrainDB).filter(TrainDB.id == traindb_id).first()
    if not traindb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="TrainDB not found")
    handler = TrainDBQueryHandler(
        traindb.host,
        traindb.port,
        traindb.username,
        traindb.password,
    )
    models = handler.show_models()
    columns = ("name", "modeltype", "schema", "table", "columns", "table_rows", "trained_rows", "status", "options")
    ls = (dict(zip(columns, model)) for model in models)
    training_list = handler.show_trainings()
    ls = (merge(model, training_list) for model in ls)
    return [FindModelDto(**model) for model in map(map_fn, ls)]


@router.get("/{name}/export")
async def export_model(name: str, traindb_id: int, db: Session = Depends(get_system_db)):
    traindb = db.query(TrainDB).filter(TrainDB.id == traindb_id).first()
    if not traindb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="TrainDB not found")
    handler = TrainDBQueryHandler(
        traindb.host,
        traindb.port,
        traindb.username,
        traindb.password,
    )
    response = handler.execute_query_and_fetch_one(f"EXPORT MODEL {name}")
    binary = response[0]
    return StreamingResponse(
        BytesIO(binary),
        media_type="application/octet-stream",
        headers={
            f"Content-Disposition": f"attachment; filename={name}.zip"
        }
    )


@router.post("/{name}/import")
async def import_model(
        name: str,
        traindb_id: int,
        file: UploadFile,
        db: Session = Depends(get_system_db)):
    traindb = db.query(TrainDB).filter(TrainDB.id == traindb_id).first()
    if not traindb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="TrainDB not found")
    handler = TrainDBQueryHandler(
        traindb.host,
        traindb.port,
        traindb.username,
        traindb.password,
    )
    binary = await file.read()
    handler.execute_statement(f"IMPORT MODEL {name} FROM ?", [binary])
    # ByteArray = jpype.JArray(jpype.JByte)
    # model_bytes = ByteArray(binary)
    # handler.execute_statement(f"IMPORT MODEL {name} FROM ?", [model_bytes])


@router.post("/train")
async def train_model(dto: TrainModelDto, db: Session = Depends(get_system_db)) -> None:
    database = db.query(Database).filter(Database.id == dto.database_id).first()
    if not database:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Database not found")
    handler = DatabaseQueryHandler(
        database.dbms,
        database.host,
        database.port,
        database.username,
        database.password,
        database.traindb.host,
        database.traindb.port,
    )
    params = ', '.join(map(lambda x: f"'{x.name}' = '{x.value}'", filter(lambda x: bool(x.value.strip()), dto.options)))
    if dto.name in map(lambda x: x[0], handler.show_models()):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Model name already exists")

    query = (
        f"TRAIN MODEL {dto.name} "
        f"MODELTYPE {dto.modeltype} "
        f"ON {dto.schema}.{dto.table}({', '.join(dto.columns)})"
    )
    if dto.sample:
        query += f" SAMPLE {dto.sample} PERCENT"
    query += f" OPTIONS ( {params} )"
    handler.execute_statement(query)


@router.put("/{name}")
async def update_model(traindb_id: int, name: str, dto: UpdateModelDto, db: Session = Depends(get_system_db)) -> None:
    traindb = db.query(TrainDB).filter(TrainDB.id == traindb_id).first()
    if not traindb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="TrainDB not found")
    handler = TrainDBQueryHandler(
        traindb.host,
        traindb.port,
        traindb.username,
        traindb.password,
    )
    if dto.status:
        handler.execute_statement(f"ALTER MODEL {name} {'ENABLE' if dto.status == 'ENABLED' else 'DISABLE'}")
    if dto.name:
        handler.execute_statement(f"ALTER MODEL {name} RENAME TO {dto.name}")


@router.delete("/{name}")
async def delete_model(
        name: str,
        traindb_id: int,
        db: Session = Depends(get_system_db)
) -> None:
    traindb = db.query(TrainDB).filter(TrainDB.id == traindb_id).first()
    if not traindb:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Database not found")
    handler = TrainDBQueryHandler(
        traindb.host,
        traindb.port,
        traindb.username,
        traindb.password,
    )
    handler.execute_statement(f"DROP MODEL {name}")
