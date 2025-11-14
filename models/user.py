from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

class User(BaseModel):
    id: str
    full_name: str
    email: EmailStr
    hashed_password: str
    created_at: datetime

