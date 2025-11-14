from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class User(BaseModel):
    id: str
    email: EmailStr
    hashed_password: str
    created_at: datetime

