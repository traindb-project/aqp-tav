import time
from typing import List

from database.engine import get_system_db
from database.models import Query
from fastapi import APIRouter, Depends, HTTPException, status
from queryhandlers import DatabaseQueryHandler
from sqlalchemy.orm import Session

from .dto import CreateQueryDto, FindQueryDto, RunQueryResponseDto, UpdateQueryDto

router = APIRouter(
    prefix="/queries",
    tags=["Queries"],
)


@router.get("")
async def find_queries(
    traindb_id: int, db: Session = Depends(get_system_db)
) -> List[FindQueryDto]:
    return (
        db.query(Query)
        .filter(Query.traindb_id == traindb_id)
        .order_by(Query.updated_at.desc())
        .all()
    )


@router.get("/{query_id}")
async def find_query(
    query_id: int, db: Session = Depends(get_system_db)
) -> FindQueryDto:
    return db.query(Query).filter(Query.id == query_id).first()


@router.get("/{query_id}/run")
async def run_query(
    query_id: int, db: Session = Depends(get_system_db)
) -> RunQueryResponseDto:
    query = db.query(Query).filter(Query.id == query_id).first()
    if not query:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Query not found"
        )
    handler = DatabaseQueryHandler(
        query.database.dbms,
        query.database.host,
        query.database.port,
        query.database.username,
        query.database.password,
        query.traindb.host,
        query.traindb.port,
    )
    query = query.sql.strip()
    query = query[:-1] if query[-1] == ";" else query
    print(query)
    start_time = time.perf_counter()
    result = handler.execute_query_and_description(query)
    end_time = time.perf_counter()
    execution_time = end_time - start_time
    return RunQueryResponseDto(
        columns=result["columns"],
        types=result["types"],
        data=result["data"],
        execution_time=execution_time,
    )


@router.post("")
async def create_query(dto: CreateQueryDto, db: Session = Depends(get_system_db)):
    query = Query(**dto.model_dump())
    db.add(query)
    db.commit()


@router.put("/{query_id}")
async def update_query(
    query_id: int, dto: UpdateQueryDto, db: Session = Depends(get_system_db)
):
    db.query(Query).filter(Query.id == query_id).update(dto.model_dump())
    db.commit()


@router.delete("/{query_id}")
async def delete_query(query_id: int, db: Session = Depends(get_system_db)):
    query = db.query(Query).filter(Query.id == query_id).first()
    if query:
        db.delete(query)
        db.commit()
