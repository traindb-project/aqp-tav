import asyncio
import logging
import os
from logging.handlers import TimedRotatingFileHandler

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from env import IS_DEV, LOG_DIR


class LoggingHandler(TimedRotatingFileHandler):
    def __init__(self, filename, when="midnight", interval=1, backupCount=7):
        TimedRotatingFileHandler.__init__(
            self,
            filename,
            when=when,
            interval=interval,
            backupCount=backupCount,
            encoding='utf-8'
        )
        self.loop = asyncio.get_event_loop()

    def emit(self, record):
        try:
            asyncio.run_coroutine_threadsafe(self.send_log_to_socketio(record), self.loop)
            TimedRotatingFileHandler.emit(self, record)
        except Exception as e:
            self.handleError(e)


class _Logger(object):
    def __init__(self):
        self.logger = None

    def debug(self, msg: str, *args, **kwargs):
        self.logger.debug(msg, *args, **kwargs)

    def error(self, msg: str, *arg, **kwargs) -> None:
        self.logger.error(msg, *arg, **kwargs)

    def info(self, msg: str, *arg, **kwargs) -> None:
        self.logger.info(msg, *arg, **kwargs)


logger = _Logger()


def initialize(app: FastAPI) -> None:
    init_logger()
    init_middleware(app)


def init_logger() -> None:
    os.makedirs(LOG_DIR, exist_ok=True)
    log_level = logging.DEBUG if IS_DEV else logging.INFO
    log_formatter = logging.Formatter("%(asctime)s [%(levelname)s]: %(message)s", datefmt="%Y-%m-%d %H:%M:%S")
    log_handler = LoggingHandler(LOG_DIR / "app.log")
    logger.logger = logging.getLogger("MAIN")
    logging.basicConfig(level=log_level)
    logger.logger.setLevel(log_level)
    logger.logger.addHandler(log_handler)


def init_middleware(app: FastAPI) -> None:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
