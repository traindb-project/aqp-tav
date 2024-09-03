__all__ = [
    "BcryptString",
    "EncryptedString",
    "ChartType"
]

from enum import Enum

from fastapi import HTTPException, status

from sqlalchemy import String, TypeDecorator

from utils.crypt import crypt
from utils.crypt import bcrypt_context


class BcryptString(TypeDecorator):
    impl = String

    def process_bind_param(self, value: str, dialect):
        try:
            hashed_value = bcrypt_context.hash(value)
            return hashed_value
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )

    def process_result_value(self, value: str, dialect):
        return value


class EncryptedString(TypeDecorator):
    impl = String

    def process_bind_param(self, value: str, dialect):
        encrypted_value = crypt.encrypt(value).decode()
        return encrypted_value

    def process_result_value(self, value: str, dialect):
        decrypted_value = crypt.decrypt(value.encode()).decode()
        return decrypted_value


class ChartType(str, Enum):
    BAR = "bar"
    LINE = "line"
    SCATTER = "scatter"
    PIE = "pie"
