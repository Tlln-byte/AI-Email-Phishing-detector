from passlib.context import CryptContext
import re

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def clean_url(url: str) -> str:
    return url.strip().lower()


def is_valid_url(url: str) -> bool:
    return re.match(r"^https?://", url) is not None
