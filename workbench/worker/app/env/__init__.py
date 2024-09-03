__all__ = [
    "REDIS_URL",
    "REDIS_WORKER_INDEX",
    "TRAINDB_DRIVER_PATH"
]

import os
from pathlib import Path

REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379")
REDIS_WORKER_INDEX = os.environ.get("REDIS_WORKER_INDEX", "0")
TRAINDB_DRIVER_PATH = Path("/app/drivers/traindb-jdbc-0.1-SNAPSHOT.jar")
