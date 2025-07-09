"""
Database Models for AI Phishing Detection System

This module defines all SQLAlchemy ORM models for the phishing detection database.
Each model represents a table in the database with appropriate relationships
and constraints.

Models:
- User: User accounts and authentication
- Feedback: User feedback on phishing predictions
- PredictionLog: Log of all phishing predictions made
- ExternalPhishingEntry: External phishing URLs from feeds
- QuarantinedEmail: Emails flagged for manual review
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from datetime import datetime
from app.database import Base


class User(Base):
    """
    User model for authentication and authorization.
    
    Represents user accounts in the system with role-based access control.
    Users must be approved by admins before they can access the system.
    
    Attributes:
        id: Primary key, auto-incrementing integer
        email: Unique email address for login
        hashed_password: Bcrypt-hashed password for security
        role: User role ('admin' or 'user')
        is_approved: Whether the user account has been approved by admin
        password_reset_token: Token for password reset functionality
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user")  # 'admin' or 'user'
    is_approved = Column(Boolean, default=False)
    password_reset_token = Column(String, nullable=True)


class Feedback(Base):
    """
    Feedback model for user corrections on phishing predictions.
    
    Stores user feedback to improve the AI model's accuracy over time.
    This data is used for model retraining and validation.
    
    Attributes:
        id: Primary key, auto-incrementing integer
        url: The URL that was evaluated
        is_phishing: User's feedback (True if phishing, False if legitimate)
        timestamp: When the feedback was submitted
    """
    __tablename__ = "feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True, nullable=False)
    is_phishing = Column(Boolean, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)


class PredictionLog(Base):
    """
    Prediction log for tracking all AI model predictions.
    
    Maintains a complete audit trail of all phishing predictions made
    by the AI model, including confidence scores and timestamps.
    
    Attributes:
        id: Primary key, auto-incrementing integer
        url: The URL that was analyzed
        prediction: AI model's prediction (True if phishing, False if legitimate)
        confidence: Confidence score from 0.0 to 1.0
        timestamp: When the prediction was made
    """
    __tablename__ = "prediction_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)
    prediction = Column(Boolean, nullable=False)
    confidence = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)


class ExternalPhishingEntry(Base):
    """
    External phishing URLs from various threat feeds.
    
    Stores known phishing URLs from external sources to enhance
    the detection system with up-to-date threat intelligence.
    
    Attributes:
        id: Primary key, auto-incrementing integer
        url: The phishing URL (unique constraint)
        source: Source of the phishing URL (e.g., 'phishtank', 'openphish')
        timestamp: When the entry was added to the database
    """
    __tablename__ = "external_phishing"
    
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, unique=True, nullable=False)
    source = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)


class QuarantinedEmail(Base):
    """
    Quarantined email model for manual review system.
    
    Stores emails that have been flagged for manual review by users
    or the AI system. Admins can review and take action on these emails.
    
    Attributes:
        id: Primary key, auto-incrementing integer
        user_id: Foreign key to the user who owns this email
        email_content: The full content of the quarantined email
        reason: Reason for quarantine ('phishing', 'uncertain', 'manual_review')
        status: Current status ('pending', 'released', 'confirmed')
        timestamp: When the email was quarantined
    """
    __tablename__ = "quarantined_emails"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    email_content = Column(String, nullable=False)
    reason = Column(String, nullable=False)  # e.g., 'phishing', 'uncertain', 'manual_review'
    status = Column(String, default="pending")  # 'pending', 'released', 'confirmed'
    timestamp = Column(DateTime, default=datetime.utcnow)


class EducativeTip(Base):
    """
    EducativeTip model for phishing awareness tips.
    Stores tips to be displayed in the frontend educative display.
    Attributes:
        id: Primary key, auto-incrementing integer
        content: The text of the educative tip
        timestamp: When the tip was created/added
    """
    __tablename__ = "educative_tips"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
