#!/usr/bin/env python3
"""
Script to list all users in the database.
"""

from app.database import SessionLocal
from app.models import User

def list_users():
    """List all users in the database."""
    db = SessionLocal()
    
    users = db.query(User).all()
    
    if users:
        print("Users in database:")
        for user in users:
            print(f"ID: {user.id}, Email: {user.email}, Role: {user.role}, Approved: {user.is_approved}")
    else:
        print("No users found in database.")
    
    db.close()

if __name__ == "__main__":
    list_users() 