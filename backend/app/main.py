from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routes.auth import router as auth_router
from app.routes.tasks import router as tasks_router
from app.routes.users import router as user_router  # Asegura que el modelo User esté registrado


def create_app() -> FastAPI:
    app = FastAPI(title="Eisenhower API")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    Base.metadata.create_all(bind=engine)

    app.include_router(auth_router)
    app.include_router(tasks_router)
    app.include_router(user_router)

    return app


app = create_app()
