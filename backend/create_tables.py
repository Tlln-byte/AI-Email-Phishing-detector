from app.database import Base, engine, SessionLocal
from app.models import User, Feedback, PredictionLog, ExternalPhishingEntry, QuarantinedEmail
from passlib.hash import bcrypt

print("🔧 Creating database tables...")
Base.metadata.create_all(bind=engine)
print("✅ Tables created successfully.")

# Create first admin user if not exists
def seed_admin_and_data():
    db = SessionLocal()
    admin_email = "tallantuxh@gmail.com"
    admin_password = "7230"
    admin = db.query(User).filter_by(email=admin_email).first()
    if not admin:
        hashed = bcrypt.hash(admin_password)
        admin = User(email=admin_email, hashed_password=hashed, role="admin", is_approved=True)
        db.add(admin)
        db.commit()
        print(f"Admin user {admin_email} created.")
    else:
        print(f"Admin user {admin_email} already exists.")

    # Add test feedback and logs if none exist
    if db.query(Feedback).count() == 0:
        db.add(Feedback(url="http://phishingsite.com", is_phishing=True))
        db.add(Feedback(url="http://safe-site.com", is_phishing=False))
        db.commit()
        print("Test feedback added.")
    if db.query(PredictionLog).count() == 0:
        db.add(PredictionLog(url="http://phishingsite.com", prediction=True, confidence=0.98))
        db.add(PredictionLog(url="http://safe-site.com", prediction=False, confidence=0.95))
        db.commit()
        print("Test prediction logs added.")
    if db.query(QuarantinedEmail).count() == 0:
        db.add(QuarantinedEmail(user_id=admin.id, email_content="Suspicious email content here.", reason="phishing", status="pending"))
        db.commit()
        print("Test quarantined email added.")
    db.close()

if __name__ == "__main__":
    seed_admin_and_data()
