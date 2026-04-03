from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
import os
from dotenv import load_dotenv
# Load environment variables from .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL","sqlite:///./tasks.db")

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

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
    if "recurrence" not in columns:
        statements.append("ALTER TABLE tasks ADD COLUMN recurrence VARCHAR")

    if not statements:
        return

    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))
