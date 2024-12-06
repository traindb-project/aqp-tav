import json
from io import BytesIO
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse
import jpype
from sqlalchemy.orm import Session

from database.engine import get_system_db
from database.models import Database, TrainDB
from queryhandlers import DatabaseQueryHandler, TrainDBQueryHandler
from .dto import AdditionalTrainModelDto, FindModelDto, TrainModelDto, UpdateModelDto

router = APIRouter(
    prefix="/models",
    tags=["Models"],
)


@router.get("")
async def find_models(
    traindb_id: int, db: Session = Depends(get_system_db)
) -> List[FindModelDto]:
    def map_fn(model):
        result = {}
        result["name"] = model["name"]
        result["modeltype"] = model["modeltype"]
        cols = model["columns"]
        result["schemas"] = [
            {
                "schema": model["schema"],
                "table": {
                    "name": model["table"],
                    "columns": (
                        cols[1:-1].split(", ")
                        if cols[0] == "[" and cols[-1] == "]"
                        else [cols]
                    ),
                },
            }
        ]
        result["on"] = []
        result["table_rows"] = model.get("table_rows")
        result["trained_rows"] = model.get("trained_rows")
        result["status"] = model.get("status")
        result["server"] = model.get("server")
        result["start"] = model.get("start")
        result["training_status"] = model.get("training_status")
        result["options"] = json.loads(model.get("options"))
        print("RESULT:::", result)
        return result

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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="TrainDB not found"
        )
    handler = TrainDBQueryHandler(
        traindb.host,
        traindb.port,
        traindb.username,
        traindb.password,
    )
    models = handler.show_models()
    columns = (
        "name",
        "modeltype",
        "schema",
        "table",
        "columns",
        "table_rows",
        "trained_rows",
        "status",
        "options",
    )
    ls = (dict(zip(columns, model)) for model in models)
    training_list = handler.show_trainings()
    ls = (merge(model, training_list) for model in ls)
    return [FindModelDto(**model) for model in map(map_fn, ls)]


@router.get("/{name}/export")
async def export_model(
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
    response = handler.execute_query_and_fetch_one(f"EXPORT MODEL {name}")
    binary = response[0]
    return StreamingResponse(
        BytesIO(binary),
        media_type="application/octet-stream",
        headers={f"Content-Disposition": f"attachment; filename={name}.zip"},
    )


@router.post("/{name}/import")
async def import_model(
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
    if name in map(lambda x: x[0], handler.show_models()):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Model name already exists"
        )
    print("BEFORE IMPORT MODEL...")
    binary = await file.read()
    ByteArray = jpype.JArray(jpype.JByte)
    model_binary = ByteArray(binary)
    try:
        handler.execute_cursor(f'IMPORT MODEL "{name}" FROM ?', [model_binary])
    except Exception as e:
        print("ERROR:::", e)
        raise e
    print("AFTER IMPORT MODEL!!!")
    # ByteArray = jpype.JArray(jpype.JByte)
    # model_bytes = ByteArray(binary)
    # handler.execute_statement(f"IMPORT MODEL {name} FROM ?", [model_bytes])


@router.post("/train")
async def train_model(dto: TrainModelDto, db: Session = Depends(get_system_db)) -> None:
    database = db.query(Database).filter(Database.id == dto.database_id).first()
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
    params = ", ".join(
        map(
            lambda x: f"'{x.name}' = '{x.value}'",
            filter(lambda x: bool(x.value.strip()), dto.options),
        )
    )

    print("PARAMS:::", params)

    if dto.name in map(lambda x: x[0], handler.show_models()):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Model name already exists"
        )

    query = f'TRAIN MODEL "{dto.name}" MODELTYPE {dto.modeltype} FROM {dto.schemas[0].schema}.{dto.schemas[0].table.name}({",".join(dto.schemas[0].table.columns)})'
    print("QUERY1:::", query)
    for schema in dto.schemas[1:]:
        query += f" JOIN {schema.schema}.{schema.table.name}({','.join(schema.table.columns)})"
    print("QUERY2:::", query)
    if dto.on is not None:
        for on in dto.on:
            query += f" ON {on[0]} = {on[1]}"
    if dto.sample is not None:
        query += f" SAMPLE {dto.sample} PERCENT"
    print("QUERY3:::", query)
    query += f" OPTIONS ( {params} )"
    print("QUERY4:::", query)

    handler.execute_statement(query)


@router.post("/{name}/additional-train")
async def additional_train_model(
    name: str, dto: AdditionalTrainModelDto, db: Session = Depends(get_system_db)
) -> None:
    # wyjang: 나중에 트레인디비에서 가져오는 건지 아니면 MySQL에서 가져오는 건지 확인
    database = db.query(Database).filter(Database.id == dto.database_id).first()
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
    if dto.name in map(lambda x: x[0], handler.show_models()):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Model name already exists"
        )
    params = ", ".join(
        map(
            lambda x: f"'{x.name}' = '{x.value}'",
            filter(lambda x: bool(x.value.strip()), dto.options),
        )
    )
    query = f'TRAIN MODEL {dto.name} UPDATE "{name}"'
    if len(dto.on) > 0:
        query += f" ON {dto.on[0]}"
    for on in dto.on[1:]:
        query += f" AND {on}"
    if dto.sample is not None:
        query += f" SAMPLE {dto.sample} PERCENT"
    query += f" OPTIONS ( {params} )"  # wyjang: 나중에 하이퍼파라미터 추가
    print("QUERY:::", query)
    handler.execute_statement(query)


@router.put("/{name}")
async def update_model(
    traindb_id: int,
    name: str,
    dto: UpdateModelDto,
    db: Session = Depends(get_system_db),
) -> None:
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
    if dto.status:
        handler.execute_statement(
            f"ALTER MODEL {name} {'ENABLE' if dto.status == 'ENABLED' else 'DISABLE'}"
        )
    if dto.name:
        handler.execute_statement(f"ALTER MODEL {name} RENAME TO {dto.name}")


@router.delete("/{name}")
async def delete_model(
    name: str, traindb_id: int, db: Session = Depends(get_system_db)
) -> None:
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
    handler.execute_statement(f"DROP MODEL {name}")
