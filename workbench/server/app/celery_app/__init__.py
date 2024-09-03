__all__ = ["celery_app"]

from celery import Celery

from env import REDIS_URL, REDIS_WORKER_INDEX

celery_app = Celery(
    "tasks",
    broker=f"{REDIS_URL}/{REDIS_WORKER_INDEX}",
    backend=f"{REDIS_URL}/{REDIS_WORKER_INDEX}"
)
