"""
API Routes for AI Phishing Detection System

This module defines all FastAPI routes for the phishing detection system.
It includes authentication, user management, email scanning, and admin endpoints.

Features:
- User authentication and registration
- Email scanning and phishing detection
- Admin user management
- Feedback collection and model retraining
- IMAP email integration
- File upload scanning
"""

from fastapi import APIRouter, Depends, HTTPException, Body, Header, Request, UploadFile, File, Response, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User, Feedback, PredictionLog, QuarantinedEmail, EducativeTip
from app.utils import verify_password, hash_password
from app.auth import create_access_token, decode_token
from app.phishing import predict, train_model
from app.retraining import retrain
from app.phishing_feeds import fetch_and_store
from datetime import datetime
from pydantic import BaseModel, EmailStr
import imaplib
import email as pyemail
import secrets
import email
import threading, time
import re # Added for URL extraction

from typing import List

# Initialize FastAPI router
router = APIRouter()

# Pydantic Models for Request Validation

class SignupRequest(BaseModel):
    """Request model for user registration."""
    email: EmailStr
    password: str


class ScanEmailRequest(BaseModel):
    """Request model for email content scanning."""
    email_content: str


class FeedbackRequest(BaseModel):
    """Request model for user feedback on quarantined emails."""
    email_id: int
    is_phishing: bool


class IMAPConnectRequest(BaseModel):
    """Request model for IMAP email connection testing."""
    email: EmailStr
    password: str
    imap_server: str
    imap_port: int = 993


class ScanInboxRequest(BaseModel):
    """Request model for scanning entire email inbox."""
    email: EmailStr
    password: str
    imap_server: str
    imap_port: int = 993


class RequestPasswordReset(BaseModel):
    """Request model for password reset initiation."""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Request model for password reset completion."""
    token: str
    new_password: str


class ApproveUserRequest(BaseModel):
    user_id: int


class RejectUserRequest(BaseModel):
    user_id: int


# Database Dependency
def get_db():
    """
    Database session dependency.
    
    Creates a new database session for each request and ensures
    it's properly closed after the request is complete.
    
    Yields:
        Session: SQLAlchemy database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Authentication Dependency
def get_current_user(request: Request, db: Session = Depends(get_db)):
    """
    Get current authenticated user from JWT token.
    
    This dependency extracts the JWT token from the Authorization header,
    validates it, and returns the corresponding user from the database.
    
    Args:
        request: FastAPI request object
        db: Database session
        
    Returns:
        User: Current authenticated user
        
    Raises:
        HTTPException: If token is missing, invalid, or user not found
    """
    # Extract token from Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    token = auth_header.split(" ")[1]
    
    try:
        # Decode and validate token
        payload = decode_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid token")
            
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        # Get user from database
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
            
        return user
        
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")


# Authentication Endpoints

@router.post("/signup")
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    """
    Register a new user account.
    
    Creates a new user account with the provided email and password.
    The account will be pending admin approval before it can be used.
    
    Args:
        data: SignupRequest containing email and password
        db: Database session
        
    Returns:
        dict: Success message
        
    Raises:
        HTTPException: If email is already registered
    """
    # TODO: In the future, implement a more robust admin approval workflow here.
    # For now, user accounts are created as 'pending' (is_approved=False) and require admin approval before login.

    # Check if email is already registered
    if db.query(User).filter(User.email == data.email).first():
        # If the email is already in the database, raise an error
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password for security
    hashed_pw = hash_password(data.password)  # Securely hash the user's password before storing
    
    # Create new user (pending approval)
    new_user = User(
        email=data.email,              # Set the user's email
        hashed_password=hashed_pw,     # Store the hashed password
        role="user",                  # Assign default role as 'user'
        is_approved=False              # Mark user as not approved (pending admin approval)
    )
    
    db.add(new_user)  # Add the new user to the database session
    db.commit()       # Commit the transaction to save the user
    
    return {"message": "Signup successful! Await admin approval."}  # Inform the user to wait for admin approval


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    """
    Authenticate user and return JWT token.
    
    Validates user credentials and returns a JWT access token if successful.
    Only approved users can log in.
    
    Args:
        form_data: OAuth2 form data containing username (email) and password
        db: Database session
        
    Returns:
        dict: Access token and token type
        
    Raises:
        HTTPException: If credentials are invalid or account not approved
    """
    # Find user by email
    user = db.query(User).filter(User.email == form_data.username).first()
    
    # Validate credentials
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Check if user is approved
    if bool(user.is_approved) == False:
        raise HTTPException(status_code=403, detail="Account pending admin approval.")
    
    # Create JWT token
    token = create_access_token({"sub": user.email, "role": user.role})
    
    return {"access_token": token, "token_type": "bearer"}


