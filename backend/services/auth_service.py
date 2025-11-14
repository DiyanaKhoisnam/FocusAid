from typing import Optional
from fastapi import HTTPException, status
from datetime import timedelta, datetime

from core.storage import get_user_by_email as get_user_from_storage, create_user as create_user_in_storage, user_exists
from core.security import verify_password, get_password_hash, create_access_token
from core.config import settings
from models.user import User
from schemas.user import UserCreate, UserLogin

async def get_user_by_email(email: str) -> Optional[User]:
    """Get user by email from in-memory storage"""
    user_dict = get_user_from_storage(email)
    if user_dict:
        # Convert to User model format
        return User(
            id=user_dict["id"],
            email=user_dict["email"],
            hashed_password=user_dict["hashed_password"],
            created_at=user_dict.get("created_at", datetime.utcnow())
        )
    return None

async def create_user(user_data: UserCreate) -> User:
    """Create a new user in in-memory storage"""
    # Check if user already exists
    if user_exists(user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash the password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user in storage
    user_dict = create_user_in_storage(user_data.email, hashed_password)
    
    # Convert to User model
    return User(
        id=user_dict["id"],
        email=user_dict["email"],
        hashed_password=user_dict["hashed_password"],
        created_at=user_dict["created_at"]
    )

async def authenticate_user(email: str, password: str) -> Optional[User]:
    """Authenticate user by email and password"""
    user = await get_user_by_email(email)
    if not user:
        return None
    
    if not verify_password(password, user.hashed_password):
        return None
    
    return user

async def login_user(login_data: UserLogin) -> dict:
    """Login user and return access token"""
    user = await authenticate_user(login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

