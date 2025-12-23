from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Literal
from app.database import SessionLocal
from app import schemas
from app.models.task import Task  # ✅ modelo ORM

router = APIRouter(prefix="/tasks", tags=["tasks"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=schemas.TaskOut)
def create_task(payload: schemas.TaskCreate, db: Session = Depends(get_db)):
    # ✅ instanciamos el ORM Task, no el Pydantic
    db_task = Task(**payload.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.get("/", response_model=list[schemas.TaskOut])
def read_all_tasks(db: Session = Depends(get_db)):
    return db.query(Task).all()


@router.get("/{task_id}", response_model=schemas.TaskOut)
def read_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task


@router.put("/{task_id}", response_model=schemas.TaskOut)
def update_task(task_id: int, payload: schemas.TaskUpdate, db: Session = Depends(get_db)):
    db_task = db.get(Task, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    task_data = payload.model_dump(exclude_unset=True)

    for key, value in task_data.items():
        setattr(db_task, key, value)

    db.commit()
    db.refresh(db_task)
    return db_task


@router.delete("/{task_id}", response_model=schemas.TaskOut)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.get(Task, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(db_task)
    db.commit()
    return db_task


@router.get("/filter/", response_model=list[schemas.TaskOut])
def filter_tasks(
    is_urgent: bool | None = None,
    is_important: bool | None = None,
    completed: bool | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Task)

    if is_urgent is not None:
        query = query.filter(Task.is_urgent == is_urgent)
    if is_important is not None:
        query = query.filter(Task.is_important == is_important)
    if completed is not None:
        query = query.filter(Task.completed == completed)

    return query.all()


@router.patch("/{task_id}/complete", response_model=schemas.TaskOut)
def complete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.get(Task, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    db_task.completed = True
    db.commit()
    db.refresh(db_task)
    return db_task


@router.patch("/{task_id}/uncomplete", response_model=schemas.TaskOut)
def uncomplete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.get(Task, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    db_task.completed = False
    db.commit()
    db.refresh(db_task)
    return db_task


@router.get("/completed/", response_model=list[schemas.TaskOut])
def get_completed_tasks(db: Session = Depends(get_db)):
    return db.query(Task).filter(Task.completed.is_(True)).all()


@router.get("/pending/", response_model=list[schemas.TaskOut])
def get_pending_tasks(db: Session = Depends(get_db)):
    return db.query(Task).filter(Task.completed.is_(False)).all()