# Phishing Detection Endpoints

@router.post("/predict")
def predict_url(url: str = Body(..., embed=True), db: Session = Depends(get_db)):
    """
    Predict if a URL is phishing.
    
    Uses the AI model to analyze a URL and determine if it's phishing.
    Logs the prediction for audit and training purposes.
    
    Args:
        url: URL to analyze
        db: Database session
        
    Returns:
        dict: Prediction result and confidence score
    """
    # Get prediction from AI model
    result, confidence = predict(url)
    
    # Log the prediction
    db.add(
        PredictionLog(
            url=url,
            prediction=result,
            confidence=confidence,
            timestamp=datetime.utcnow(),
        )
    )
    db.commit()
    
    return {"prediction": result, "confidence": confidence}


@router.post("/feedback")
def submit_feedback(
    data: FeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Submit feedback on a quarantined email.
    
    Allows users to provide feedback on emails that were flagged as potential
    phishing. This feedback is used to improve the AI model.
    
    Args:
        data: FeedbackRequest containing email ID and phishing status
        current_user: Currently authenticated user
        db: Database session
        
    Returns:
        dict: Success status
        
    Raises:
        HTTPException: If email not found or not accessible
    """
    # Find the quarantined email
    email = (
        db.query(QuarantinedEmail)
        .filter(
            QuarantinedEmail.id == data.email_id,
            QuarantinedEmail.user_id == current_user.id,
        )
        .first()
    )
    
    if not email:
        raise HTTPException(
            status_code=404, 
            detail="Quarantined email not found or not accessible"
        )
    
    # Save feedback
    db.add(Feedback(url=email.email_content, is_phishing=data.is_phishing))
    db.commit()
    
    return {"status": "Feedback saved"}


# Dashboard and Analytics Endpoints

@router.get("/dashboard")
def get_dashboard_summary(db: Session = Depends(get_db)):
    """
    Get dashboard summary statistics.
    
    Returns aggregated statistics for the dashboard including
    total feedback count and phishing detection count.
    
    Args:
        db: Database session
        
    Returns:
        dict: Dashboard summary statistics
    """
    total = db.query(Feedback).count()
    phishing = db.query(Feedback).filter_by(is_phishing=True).count()
    
    return {"total_feedback": total, "phishing": phishing}


@router.get("/logs")
def get_logs(db: Session = Depends(get_db)):
    """
    Get recent prediction logs.
    
    Returns the most recent 100 prediction logs for analysis
    and monitoring purposes.
    
    Args:
        db: Database session
        
    Returns:
        list: Recent prediction logs
    """
    logs = (
        db.query(PredictionLog)
        .order_by(PredictionLog.timestamp.desc())
        .limit(100)
        .all()
    )
    return [
        {
            "id": log.id,
            "url": log.url,
            "prediction": bool(log.prediction) if not hasattr(log.prediction, 'clauses') and log.prediction is not None else None,
            "confidence": float(log.confidence) if isinstance(log.confidence, (float, int)) else None,
            "timestamp": log.timestamp.isoformat() if getattr(log, "timestamp", None) is not None else None
        }
        for log in logs
    ]


# Model Management Endpoints

@router.post("/retrain")
def retrain_model(current_user: User = Depends(get_current_user)):
    if str(current_user.role) != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    train_model()
    return {"status": "Model retrained"}


@router.post("/update-feeds")
def update_feeds():
    """
    Update external phishing feeds.
    
    Fetches and stores the latest phishing URLs from external
    threat intelligence feeds.
    
    Returns:
        dict: Feed update status
    """
    fetch_and_store()
    return {"status": "Feeds updated"}


# Email Integration Endpoints

@router.post("/connect-email")
def connect_email(data: IMAPConnectRequest, request: Request):
    """
    Test IMAP email connection and store credentials in session.
    """
    try:
        mail = imaplib.IMAP4_SSL(data.imap_server, data.imap_port)
        mail.login(data.email, data.password)
        mail.logout()
        # Store credentials in session
        request.session["email_credentials"] = {
            "email": data.email,
            "password": data.password,
            "imap_server": data.imap_server,
            "imap_port": data.imap_port
        }
        return {"success": True, "message": "IMAP connection successful."}
    except imaplib.IMAP4.error as e:
        return {"success": False, "message": f"IMAP connection failed: {str(e)}"}
    except Exception as e:
        return {"success": False, "message": f"Unexpected error: {str(e)}"}


# --- Helper for minimal phishing checks ---
def minimal_phishing_checks(subject, sender, text_content, urls):
    phishing_reasons = []
    # Subject check
    suspicious_subject_keywords = [
        'urgent', 'account verification', 'suspended', 'verify', 'security alert', 'unusual activity', 'immediate action', 'account locked', 'reset password', 'confirm your identity'
    ]
    if subject and any(kw in subject.lower() for kw in suspicious_subject_keywords):
        phishing_reasons.append(f"Suspicious subject: {subject}")
    # Sender check (very basic)
    suspicious_sender_keywords = ['bank', 'security', 'support', 'alert', 'noreply']
    if sender and any(kw in sender.lower() for kw in suspicious_sender_keywords):
        phishing_reasons.append(f"Suspicious sender: {sender}")
    # HTTP link check
    for url in urls:
        if url.lower().startswith('http://'):
            phishing_reasons.append(f"Insecure HTTP link: {url}")
    # Content keyword check
    phishing_keywords = [
        'urgent', 'verify your account', 'password', 'click here', 'update your account',
        'login to your account', 'confirm your identity', 'security alert', 'suspended',
        'unauthorized', 'reset your password', 'account locked', 'unusual activity',
        'provide your credentials', 'bank', 'invoice', 'payment', 'limited time', 'act now'
    ]
    keyword_hits = [kw for kw in phishing_keywords if kw.lower() in text_content.lower()]
    if keyword_hits:
        phishing_reasons.append(f"Phishing keywords found: {', '.join(keyword_hits)}")
    return phishing_reasons

@router.post("/scan-inbox")
def scan_inbox(request: Request, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Scan entire email inbox for phishing emails using credentials from session.
    """
    creds = request.session.get("email_credentials")
    if not creds:
        raise HTTPException(status_code=401, detail="Not connected to email")
    try:
        mail = imaplib.IMAP4_SSL(creds["imap_server"], creds["imap_port"])
        mail.login(creds["email"], creds["password"])
        mail.select('INBOX')
        _, message_numbers = mail.search(None, 'ALL')
        scanned_count = 0
        quarantined_count = 0
        phishing_count = 0
        scanned_emails = []
        for num in message_numbers[0].split():
            try:
                _, msg_data = mail.fetch(num, '(RFC822)')
                if msg_data and msg_data[0] is not None and isinstance(msg_data[0], (tuple, list)) and len(msg_data[0]) > 1:
                    email_body = msg_data[0][1]
                    email_message = pyemail.message_from_bytes(email_body) if isinstance(email_body, (bytes, bytearray)) else None
                    sender = email_message.get('From', '') if email_message else ''
                    subject = email_message.get('Subject', '') if email_message else ''
                    snippet = ""
                    email_content = ""
                    if email_message and email_message.is_multipart():
                        for part in email_message.walk():
                            if part.get_content_type() == "text/plain":
                                payload = part.get_payload(decode=True)
                                if isinstance(payload, bytes):
                                    email_content = payload.decode(errors='ignore')
                                elif isinstance(payload, str):
                                    email_content = payload
                                snippet = email_content[:100]
                                break
                    elif email_message:
                        payload = email_message.get_payload(decode=True)
                        if isinstance(payload, bytes):
                            email_content = payload.decode(errors='ignore')
                        elif isinstance(payload, str):
                            email_content = payload
                        snippet = email_content[:100]
                result, confidence = predict(email_content)
                # --- Minimal full-content phishing check (now enhanced) ---
                url_pattern = r"https?://[\w\.-]+(?:/[\w\./?%&=\-]*)?"
                urls = re.findall(url_pattern, email_content)
                phishing_reasons = minimal_phishing_checks(subject, sender, email_content, urls)
                is_phishing = bool(result) or bool(phishing_reasons)
                if is_phishing:
                    quarantined_email = QuarantinedEmail(
                        user_id=current_user.id,
                        email_content=email_content,
                        reason="phishing",
                        status="pending",
                        timestamp=datetime.utcnow()
                    )
                    db.add(quarantined_email)
                    # Log prediction for reports
                    db.add(PredictionLog(
                        url="[EMAIL]",  # or extract a subject/snippet if you want
                        prediction=is_phishing,
                        confidence=confidence if result else 0.4,
                        timestamp=datetime.utcnow()
                    ))
                scanned_emails.append({
                    "id": int(num),
                    "sender": sender,
                    "subject": subject,
                    "snippet": snippet,
                    "is_phishing": is_phishing,
                    "confidence": confidence if result else 0.4,
                    "phishing_reasons": phishing_reasons
                })
            except Exception as e:
                print(f"Error processing email {num}: {str(e)}")
                continue
        db.commit()
        mail.logout()
        return {
            "scanned": scanned_count,
            "quarantined": quarantined_count,
            "phishing_detected": phishing_count,
            "emails": scanned_emails
        }
    except imaplib.IMAP4.error as e:
        raise HTTPException(status_code=400, detail=f"IMAP error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scanning error: {str(e)}")


@router.get("/admin/users")
def list_all_users(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """
    List all users (Admin only).
    
    Returns all users in the system with their details.
    
    Args:
        current_user: Currently authenticated user (must be admin)
        db: Database session
        
    Returns:
        list: All users in the system
        
    Raises:
        HTTPException: If user is not admin
    """
    if str(current_user.role) != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users = db.query(User).all()
    return [
        {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "is_approved": bool(user.is_approved)
        }
        for user in users
    ]


@router.post("/admin/approve-user")
def approve_user(
    data: ApproveUserRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Approve a pending user account (Admin only).
    Args:
        data: ApproveUserRequest with user_id
        current_user: Must be admin
        db: Database session
    Returns:
        dict: Success message
    Raises:
        HTTPException: If not admin or user not found
    """
    if str(current_user.role) != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Approval logic
    approved = False
    if user is not None:
        val = user.is_approved
        if hasattr(val, 'clauses'):
            # SQLAlchemy column, treat as not approved
            approved = False
        else:
            approved = bool(val)
    if approved:
        return {"message": "User is already approved."}
    # Only compare ids if both are plain ints (not SQLAlchemy columns or bools)
    user_id_val = user.id if user is not None and type(user.id) is int else None
    current_user_id_val = current_user.id if current_user is not None and type(current_user.id) is int else None
    if (user_id_val is not None and current_user_id_val is not None and
        isinstance(user_id_val, int) and isinstance(current_user_id_val, int) and
        user_id_val == current_user_id_val):
        raise HTTPException(status_code=400, detail="You cannot approve yourself.")
    # Set the user's is_approved field to True to approve the user
    user.is_approved = True  # type: ignore
    # Commit the change to the database
    db.commit()
    # Return a success message with the approved user's email
    return {"message": f"User {user.email} approved successfully."}


@router.post("/admin/reject-user")
def reject_user(
    data: RejectUserRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Reject (delete) a user account (Admin only).
    Args:
        data: RejectUserRequest with user_id
        current_user: Must be admin
        db: Database session
    Returns:
        dict: Success message
    Raises:
        HTTPException: If not admin, user not found, or trying to delete self/last admin
    """
    if str(current_user.role) != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Only compare ids if both are plain ints (not SQLAlchemy columns or bools)
    user_id_val = user.id if user is not None and type(user.id) is int else None
    current_user_id_val = current_user.id if current_user is not None and type(current_user.id) is int else None
    if (user_id_val is not None and current_user_id_val is not None and
        isinstance(user_id_val, int) and isinstance(current_user_id_val, int) and
        user_id_val == current_user_id_val):
        raise HTTPException(status_code=400, detail="You cannot delete your own account.")
    if str(user.role) == "admin":
        admin_count = db.query(User).filter(User.role == "admin").count()
        if admin_count <= 1:
            raise HTTPException(status_code=400, detail="Cannot delete the last admin account.")
    db.delete(user)
    db.commit()
    return {"message": f"User {user.email} deleted successfully."}


@router.get("/health")
def health_check():
    """
    Health check endpoint.
    
    Returns:
        dict: Health status information
    """
    return {
        "status": "healthy",
        "message": "AI Phishing Detection API is running",
        "version": "1.0.0"
    }

@router.get("/system-info")
def system_info(db: Session = Depends(get_db)):
    """
    System information endpoint showing current users and database status.
    
    Returns:
        dict: System information including user accounts
    """
    try:
        users = db.query(User).all()
        user_info = []
        for user in users:
            user_info.append({
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "is_approved": bool(user.is_approved)
            })
        
        stats = {
            "total_users": len(users),
            "admin_users": len([u for u in users if str(u.role) == "admin"]),
            "users": len([u for u in users if str(u.role) == "user"]),
            "total_feedback": db.query(Feedback).count(),
            "total_predictions": db.query(PredictionLog).count(),
            "total_quarantined": db.query(QuarantinedEmail).count()
        }
        
        return {
            "status": "success",
            "users": user_info,
            "statistics": stats,
            "default_credentials": {
                "admin": {
                    "email": "tallantuxh@gmail.com",
                    "password": "7230"
                },
                "test_user": {
                    "email": "testuser@example.com",
                    "password": "TestPassword123"
                }
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


@router.post("/request-password-reset")
def request_password_reset(data: RequestPasswordReset, db: Session = Depends(get_db)):
    """
    Request password reset token.
    
    Generates a secure token and sends it to the user's email
    for password reset functionality.
    
    Args:
        data: Email address for password reset
        db: Database session
        
    Returns:
        dict: Success message
    """
    user = db.query(User).filter(User.email == data.email).first()
    if user:
        # Generate reset token
        reset_token = secrets.token_urlsafe(32)
        user.password_reset_token = reset_token  # type: ignore
    db.commit()
    # In a real application, send email with reset token
    # For now, just return success message
    return {"message": "Password reset email sent"}


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Reset password using token.
    
    Validates the reset token and updates the user's password.
    
    Args:
        data: Reset token and new password
        db: Database session
        
    Returns:
        dict: Success message
        
    Raises:
        HTTPException: If token is invalid
    """
    user = db.query(User).filter(User.password_reset_token == data.token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid reset token")
    # Update password and clear reset token
    user.hashed_password = hash_password(data.new_password)  # type: ignore
    user.password_reset_token = None  # type: ignore
    db.commit()
    return {"message": "Password reset successful"}


@router.post("/scan-eml")
def scan_eml_file(eml_file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Scan uploaded .eml file for phishing indicators.
    Allows users to upload email files (.eml format) for phishing analysis.
    """
    # 1. Validate file extension
    if eml_file.filename and eml_file.filename.endswith('.eml'):
        pass
    else:
        raise HTTPException(status_code=400, detail="File must be .eml format")
    try:
        # 2. Read the uploaded file content (handle both text and binary)
        eml_file.file.seek(0)
        raw_bytes = eml_file.file.read()
        try:
            email_content = raw_bytes.decode('utf-8')
        except UnicodeDecodeError:
            email_content = raw_bytes.decode('latin1')
        # 3. Parse the email using the email module
        email_message = pyemail.message_from_string(email_content)
        # 4. Extract the plain text content from the email
        text_content = ""
        subject = email_message.get('Subject', '') if email_message else ''
        sender = email_message.get('From', '') if email_message else ''
        if email_message.is_multipart():
            for part in email_message.walk():
                if part.get_content_type() == "text/plain":
                    payload = part.get_payload(decode=True)
                    if isinstance(payload, bytes):
                        text_content = payload.decode(errors='ignore')
                    elif isinstance(payload, str):
                        text_content = payload
                    break
        else:
            payload = email_message.get_payload(decode=True)
            if isinstance(payload, bytes):
                text_content = payload.decode(errors='ignore')
            elif isinstance(payload, str):
                text_content = payload
            else:
                text_content = email_message.get_payload()
        if not isinstance(text_content, str):
            text_content = str(text_content)
        # 5. Extract all URLs from the email text using regex
        url_pattern = r"https?://[\w\.-]+(?:/[\w\./?%&=\-]*)?"
        urls = re.findall(url_pattern, text_content)
        phishing_urls = []
        url_confidences = []
        for url in urls:
            result, confidence = predict(url)
            url_confidences.append({"url": url, "is_phishing": bool(result), "confidence": confidence})
            if result:
                phishing_urls.append(url)
        is_phishing = len(phishing_urls) > 0
        # --- Minimal full-content phishing check (now enhanced) ---
        phishing_reasons = minimal_phishing_checks(subject, sender, text_content, urls)
        if not is_phishing and phishing_reasons:
            is_phishing = True
            url_confidences.append({
                "url": None,
                "is_phishing": True,
                "confidence": 0.4,
                "reason": "; ".join(phishing_reasons)
            })
        # 7. Log the prediction for reporting/analytics
        db.add(PredictionLog(
            url="[EMAIL_UPLOAD]",
            prediction=int(is_phishing),
            confidence=max([c['confidence'] for c in url_confidences if 'confidence' in c], default=0.0),
            timestamp=datetime.utcnow()
        ))
        # 8. If any URL is phishing or keywords found, quarantine the email and return details
        if is_phishing:
            quarantined_email = QuarantinedEmail(
                user_id=current_user.id,
                email_content=text_content,
                reason="phishing",
                status="pending",
                timestamp=datetime.utcnow()
            )
            db.add(quarantined_email)
            db.commit()
            print("Subject:", subject)
            print("Sender:", sender)
            print("Text content:", text_content)
            print("URLs:", urls)
            print("Phishing reasons:", phishing_reasons)
            print("Is phishing:", is_phishing)
            return {
                "is_phishing": True,
                "phishing_urls": phishing_urls,
                "url_confidences": url_confidences,
                "quarantined": True,
                "email_id": quarantined_email.id,
                "phishing_reasons": phishing_reasons
            }
        # 9. If no phishing URLs or keywords found, return safe result
        print("Subject:", subject)
        print("Sender:", sender)
        print("Text content:", text_content)
        print("URLs:", urls)
        print("Phishing reasons:", phishing_reasons)
        print("Is phishing:", is_phishing)
        return {
            "is_phishing": False,
            "phishing_urls": [],
            "url_confidences": url_confidences,
            "quarantined": False,
            "phishing_reasons": phishing_reasons
        }
    except Exception as e:
        # 10. Handle any errors during processing
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")


@router.post("/logout")
def logout(request: Request):
    """
    Clear session credentials on logout.
    """
    request.session.clear()
    return {"message": "Logged out"}


@router.get("/quarantine")
def list_user_quarantine(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get user's quarantined emails.
    Returns all emails that have been quarantined for the currently authenticated user.
    """
    emails = (
        db.query(QuarantinedEmail)
        .filter(QuarantinedEmail.user_id == current_user.id)
        .order_by(QuarantinedEmail.timestamp.desc())
        .all()
    )
    return [
        {
            "id": email.id,
            "user_id": email.user_id,
            "email_content": email.email_content,
            "reason": email.reason,
            "status": email.status,
            "timestamp": email.timestamp.isoformat()
        }
        for email in emails
    ]

# Automated retrain background task

def retrain_model_periodically():
    while True:
        try:
            train_model()
            print("[INFO] Model retrained automatically.")
        except Exception as e:
            print(f"[ERROR] Automated retrain failed: {e}")
        time.sleep(60 * 60 * 24)  # 24 hours

# Start background retrain thread on startup
threading.Thread(target=retrain_model_periodically, daemon=True).start()

# --- Chatbot Hybrid Endpoint ---
class ChatRequest(BaseModel):
    message: str

@router.post("/chatbot")
def chatbot_response(data: ChatRequest):
    """
    Educational chatbot endpoint focused on phishing awareness and protection.
    Provides comprehensive, actionable guidance for users.
    """
    msg = data.message.lower().strip()
    
    # Comprehensive phishing detection guidance
    if any(word in msg for word in ["spot", "identify", "detect", "recognize", "find", "how to"]):
        if any(word in msg for word in ["phishing", "email", "suspicious"]):
            return {
                "reply": """🎣 **How to Spot Phishing Emails - 6 Key Red Flags:**

1. **Check the Sender Address** - Look for misspellings (e.g., "paypa1.com" instead of "paypal.com")

2. **Urgent Language** - "Your account will be closed in 24 hours!" or "Immediate action required!"

3. **Suspicious Links** - Hover over links to see if they go to unexpected domains

4. **Requests for Personal Info** - Banks/companies rarely ask for passwords via email

5. **Poor Grammar/Spelling** - Professional companies don't send emails with obvious errors

6. **Generic Greetings** - "Dear Customer" instead of your actual name

**When in doubt:** Don't click! Contact the sender through a trusted channel."""
            }
    
    # What is phishing
    if "what is phishing" in msg or "define phishing" in msg:
        return {
            "reply": """🎣 **What is Phishing?**

Phishing is a cyber attack where criminals impersonate trusted organizations (banks, companies, government) to steal your personal information.

**Common Targets:**
• Login credentials (email, bank accounts)
• Credit card numbers
• Social Security numbers
• Personal details

**Attack Methods:**
• Fake emails that look legitimate
• Malicious websites that mimic real ones
• Text messages (smishing)
• Phone calls (vishing)

**Goal:** Trick you into giving away sensitive information or clicking malicious links.

**Remember:** Legitimate organizations will NEVER ask for passwords or sensitive info via email!"""
        }
    
    # Reporting suspicious emails
    if any(word in msg for word in ["report", "reporting", "what to do"]):
        if any(word in msg for word in ["suspicious", "phishing", "email"]):
            return {
                "reply": """🚨 **How to Report Suspicious Emails:**

**Immediate Actions:**
1. **Don't click any links** or download attachments
2. **Don't reply** to the email
3. **Don't forward** the email to others

**Reporting Steps:**
1. **Mark as spam** in your email client
2. **Report to your IT team** if at work
3. **Forward to:** reportphishing@apwg.org (Anti-Phishing Working Group)
4. **Report to:** phishing-report@us-cert.gov (US-CERT)

**If you clicked a link:**
• Change your passwords immediately
• Monitor your accounts for suspicious activity
• Consider freezing your credit

**Remember:** When in doubt, report it! It's better to be safe than sorry."""
            }
    
    # Common phishing tactics
    if any(word in msg for word in ["tactics", "techniques", "methods", "tricks"]):
        return {
            "reply": """🎭 **Common Phishing Tactics:**

**1. Impersonation Attacks:**
• Fake emails from banks, PayPal, Amazon
• Government agency impersonation (IRS, Social Security)
• Tech support scams

**2. Urgency & Fear:**
• "Your account will be suspended!"
• "Unauthorized login detected!"
• "Tax refund available - claim now!"

**3. Social Engineering:**
• "You've won a prize!"
• "Your package is delayed"
• "Security update required"

**4. Visual Deception:**
• Logos and branding that look real
• URLs that are slightly misspelled
• Professional-looking email templates

**5. Attachment Threats:**
• "Invoice attached" (malicious file)
• "Resume" or "document" with malware
• "Security scan results"

**Protection:** Always verify the sender and never trust urgent requests!"""
        }
    
    # Password security
    if any(word in msg for word in ["password", "credentials", "login"]):
        return {
            "reply": """🔐 **Password Security Best Practices:**

**Strong Password Rules:**
• At least 12 characters long
• Mix of uppercase, lowercase, numbers, symbols
• Avoid common words or patterns
• Don't use personal info (birthday, name)

**Password Management:**
• Use a password manager (Bitwarden, 1Password)
• Never reuse passwords across accounts
• Enable two-factor authentication (2FA)
• Change passwords regularly

**Red Flags:**
• Emails asking for your password
• "Verify your account" links
• "Security check" requests
• "Login from new device" notifications

**If Compromised:**
• Change password immediately
• Check for suspicious activity
• Enable 2FA if not already active
• Monitor your accounts

**Remember:** Legitimate companies will NEVER ask for your password via email!"""
        }
    
    # General phishing help
    if "help" in msg or "support" in msg:
        return {
            "reply": """🛡️ **Phishing Protection Help:**

I'm here to help you stay safe from phishing attacks! Here are some topics I can help with:

• **How to spot phishing emails** - Learn the red flags
• **What is phishing** - Understanding the threat
• **How to report suspicious emails** - Take action
• **Common phishing tactics** - Know the enemy
• **Password security** - Protect your accounts

**Quick Safety Tips:**
✅ Always verify the sender's email address
✅ Hover over links before clicking
✅ Never share passwords via email
✅ When in doubt, don't click!

**Need specific help?** Just ask me about any of these topics!"""
        }
    
    # Default response for other questions
    return {
        "reply": """🛡️ **PhishGuard AI Assistant**

I'm here to help you stay safe from phishing attacks! 

**I can help you with:**
• How to spot phishing emails
• Understanding phishing tactics
• Password security best practices
• Reporting suspicious emails
• General cybersecurity tips

**Just ask me about any of these topics, or try:**
• "How do I spot a phishing email?"
• "What is phishing?"
• "How do I report suspicious emails?"
• "What are common phishing tactics?"

Stay safe and remember: When in doubt, don't click! 🎣"""
    }

@router.get("/educative-tips")
def get_educative_tips(db: Session = Depends(get_db)):
    """
    Returns a list of phishing awareness tips from the database, with ids for admin CRUD.
    """
    tips = db.query(EducativeTip).order_by(EducativeTip.timestamp.asc()).all()
    return {"tips": [tip.content for tip in tips], "ids": [tip.id for tip in tips]}

class EducativeTipRequest(BaseModel):
    content: str

@router.post("/educative-tips")
def add_educative_tip(
    data: EducativeTipRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a new educative tip (admin only).
    """
    if str(current_user.role) != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    tip = EducativeTip(content=data.content)
    db.add(tip)
    db.commit()
    return {"message": "Tip added."}

@router.put("/educative-tips/{tip_id}")
def update_educative_tip(
    tip_id: int,
    data: EducativeTipRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update an educative tip (admin only).
    """
    if str(current_user.role) != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    tip = db.query(EducativeTip).filter(EducativeTip.id == tip_id).first()
    if not tip:
        raise HTTPException(status_code=404, detail="Tip not found")
    tip.content = data.content  # type: ignore
    db.commit()
    return {"message": "Tip updated."}

@router.delete("/educative-tips/{tip_id}")
def delete_educative_tip(
    tip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete an educative tip (admin only).
    """
    if str(current_user.role) != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    tip = db.query(EducativeTip).filter(EducativeTip.id == tip_id).first()
    if not tip:
        raise HTTPException(status_code=404, detail="Tip not found")
    db.delete(tip)
    db.commit()
    return {"message": "Tip deleted."}
