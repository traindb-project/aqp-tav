from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum, ForeignKey,
    Integer,
    String,
)

from sqlalchemy.orm import relationship
from .engine import Base, init_db
from .types import ChartType, EncryptedString


class TrainDB(Base):
    __tablename__ = 'traindbs'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, index=True, nullable=False)
    username = Column(String)
    password = Column(EncryptedString)
    host = Column(String)
    port = Column(Integer)
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())


class Database(Base):
    __tablename__ = 'databases'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, index=True, nullable=False)
    dbms = Column(String, nullable=False)
    host = Column(String, nullable=False)
    port = Column(Integer, nullable=False)
    username = Column(String)
    password = Column(EncryptedString)
    traindb_id = Column(Integer, ForeignKey("traindbs.id", ondelete="CASCADE"))
    traindb = relationship("TrainDB", foreign_keys=[traindb_id])
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())


class Query(Base):
    __tablename__ = 'queries'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, index=True, nullable=False)
    is_approximate = Column(Boolean, default=False)
    sql = Column(String, nullable=False)
    traindb_id = Column(Integer, ForeignKey("traindbs.id", ondelete="CASCADE"))
    traindb = relationship("TrainDB", foreign_keys=[traindb_id])
    database_id = Column(Integer, ForeignKey("databases.id", ondelete="CASCADE"))
    database = relationship("Database", foreign_keys=[database_id])
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())


class Dashboard(Base):
    __tablename__ = 'dashboards'
    id = Column(Integer, primary_key=True, autoincrement=True)
    traindb_id = Column(Integer, ForeignKey("traindbs.id", ondelete="CASCADE"))
    name = Column(String, index=True, nullable=False)
    query_id = Column(Integer, ForeignKey("queries.id", ondelete="CASCADE"))
    query = relationship("Query", foreign_keys=[query_id])
    created_at = Column(DateTime, default=datetime.now())
    updated_at = Column(DateTime, default=datetime.now(), onupdate=datetime.now())

    items = relationship("DashboardItem", backref="dashboard")


class DashboardItem(Base):
    __tablename__ = 'dashboard_items'
    id = Column(Integer, primary_key=True, autoincrement=True)
    dashboard_id = Column(Integer, ForeignKey("dashboards.id", ondelete="CASCADE"))
    x_column = Column(String, nullable=False)
    y_column = Column(String, nullable=False)
    type = Column(Enum(ChartType), nullable=False)


init_db()
