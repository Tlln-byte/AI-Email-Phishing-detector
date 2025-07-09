#!/usr/bin/env python3
"""
Comprehensive authentication fix script.
This script will recreate the database with proper user authentication.
"""

from app.database import SessionLocal, engine
from app.models import User, Base
from passlib.hash import bcrypt
import os

def fix_authentication():
    """Fix the authentication system by recreating the database with proper users."""
    
    # Drop and recreate all tables
    print("🔄 Dropping and recreating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Create admin user with proper password hashing
    print("👤 Creating admin user...")
    admin_password = "admin123"
    admin_hash = bcrypt.hash(admin_password)
    admin_user = User(
        email="admin@example.com",
        hashed_password=admin_hash,
        role="admin",
        is_approved=True
    )
    db.add(admin_user)
    
    # Create test user with proper password hashing
    print("👤 Creating test user...")
    test_password = "test123"
    test_hash = bcrypt.hash(test_password)
    test_user = User(
        email="test@example.com",
        hashed_password=test_hash,
        role="user",
        is_approved=True
    )
    db.add(test_user)
    
    # Commit all changes
    db.commit()
    db.close()
    
    print("✅ Authentication system fixed!")
    print("\n📋 Login Credentials:")
    print("Admin User:")
    print("  Email: admin@example.com")
    print("  Password: admin123")
    print("\nTest User:")
    print("  Email: test@example.com")
    print("  Password: test123")
    print("\n🌐 Access the system at: http://localhost:3000")

if __name__ == "__main__":
    fix_authentication() 