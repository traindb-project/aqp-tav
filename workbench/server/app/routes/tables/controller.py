from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.engine import get_system_db
from database.models import Database
from queryhandlers import DatabaseQueryHandler
from .dto import Column, Schema, Table, TablePreviewRequest, TablePreviewResponse

router = APIRouter(
    prefix="/tables",
    tags=["Tables"],
)


@router.get("")
async def find_tables(database_id: int, db: Session = Depends(get_system_db)) -> List[Schema]:
    database = db.query(Database).filter(Database.id == database_id).first()
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
    ls = handler.show_tables()
    schemas = {}
    for res in ls:
        schemas[res[0]] = schemas.get(res[0], [])
        schemas[res[0]].append({"name": res[1], "type": res[2]})
    schemas = [{"name": schema, "tables": schemas[schema]} for schema in schemas]
    return [Schema(**schema) for schema in schemas]


@router.get("/{table_name}")
async def describe_table(
        table_name: str,
        database_id: int,
        schema_name: str,
        db: Session = Depends(get_system_db),
):
    database = db.query(Database).filter(Database.id == database_id).first()
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
    names = ("name", "type")
    columns = handler.describe_table(schema_name, table_name)
    return [Column(**dict(zip(names, col))) for col in columns]


@router.post("/preview")
async def preview_table(dto: TablePreviewRequest, db: Session = Depends(get_system_db)):
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
    result = handler.execute_query_and_description(
        f"SELECT {', '.join(dto.columns)} FROM {dto.schema}.{dto.table} LIMIT 50"
    )
    return TablePreviewResponse(columns=result["description"], data=result["data"])