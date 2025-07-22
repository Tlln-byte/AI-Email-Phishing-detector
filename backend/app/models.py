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
- EducativeTip: Phishing awareness tips for the frontend
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from datetime import datetime
from app.database import Base

# --- User Accounts ---
class User(Base):
    """
    User model for authentication and authorization.
    Represents user accounts in the system with role-based access control.
    Users must be approved by admins before they can access the system.
    """
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user")  # 'admin' or 'user'
    is_approved = Column(Boolean, default=False)
    password_reset_token = Column(String, nullable=True)  # For password reset flows

# --- User Feedback on Predictions ---
class Feedback(Base):
    """
    Feedback model for user corrections on phishing predictions.
    Stores user feedback to improve the AI model's accuracy over time.
    This data is used for model retraining and validation.
    """
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True, nullable=False)  # The URL that was evaluated
    is_phishing = Column(Boolean, nullable=False)     # User's feedback (True if phishing)
    timestamp = Column(DateTime, default=datetime.utcnow)

# --- Prediction Log (Audit Trail) ---
class PredictionLog(Base):
    """
    Prediction log for tracking all AI model predictions.
    Maintains a complete audit trail of all phishing predictions made
    by the AI model, including confidence scores and timestamps.
    """
    __tablename__ = "prediction_logs"
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)              # The URL that was analyzed
    prediction = Column(Boolean, nullable=False)      # Model's prediction (True=phishing)
    confidence = Column(Float, nullable=False)        # Confidence score (0.0 to 1.0)
    timestamp = Column(DateTime, default=datetime.utcnow)

# --- External Threat Intelligence Feeds ---
class ExternalPhishingEntry(Base):
    """
    External phishing URLs from various threat feeds.
    Stores known phishing URLs from external sources to enhance
    the detection system with up-to-date threat intelligence.
    """
    __tablename__ = "external_phishing"
    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, unique=True, nullable=False) # The phishing URL (unique)
    source = Column(String, nullable=False)           # Source (e.g., 'phishtank', 'openphish')
    timestamp = Column(DateTime, default=datetime.utcnow)

# --- Quarantined Emails for Manual Review ---
class QuarantinedEmail(Base):
    """
    Quarantined email model for manual review system.
    Stores emails that have been flagged for manual review by users
    or the AI system. Admins can review and take action on these emails.
    """
    __tablename__ = "quarantined_emails"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)      # Owner of the quarantined email
    email_content = Column(String, nullable=False)             # Full content of the email
    reason = Column(String, nullable=False)                    # Reason: 'phishing', 'uncertain', etc.
    status = Column(String, default="pending")                # 'pending', 'released', 'confirmed'
    timestamp = Column(DateTime, default=datetime.utcnow)

# --- Phishing Awareness Tips for the Frontend ---
class EducativeTip(Base):
    """
    EducativeTip model for phishing awareness tips.
    Stores tips to be displayed in the frontend educative display.
    """
    __tablename__ = "educative_tips"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(String, nullable=False)                   # The text of the educative tip
    timestamp = Column(DateTime, default=datetime.utcnow)
