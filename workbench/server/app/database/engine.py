__all__ = [
    "Base",
    "init_db",
    "get_system_db"
]

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker

from env import DB_URL

engine = create_engine(DB_URL)

Base = declarative_base()

db_session = scoped_session(sessionmaker(autocommit=False, autoflush=False, expire_on_commit=False, bind=engine))


def init_db():
    Base.metadata.create_all(engine)


def get_system_db():
    return db_session
