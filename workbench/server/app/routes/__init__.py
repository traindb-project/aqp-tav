__all__ = ["include_routers"]

from fastapi import FastAPI


def include_routers(app: FastAPI) -> None:
    from .dashboard.controller import router as dashboard_router
    from .traindbs.controller import router as traindb_router
    from .modeltypes.controller import router as modeltypes_router
    from .databases.controller import router as databases_router
    from .models.controller import router as models_router
    from .synopses.controller import router as synopses_router
    from .tables.controller import router as tables_router
    from .hyperparameters.controller import router as hyperparams_router
    from .queries.controller import router as queries_router

    app.include_router(dashboard_router)
    app.include_router(traindb_router)
    app.include_router(modeltypes_router)
    app.include_router(databases_router)
    app.include_router(models_router)
    app.include_router(synopses_router)
    app.include_router(tables_router)
    app.include_router(hyperparams_router)
    app.include_router(queries_router)
