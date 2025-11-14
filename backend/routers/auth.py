from fastapi import APIRouter, Depends
from typing import Annotated

from schemas.user import UserCreate, UserResponse, Token, UserLogin
from services.auth_service import create_user, login_user
from core.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(user_data: UserCreate):
    """Register a new user"""
    user = await create_user(user_data)
    return UserResponse(
        id=str(user.id),
        email=user.email,
        created_at=user.created_at
    )


@router.post("/login", response_model=Token)
async def login(login_data: UserLogin):
    """Login user and get access token"""
    return await login_user(login_data)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: Annotated[UserResponse, Depends(get_current_user)]
):
    """Get current authenticated user information"""
    return current_user

