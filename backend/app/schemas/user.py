from pydantic import BaseModel, EmailStr, ConfigDict, StringConstraints
from typing import Annotated, Literal, Optional

from .common import Username, Password, Role



class UserCreate(BaseModel):
    username: Username
    email: EmailStr
    password: Password


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    email: str
    role: str
    is_active: bool
        
class UserRoleUpdate(BaseModel):
    role: Role
