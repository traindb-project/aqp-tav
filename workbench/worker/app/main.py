from celery import Celery
from env import REDIS_URL, REDIS_WORKER_INDEX
from queryhandlers import DatabaseQueryHandler

app = Celery(
    "tasks",
    broker=f"{REDIS_URL}/{REDIS_WORKER_INDEX}",
    backend=f"{REDIS_URL}/{REDIS_WORKER_INDEX}",
    include=["main"]
)

app.conf.update(
    task_routes={
        "task.*": {"queue": "default"}
    }
)


@app.task
def execute_statement(dto, config):
    handler = DatabaseQueryHandler(
        config["dbms"],
        config["host"],
        config["port"],
        config["username"],
        config["password"],
        config["traindb"]["host"],
        config["traindb"]["port"],
    )
    query = (
        f"CREATE SYNOPSIS {dto['name']} "
        f"FROM MODEL {dto['model']} "
        f"LIMIT {dto['limit_rows']} {'PERCENT' if dto['is_percent'] else 'ROWS'}"
    )
    handler.execute_statement(query)
    return "create synopsis"
