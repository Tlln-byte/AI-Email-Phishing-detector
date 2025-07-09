#!/usr/bin/env python3
"""
Script to approve admin user directly in the database.
"""

from app.database import SessionLocal
from app.models import User

def approve_admin():
    """Approve the admin user and set role to admin."""
    db = SessionLocal()
    
    # Find the admin user
    admin_user = db.query(User).filter(User.email == "admin@example.com").first()
    
    if admin_user:
        # Approve the user and set as admin
        admin_user.is_approved = True
        admin_user.role = "admin"
        db.commit()
        print(f"✅ Admin user {admin_user.email} approved and set as admin.")
    else:
        print("❌ Admin user not found.")
    
    db.close()

if __name__ == "__main__":
    approve_admin() 