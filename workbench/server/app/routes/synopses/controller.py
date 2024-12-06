from io import BytesIO
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
import jpype
from sqlalchemy.orm import Session
from starlette.responses import StreamingResponse

from database.engine import get_system_db
from database.models import Database, TrainDB
from queryhandlers import DatabaseQueryHandler, TrainDBQueryHandler
from celery_app import celery_app
from .dto import CreateSynopsis, FindSynopsis, UpdateSynopsis

router = APIRouter(
    prefix="/synopses",
    tags=["Synopses"],
)


@router.get("")
async def find_synopses(
    traindb_id: int, db: Session = Depends(get_system_db)
) -> List[FindSynopsis]:
    def map_fn(model):
        model["rows"] = int(model["rows"])
        model["columns"] = model["columns"][1:-1].split(", ")
        return model

    traindb = db.query(TrainDB).filter(TrainDB.id == traindb_id).first()
    if not traindb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="TrainDB not found"
        )
    handler = TrainDBQueryHandler(
        traindb.host,
        traindb.port,
        traindb.username,
        traindb.password,
    )

    models = handler.show_synopses()
    columns = (
        "name",
        "model",
        "schema",
        "table",
        "columns",
        "rows",
        "ratio",
        "external",
        "status",
        "statistics",
    )
    ls = [dict(zip(columns, model)) for model in models]
    return [FindSynopsis(**model) for model in map(map_fn, ls)]


@router.get("/{name}/export")
async def export_synopsis(
    name: str, traindb_id: int, db: Session = Depends(get_system_db)
):
    traindb = db.query(TrainDB).filter(TrainDB.id == traindb_id).first()
    if not traindb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="TrainDB not found"
        )
    handler = TrainDBQueryHandler(
        traindb.host,
        traindb.port,
        traindb.username,
        traindb.password,
    )
    response = handler.execute_query_and_fetch_one(f"EXPORT SYNOPSIS {name}")
    binary = response[0]
    return StreamingResponse(
        BytesIO(binary),
        media_type="application/octet-stream",
        headers={f"Content-Disposition": f"attachment; filename={name}.zip"},
    )


@router.post("")
async def create_synopsis(
    database_id: int, dto: CreateSynopsis, db: Session = Depends(get_system_db)
):
    database = db.query(Database).filter(Database.id == database_id).first()
    if not database:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Database not found"
        )
    handler = DatabaseQueryHandler(
        database.dbms,
        database.host,
        database.port,
        database.username,
        database.password,
        database.traindb.host,
        database.traindb.port,
        database.database,
    )
    # query = (
    #     f"CREATE SYNOPSIS {dto.name} "
    #     f"FROM MODEL {dto.model} "
    #     f"LIMIT {dto.limit_rows} {'PERCENT' if dto.is_percent else 'ROWS'}"
    # )
    if dto.name in map(lambda x: x[0], handler.show_synopses()):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Synopsis Name already exists"
        )
    # handler.execute_statement(query)
    config = {
        "dbms": database.dbms,
        "host": database.host,
        "port": database.port,
        "username": database.username,
        "password": database.password,
        "traindb": {
            "host": database.traindb.host,
            "port": database.traindb.port,
        },
    }
    task = celery_app.send_task(
        "main.execute_statement", args=[dto.model_dump(), config]
    )
    return {"task_id": task.id}


@router.post("/{name}/import")
async def import_synopsis(
    name: str, traindb_id: int, file: UploadFile, db: Session = Depends(get_system_db)
):
    traindb = db.query(TrainDB).filter(TrainDB.id == traindb_id).first()
    if not traindb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="TrainDB not found"
        )
    handler = TrainDBQueryHandler(
        traindb.host,
        traindb.port,
        traindb.username,
        traindb.password,
    )
    if name in map(lambda x: x[0], handler.show_synopses()):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Synopsis Name already exists"
        )

    binary = await file.read()
    ByteArray = jpype.JArray(jpype.JByte)
    model_binary = ByteArray(binary)
    handler.execute_cursor(f"IMPORT SYNOPSIS {name} FROM ?", [model_binary])


@router.put("/{name}")
async def update_synopsis(
    name: str,
    traindb_id: int,
    dto: UpdateSynopsis,
    db: Session = Depends(get_system_db),
):
    traindb = db.query(TrainDB).filter(TrainDB.id == traindb_id).first()
    if not traindb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="TrainDB not found"
        )
    handler = TrainDBQueryHandler(
        traindb.host,
        traindb.port,
        traindb.username,
        traindb.password,
    )
    if dto.name:
        handler.execute_statement(f"ALTER SYNOPSIS {name} RENAME TO {dto.name}")
    if dto.status:
        handler.execute_statement(
            f"ALTER SYNOPSIS {name} {'ENABLE' if dto.status == 'ENABLED' else 'DISABLE'}"
        )


@router.delete("/{name}")
async def delete_synopsis(
    name: str, traindb_id: int, db: Session = Depends(get_system_db)
):
    traindb = db.query(TrainDB).filter(TrainDB.id == traindb_id).first()
    if not traindb:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Database not found"
        )
    handler = TrainDBQueryHandler(
        traindb.host,
        traindb.port,
        traindb.username,
        traindb.password,
    )
    handler.execute_statement(f"DROP SYNOPSIS {name}")
