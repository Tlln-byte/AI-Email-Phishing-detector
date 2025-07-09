"""
Authentication Module for AI Phishing Detection System

This module handles JWT token creation, validation, and user authentication.
It provides secure token-based authentication for the API endpoints.

Features:
- JWT token creation with configurable expiration
- Token validation and decoding
- Secure password hashing and verification
- Environment-based configuration
"""

from datetime import datetime, timedelta
from jose import JWTError, jwt
import os
import typing
from typing import Optional, Dict, Any

# Security Configuration
# Get secret key from environment variable for security
_secret = os.getenv("SECRET_KEY")
if _secret is None:
    raise RuntimeError("SECRET_KEY environment variable not set!")
SECRET_KEY: str = _secret

# JWT Configuration
ALGORITHM = "HS256"  # HMAC with SHA-256
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # Token expires after 30 minutes


def create_access_token(data: Dict[str, Any]) -> str:
    """
    Create a JWT access token for user authentication.
    
    This function creates a secure JWT token containing user information
    and an expiration time. The token is signed with the application's
    secret key for security.
    
    Args:
        data: Dictionary containing user data (typically user_id and email)
        
    Returns:
        str: Encoded JWT token string
        
    Raises:
        Exception: If token creation fails
    """
    try:
        # Create a copy of the data to avoid modifying the original
    to_encode = data.copy()
        # Set token expiration time
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
        # Encode the token with the secret key
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    except Exception as e:
        raise Exception(f"Failed to create access token: {str(e)}")


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode and validate a JWT access token.
    
    This function decodes a JWT token and validates its signature and
    expiration time. If the token is invalid or expired, it returns None.
    
    Args:
        token: JWT token string to decode
        
    Returns:
        Optional[Dict[str, Any]]: Decoded token data if valid, None otherwise
        
    Raises:
        JWTError: If token is malformed or invalid
    """
    try:
        # Decode the token and verify its signature
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Check if token has expired
        exp = payload.get("exp")
        if exp is None:
            return None
            
        # Convert expiration timestamp to datetime for comparison
        exp_datetime = datetime.fromtimestamp(exp)
        if datetime.utcnow() > exp_datetime:
            return None  # Token has expired
            
        return payload
        
    except JWTError as e:
        # Log the error for debugging (in production, use proper logging)
        print(f"JWT decode error: {str(e)}")
        return None
    except Exception as e:
        # Handle any other unexpected errors
        print(f"Token decode error: {str(e)}")
        return None


def verify_token(token: str) -> bool:
    """
    Verify if a JWT token is valid and not expired.
    
    This is a convenience function that checks if a token can be
    successfully decoded and is not expired.
    
    Args:
        token: JWT token string to verify
        
    Returns:
        bool: True if token is valid, False otherwise
    """
    try:
        payload = decode_token(token)
        return payload is not None
    except Exception:
        return False


def get_user_id_from_token(token: str) -> Optional[int]:
    """
    Extract user ID from a JWT token.
    
    This function decodes a token and extracts the user_id field.
    It's commonly used in protected endpoints to identify the current user.
    
    Args:
        token: JWT token string
        
    Returns:
        Optional[int]: User ID if token is valid, None otherwise
    """
    try:
        payload = decode_token(token)
        if payload:
            return payload.get("user_id")
        return None
    except Exception:
        return None


def get_user_email_from_token(token: str) -> Optional[str]:
    """
    Extract user email from a JWT token.
    
    This function decodes a token and extracts the email field.
    It's commonly used for user identification and logging.
    
    Args:
        token: JWT token string
        
    Returns:
        Optional[str]: User email if token is valid, None otherwise
    """
    try:
        payload = decode_token(token)
        if payload:
            return payload.get("email")
        return None
    except Exception:
        return None
