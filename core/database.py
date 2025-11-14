from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from .config import settings
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    database: AsyncIOMotorDatabase = None

database = Database()

async def connect_to_mongo():
    """Create database connection"""
    try:
        database.client = AsyncIOMotorClient(settings.MONGO_URI)
        database.database = database.client[settings.DATABASE_NAME]
        # Test the connection
        await database.client.admin.command('ping')
        logger.info(f"Connected to MongoDB - Database: {settings.DATABASE_NAME}")
    except Exception as e:
        logger.warning(f"Warning: Could not connect to MongoDB: {e}")
        logger.warning("Server will continue without database connection. Auth endpoints will not work.")
        # Don't raise - allow server to start without MongoDB
        # This is useful for development and endpoints that don't require DB (like TTS)

async def close_mongo_connection():
    """Close database connection"""
    if database.client:
        database.client.close()
        logger.info("Disconnected from MongoDB")

def get_database() -> AsyncIOMotorDatabase:
    """Get database instance"""
    return database.database

