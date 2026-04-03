from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
import os
from dotenv import load_dotenv
# Load environment variables from .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tasks.db")


def normalize_database_url(database_url: str) -> str:
    if database_url.startswith("postgres://"):
        return database_url.replace("postgres://", "postgresql+psycopg://", 1)
    if database_url.startswith("postgresql://"):
        return database_url.replace("postgresql://", "postgresql+psycopg://", 1)
    return database_url


def create_engine_kwargs(database_url: str) -> dict:
    if database_url.startswith("sqlite"):
        return {"connect_args": {"check_same_thread": False}}
    return {"pool_pre_ping": True}

NORMALIZED_DATABASE_URL = normalize_database_url(DATABASE_URL)

# Create the SQLAlchemy engine
engine = create_engine(NORMALIZED_DATABASE_URL, **create_engine_kwargs(NORMALIZED_DATABASE_URL))

# Create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a Base class for declarative models
class Base(DeclarativeBase):
    pass


def ensure_task_schedule_columns() -> None:
    inspector = inspect(engine)
    if "tasks" not in inspector.get_table_names():
        return

    columns = {column["name"] for column in inspector.get_columns("tasks")}
    statements: list[str] = []

    if "scheduled_for" not in columns:
        statements.append("ALTER TABLE tasks ADD COLUMN scheduled_for VARCHAR")
    if "scheduled_time" not in columns:
        statements.append("ALTER TABLE tasks ADD COLUMN scheduled_time VARCHAR")
    if "scheduled_time_end" not in columns:
        statements.append("ALTER TABLE tasks ADD COLUMN scheduled_time_end VARCHAR")
    if "recurrence" not in columns:
        statements.append("ALTER TABLE tasks ADD COLUMN recurrence VARCHAR")
    if "exclude_holidays" not in columns:
        statements.append("ALTER TABLE tasks ADD COLUMN exclude_holidays BOOLEAN NOT NULL DEFAULT 0")

    if not statements:
        return

    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))
