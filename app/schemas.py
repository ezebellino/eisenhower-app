from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TaskBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_urgent: Optional[bool] = None
    is_important: Optional[bool] = None

class TaskCreate(TaskBase):
    title: str
    description: str = ""
    is_urgent: bool = False
    is_important: bool = False

class TaskUpdate(TaskBase):
    completed: Optional[bool] = None

class TaskOut(TaskBase):
    id: int
    completed: bool
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True