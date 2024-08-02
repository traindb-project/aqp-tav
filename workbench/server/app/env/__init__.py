__all__ = [
    "APP_KEY_PATH",
    "DB_URL",
    "IS_DEV",
    "LOG_DIR",
    "TRAINDB_DRIVER_PATH"
]

import os
from pathlib import Path

IS_DEV = str(os.environ.get("IS_DEV", False)).lower() in ["true", "y", "yes", "1", "on"]
LOG_DIR = Path("/var/log/traindbs")
TRAINDB_DRIVER_PATH = Path("/app/drivers/traindb-jdbc-0.1-SNAPSHOT.jar")
CONFIG_DIR = Path("/etc/traindb/workbench")
os.makedirs(CONFIG_DIR, exist_ok=True)

# Database
DB_HOST = os.environ.get("POSTGRES_HOST", "localhost")
DB_PORT = os.environ.get("POSTGRES_PORT", "5432")
DB_USER = os.environ.get("POSTGRES_USER", "postgres")
DB_PASSWORD = os.environ.get("POSTGRES_PASSWORD", "")
DB_NAME = os.environ.get("POSTGRES_DB", "workbench")
DB_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Config
APP_KEY_FILE = "app.key"
APP_KEY_PATH = CONFIG_DIR / APP_KEY_FILE
