#!/usr/bin/env python3
"""
Script to create a test user directly in the database.
"""

from app.database import SessionLocal
from app.models import User
from passlib.hash import bcrypt

def create_test_user():
    """Create a test user directly in the database."""
    db = SessionLocal()
    
    # Check if test user already exists
    test_user = db.query(User).filter(User.email == "testuser@example.com").first()
    
    if test_user:
        print("Test user already exists, approving...")
        test_user.is_approved = True  # type: ignore
        db.commit()
        print(f"✅ Test user {test_user.email} approved.")
    else:
        # Create new test user
        hashed_password = bcrypt.hash("TestPassword123")
        test_user = User(
            email="testuser@example.com",
            hashed_password=hashed_password,
            role="user",
            is_approved=True
        )
        db.add(test_user)
        db.commit()
        print(f"✅ Test user {test_user.email} created and approved.")
    
    db.close()

if __name__ == "__main__":
    create_test_user() 