"""
Startup initialization for AI Phishing Detection System

This module handles automatic database initialization, admin user creation,
and test data seeding when the application starts up.
"""

from app.database import SessionLocal
from app.models import User, Feedback, PredictionLog, QuarantinedEmail
from passlib.hash import bcrypt
import logging

logger = logging.getLogger(__name__)

def create_admin_user():
    """Create admin user if it doesn't exist."""
    db = SessionLocal()
    try:
        admin_email = "tallantuxh@gmail.com"
        admin_password = "7230"
        
        # Check if admin user already exists
        admin = db.query(User).filter_by(email=admin_email).first()
        
        if not admin:
            # Create new admin user
            hashed_password = bcrypt.hash(admin_password)
            admin = User(
                email=admin_email,
                hashed_password=hashed_password,
                role="admin",
                is_approved=True
            )
            db.add(admin)
            db.commit()
            logger.info(f"✅ Admin user {admin_email} created successfully")
            return admin
        else:
            logger.info(f"✅ Admin user {admin_email} already exists")
            return admin
            
    except Exception as e:
        logger.error(f"❌ Error creating admin user: {e}")
        db.rollback()
        return None
    finally:
        db.close()

def create_test_user():
    """Create test user if it doesn't exist."""
    db = SessionLocal()
    try:
        test_email = "testuser@example.com"
        test_password = "TestPassword123"
        
        # Check if test user already exists
        test_user = db.query(User).filter_by(email=test_email).first()
        
        if not test_user:
            # Create new test user
            hashed_password = bcrypt.hash(test_password)
            test_user = User(
                email=test_email,
                hashed_password=hashed_password,
                role="user",
                is_approved=True
            )
            db.add(test_user)
            db.commit()
            logger.info(f"✅ Test user {test_email} created successfully")
            return test_user
        else:
            logger.info(f"✅ Test user {test_email} already exists")
            return test_user
            
    except Exception as e:
        logger.error(f"❌ Error creating test user: {e}")
        db.rollback()
        return None
    finally:
        db.close()

def seed_test_data():
    """Seed database with test data if none exists."""
    db = SessionLocal()
    try:
        # Add test feedback if none exists
        if db.query(Feedback).count() == 0:
            feedback_data = [
                Feedback(url="http://phishingsite.com", is_phishing=True),
                Feedback(url="http://safe-site.com", is_phishing=False),
                Feedback(url="http://malicious-link.net", is_phishing=True)
            ]
            db.add_all(feedback_data)
            logger.info("✅ Test feedback data added")
        
        # Add test prediction logs if none exists
        if db.query(PredictionLog).count() == 0:
            prediction_data = [
                PredictionLog(url="http://phishingsite.com", prediction=True, confidence=0.98),
                PredictionLog(url="http://safe-site.com", prediction=False, confidence=0.95),
                PredictionLog(url="http://malicious-link.net", prediction=True, confidence=0.87)
            ]
            db.add_all(prediction_data)
            logger.info("✅ Test prediction logs added")
        
        # Add test quarantined email if none exists
        if db.query(QuarantinedEmail).count() == 0:
            # Get admin user for the quarantined email
            admin = db.query(User).filter_by(email="tallantuxh@gmail.com").first()
            if admin:
                quarantined_email = QuarantinedEmail(
                    user_id=admin.id,
                    email_content="Suspicious email content here. This is a test quarantined email.",
                    reason="phishing",
                    status="pending"
                )
                db.add(quarantined_email)
                logger.info("✅ Test quarantined email added")
        
        db.commit()
        
    except Exception as e:
        logger.error(f"❌ Error seeding test data: {e}")
        db.rollback()
    finally:
        db.close()

def initialize_database():
    """Initialize database with admin user and test data."""
    logger.info("🚀 Initializing database...")
    
    # Create admin user
    admin = create_admin_user()
    
    # Create test user
    test_user = create_test_user()
    
    # Seed test data
    seed_test_data()
    
    logger.info("✅ Database initialization completed")
    
    return {
        "admin_created": admin is not None,
        "test_user_created": test_user is not None,
        "admin_credentials": {
            "email": "tallantuxh@gmail.com",
            "password": "7230"
        },
        "test_user_credentials": {
            "email": "testuser@example.com", 
            "password": "TestPassword123"
        }
    } 