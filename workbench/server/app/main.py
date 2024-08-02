from contextlib import asynccontextmanager
from fastapi import FastAPI
from routes import include_routers
from core import initialize


async def startup():
    pass


async def shutdown():
    pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    await startup()
    yield
    await shutdown()


app = FastAPI(
    root_path="/api",
    docs_url="/docs",
    redoc_url="/redoc",
    title="TrainDB APIs",
    lifespan=lifespan
)

initialize(app)
include_routers(app)
