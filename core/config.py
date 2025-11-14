from pydantic_settings import BaseSettings, SettingsConfigDict
import os
import logging
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
  #jwt
  ALGORITHM: str = "HS256"
  ACCESS_TOKEN_EXPIRE_MINUTES: int = 7*24*60
  SECRET_KEY : str = os.getenv("secret_key", "your-secret-key-change-in-production")
  MONGO_URI : str = os.getenv("mongo_uri", "mongodb://localhost:27017")
  DATABASE_NAME: str = os.getenv("database_name", "eduneuro")
  # OpenAI
  OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
  OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")  # gpt-4o-mini (better), gpt-4 (best), gpt-3.5-turbo (cheaper)
  # Document limits
  MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "10"))  # 10MB default
  MAX_TEXT_LENGTH: int = int(os.getenv("MAX_TEXT_LENGTH", "50000"))  # 50k characters default
  MAX_PDF_PAGES: int = int(os.getenv("MAX_PDF_PAGES", "100"))  # 100 pages default
  MAX_SUMMARY_LENGTH: int = int(os.getenv("MAX_SUMMARY_LENGTH", "500"))  # 500 words max
  
  
  model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
