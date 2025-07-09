#!/usr/bin/env python3
"""
Script to reset admin password to a known value.
"""

from app.database import SessionLocal
from app.models import User
from passlib.hash import bcrypt

def reset_admin_password():
    """Reset admin password to a known value."""
    db = SessionLocal()
    
    # Find the admin user
    admin_user = db.query(User).filter(User.email == "tallantuxh@gmail.com").first()
    
    if admin_user:
        # Reset password to a known value
        new_password = "admin123"
        admin_user.hashed_password = bcrypt.hash(new_password)
        db.commit()
        print(f"✅ Admin password reset to: {new_password}")
    else:
        print("❌ Admin user not found.")
    
    db.close()

if __name__ == "__main__":
    reset_admin_password() 