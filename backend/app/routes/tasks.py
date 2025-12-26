from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.deps import get_db, get_current_user
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate, TaskOut, TaskUpdate


router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("/", response_model=TaskOut)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    assigned_to_id = payload.assigned_to_id

    # Si NO es supervisor, fuerza asignación al usuario logueado
    if current_user.role != "supervisor":
        assigned_to_id = current_user.id

    db_task = Task(
        title=payload.title,
        description=payload.description,
        is_urgent=payload.is_urgent,
        is_important=payload.is_important,
        completed=False,
        assigned_to_id=assigned_to_id,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.get("/", response_model=list[TaskOut])
def list_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # supervisor ve todo; user ve solo lo suyo
    q = db.query(Task)
    if current_user.role != "supervisor":
        q = q.filter(Task.assigned_to_id == current_user.id)
    return q.all()


@router.get("/mine", response_model=list[TaskOut])
def my_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Task).filter(Task.assigned_to_id == current_user.id).all()


@router.get("/filter/", response_model=list[TaskOut])
def filter_tasks(
    assigned_to_id: int | None = None,
    completed: bool | None = None,
    is_urgent: bool | None = None,
    is_important: bool | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Task)

    # ACL: si no es supervisor, no puede filtrar por otros usuarios
    if current_user.role != "supervisor":
        q = q.filter(Task.assigned_to_id == current_user.id)
    else:
        if assigned_to_id is not None:
            q = q.filter(Task.assigned_to_id == assigned_to_id)

    if completed is not None:
        q = q.filter(Task.completed == completed)
    if is_urgent is not None:
        q = q.filter(Task.is_urgent == is_urgent)
    if is_important is not None:
        q = q.filter(Task.is_important == is_important)

    return q.all()


@router.put("/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # ACL: user solo edita lo suyo
    if current_user.role != "supervisor" and task.assigned_to_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")

    data = payload.model_dump(exclude_unset=True)

    # si no es supervisor, no puede reasignar
    if current_user.role != "supervisor":
        data.pop("assigned_to_id", None)

    for k, v in data.items():
        setattr(task, k, v)

    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}/complete", response_model=TaskOut)
def complete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if current_user.role != "supervisor" and task.assigned_to_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")

    task.completed = True
    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}/uncomplete", response_model=TaskOut)
def uncomplete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if current_user.role != "supervisor" and task.assigned_to_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")

    task.completed = False
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if current_user.role != "supervisor" and task.assigned_to_id != current_user.id:
        raise HTTPException(status_code=403, detail="No autorizado")

    db.delete(task)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

