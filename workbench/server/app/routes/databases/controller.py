from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.engine import get_system_db
from database.models import Database
from queryhandlers import DatabaseQueryHandler
from .dto import (
    CreateDatabaseDto,
    FindDatabaseDto,
    TestDatabaseConnectionRequestDto,
    TestDatabaseConnectionResponseDto,
    UpdateDatabaseDto,
)

router = APIRouter(
    prefix="/databases",
    tags=["Databases"],
)


@router.get("")
async def find_databases(
    traindb_id: int, db: Session = Depends(get_system_db)
) -> List[FindDatabaseDto]:
    return (
        db.query(Database)
        .filter(Database.traindb_id == traindb_id)
        .order_by(Database.updated_at.desc())
        .all()
    )


@router.get("/{database_id}")
async def find_database(
    database_id: int, db: Session = Depends(get_system_db)
) -> FindDatabaseDto:
    return db.query(Database).filter(Database.id == database_id).first()


@router.post("")
async def create_database(dto: CreateDatabaseDto, db: Session = Depends(get_system_db)):
    database = Database(**dto.model_dump())
    db.add(database)
    db.commit()


@router.post("/test_connection")
async def test_connection(
    dto: TestDatabaseConnectionRequestDto,
) -> TestDatabaseConnectionResponseDto:
    handler = DatabaseQueryHandler(
        dto.dbms,
        dto.host,
        dto.port,
        dto.username,
        dto.password,
        dto.server_host,
        dto.server_port,
        dto.database,
    )
    return TestDatabaseConnectionResponseDto(success=handler.test_connection())


@router.put("/{database_id}")
async def update_database(
    database_id: int, dto: UpdateDatabaseDto, db: Session = Depends(get_system_db)
):
    db.query(Database).filter(Database.id == database_id).update(dto.model_dump())
    db.commit()


@router.delete("/{database_id}")
async def delete_database(database_id: int, db: Session = Depends(get_system_db)):
    database = db.query(Database).filter(Database.id == database_id).first()
    if database:
        db.delete(database)
        db.commit()
