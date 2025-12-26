from typing import Annotated, Literal
from pydantic import StringConstraints

Username = Annotated[str, StringConstraints(min_length=3, max_length=30)]
# bcrypt tiene límite práctico de 72 bytes; esto lo respeta
Password = Annotated[str, StringConstraints(min_length=8, max_length=72)]

Role = Literal["user", "supervisor"]