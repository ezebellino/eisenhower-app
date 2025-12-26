from fastapi import HTTPException
from app.models.user import User
from app.models.task import Task

def assert_can_access_task(current_user: User, task: Task) -> None:
    if current_user.role == "supervisor":
        return
    if task.assigned_to_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")
