#!/usr/bin/env python3
"""
Script to check user details and verify password hashing.
"""

from app.database import SessionLocal
from app.models import User
from passlib.hash import bcrypt

def check_user():
    """Check user details and verify password hashing."""
    db = SessionLocal()
    
    # Check test user
    test_user = db.query(User).filter(User.email == "testuser@example.com").first()
    
    if test_user:
        print(f"Test user found:")
        print(f"  ID: {test_user.id}")
        print(f"  Email: {test_user.email}")
        print(f"  Role: {test_user.role}")
        print(f"  Approved: {test_user.is_approved}")
        print(f"  Password hash: {test_user.hashed_password[:20]}...")
        
        # Test password verification
        test_password = "TestPassword123"
        is_valid = bcrypt.verify(test_password, test_user.hashed_password)
        print(f"  Password verification: {is_valid}")
    else:
        print("Test user not found.")
    
    # Check admin user
    admin_user = db.query(User).filter(User.email == "tallantuxh@gmail.com").first()
    
    if admin_user:
        print(f"\nAdmin user found:")
        print(f"  ID: {admin_user.id}")
        print(f"  Email: {admin_user.email}")
        print(f"  Role: {admin_user.role}")
        print(f"  Approved: {admin_user.is_approved}")
        print(f"  Password hash: {admin_user.hashed_password[:20]}...")
        
        # Test password verification
        test_password = "admin123"
        is_valid = bcrypt.verify(test_password, admin_user.hashed_password)
        print(f"  Password verification: {is_valid}")
    else:
        print("Admin user not found.")
    
    db.close()

if __name__ == "__main__":
    check_user() 