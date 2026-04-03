from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database import Base, engine, ensure_task_schedule_columns
from app.routes.auth import router as auth_router
from app.routes.calendar import router as calendar_router
from app.routes.tasks import router as tasks_router
from app.routes.users import router as user_router  # Asegura que el modelo User esté registrado


def create_app() -> FastAPI:
    app = FastAPI(title="Eisenhower API")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins or ["http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    Base.metadata.create_all(bind=engine)
    ensure_task_schedule_columns()

    app.include_router(auth_router)
    app.include_router(calendar_router)
    app.include_router(tasks_router)
    app.include_router(user_router)

    return app


app = create_app()
