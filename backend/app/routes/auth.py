from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.auth import (
    Token,
    LoginRequest,
    RegistrationRequest,
    BootstrapSupervisorRequest,
)
from app.schemas.user import UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegistrationRequest, db: Session = Depends(get_db)):
    exists_username = db.query(User).filter(User.username == payload.username).first()
    if exists_username:
        raise HTTPException(status_code=400, detail="Username ya existe")

    exists_email = db.query(User).filter(User.email == payload.email).first()
    if exists_email:
        raise HTTPException(status_code=400, detail="Email ya existe")

    user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        role="user",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/bootstrap-supervisor", response_model=UserOut)
def bootstrap_supervisor(payload: BootstrapSupervisorRequest, db: Session = Depends(get_db)):
    # 1) Solo en development
    if settings.environment.lower() != "development":
        raise HTTPException(status_code=404, detail="Not found")

    # 2) Solo si NO existe ningún supervisor
    supervisor_exists = db.query(User).filter(User.role == "supervisor").first()
    if supervisor_exists:
        raise HTTPException(
            status_code=400,
            detail="Ya existe un supervisor. Bootstrap deshabilitado.",
        )

    # 3) Debe existir el usuario que querés promover
    user = db.query(User).filter(User.username == payload.username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 4) Promoción
    user.role = "supervisor"
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    token = create_access_token(subject=user.username)
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login/json", response_model=Token)
def login_json(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    token = create_access_token(subject=user.username)
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
