"""
In-memory storage using dictionaries
"""
from typing import Dict, Optional
from datetime import datetime
import uuid

# In-memory user storage
users_db: Dict[str, dict] = {}

# Document storage
documents_db: Dict[str, dict] = {}  # For storing document metadata and extracted text
summaries_db: Dict[str, dict] = {}  # For storing document summaries

def generate_id() -> str:
    """Generate a unique ID"""
    return str(uuid.uuid4())

def get_user_by_email(email: str) -> Optional[dict]:
    """Get user by email from in-memory storage"""
    for user_id, user_data in users_db.items():
        if user_data.get("email") == email:
            return {**user_data, "id": user_id}
    return None

def get_user_by_id(user_id: str) -> Optional[dict]:
    """Get user by ID from in-memory storage"""
    if user_id in users_db:
        return {**users_db[user_id], "id": user_id}
    return None

def create_user(email: str, hashed_password: str) -> dict:
    """Create a new user in in-memory storage"""
    user_id = generate_id()
    user_data = {
        "email": email,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow()
    }
    users_db[user_id] = user_data
    return {**user_data, "id": user_id}

def user_exists(email: str) -> bool:
    """Check if user exists by email"""
    return get_user_by_email(email) is not None

