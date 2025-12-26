from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class TaskBase(BaseModel):
    description: Optional[str] = None
    is_urgent: Optional[bool] = None
    is_important: Optional[bool] = None
    assigned_to_id: Optional[int] = None


class TaskCreate(TaskBase):
    title: str
    description: str = ""
    is_urgent: bool = False
    is_important: bool = False
    assigned_to_id: Optional[int] = None


class TaskUpdate(TaskBase):
    completed: Optional[bool] = None


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: Optional[str] = None
    is_urgent: bool
    is_important: bool
    completed: bool
    assigned_to_id: Optional[int] = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
