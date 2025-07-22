from passlib.context import CryptContext
import re

# Password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str):
    """
    Hash a plain text password using bcrypt.
    Returns the hashed password string.
    """
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    """
    Verify a plain text password against a hashed password.
    Returns True if the password matches, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


def clean_url(url: str) -> str:
    """
    Clean a URL by stripping whitespace and converting to lowercase.
    Useful for normalization before storage or comparison.
    """
    return url.strip().lower()


def is_valid_url(url: str) -> bool:
    """
    Check if a string is a valid HTTP/HTTPS URL (basic check).
    Returns True if the string starts with http:// or https://
    """
    return re.match(r"^https?://", url) is not None
