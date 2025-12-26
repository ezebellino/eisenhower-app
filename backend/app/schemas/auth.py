from pydantic import BaseModel, EmailStr

from .common import Username, Password


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    username: str | None = None


class LoginRequest(BaseModel):
    username: Username
    password: Password


class RegistrationRequest(BaseModel):
    username: Username
    email: EmailStr
    password: Password


class BootstrapSupervisorRequest(BaseModel):
    username: Username
