__all__ = [
    "bcrypt_context",
    "crypt"
]

from cryptography.fernet import Fernet
from passlib.context import CryptContext

from env import APP_KEY_PATH

bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class Crypt:
    @staticmethod
    def __get_app_key() -> bytes:
        if APP_KEY_PATH.exists():
            with open(APP_KEY_PATH, "rb") as f:
                return f.read().strip()
        value = Fernet.generate_key()
        with open(APP_KEY_PATH, "wb") as f:
            f.write(value)
        return value

    def __init__(self):
        self.__app_key = self.__get_app_key()
        self.__cipher_suite = Fernet(self.__app_key)

    def encrypt(self, value: str) -> bytes:
        return self.__cipher_suite.encrypt(value.encode())

    def decrypt(self, value: bytes) -> bytes:
        return self.__cipher_suite.decrypt(value)


crypt = Crypt()
