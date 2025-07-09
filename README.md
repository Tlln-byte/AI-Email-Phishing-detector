# 🛡️ PhishGuard AI - Advanced Phishing Detection System

A comprehensive AI-powered phishing detection system with modern web interface, real-time email scanning, and intelligent threat analysis.

## 🌟 Features

### 🔐 Authentication & User Management
- **Secure JWT Authentication** - Token-based authentication with configurable expiration
- **Role-Based Access Control** - Admin and user roles with different permissions
- **Admin Approval System** - New users require admin approval before access
- **Password Reset Functionality** - Secure password recovery via email tokens

### 📧 Email Protection
- **Real-time Email Scanning** - AI-powered analysis of incoming emails
- **IMAP Integration** - Direct connection to email servers for automated scanning
- **Quarantine System** - Automatic isolation of suspicious emails
- **Manual Review Interface** - User-friendly interface for reviewing quarantined emails

### 🤖 AI-Powered Detection
- **Machine Learning Model** - Advanced phishing detection using trained models
- **External Threat Feeds** - Integration with phishing databases (PhishTank, OpenPhish)
- **Confidence Scoring** - Probability-based threat assessment
- **Model Retraining** - Continuous improvement through user feedback

### 📊 Analytics & Monitoring
- **Real-time Dashboard** - Live statistics and threat metrics
- **Trend Analysis** - Historical phishing activity visualization
- **Audit Logging** - Complete record of all predictions and actions
- **Performance Metrics** - Model accuracy and system performance tracking

### 🎨 Modern User Interface
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Dark Theme** - Eye-friendly interface with modern aesthetics
- **Interactive Charts** - Visual data representation using Chart.js
- **Toast Notifications** - Real-time feedback and status updates

## 🏗️ Architecture

### Frontend (React.js)
```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Login.jsx       # Authentication interface
│   │   ├── Dashboard.jsx   # Main analytics dashboard
│   │   ├── AdminUsers.jsx  # User management interface
│   │   ├── Quarantine.jsx  # Email quarantine management
│   │   └── ...            # Other components
│   ├── services/
│   │   └── api.js         # API service layer
│   └── index.js           # Application entry point
```

### Backend (FastAPI)
```
backend/
├── app/
│   ├── main.py           # FastAPI application entry point
│   ├── models.py         # SQLAlchemy database models
│   ├── auth.py           # JWT authentication logic
│   ├── routes.py         # API endpoint definitions
│   ├── phishing.py       # AI model integration
│   ├── database.py       # Database configuration
│   └── utils.py          # Utility functions
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Python 3.8+ (for local development)
- Node.js 16+ (for local development)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Full-AI-PhishingAppp
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
# Backend Configuration
SECRET_KEY=your-super-secret-key-here
DATABASE_URL=sqlite:///./phishing_detection.db

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8000
```

### 3. Start with Docker Compose
```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### 5. Create Admin User
```bash
# Access the backend container
docker-compose exec backend python

# Create admin user
from app.database import SessionLocal
from app.models import User
from app.utils import hash_password

db = SessionLocal()
admin_user = User(
    email="admin@example.com",
    hashed_password=hash_password("admin123"),
    role="admin",
    is_approved=True
)
db.add(admin_user)
db.commit()
db.close()
```

## 📖 Usage Guide

### For Administrators

#### User Management
1. **Login** with admin credentials
2. Navigate to **User Management** in the sidebar
3. **Approve** new user registrations
4. **Delete** user accounts if needed
5. Monitor user activity and system usage

#### System Monitoring
1. View **Dashboard** for real-time metrics
2. Check **Email Logs** for scanning activity
3. Review **Quarantine** for flagged emails
4. Monitor **Model Performance** and accuracy

### For Users

#### Email Scanning
1. **Connect Email Account** via IMAP settings
2. **Scan Inbox** for existing threats
3. **Upload Email Files** (.eml format) for analysis
4. Review **Scan Results** with confidence scores

#### Quarantine Management
1. Access **Quarantine** section
2. Review flagged emails
3. Provide **Feedback** on false positives/negatives
4. **Release** legitimate emails from quarantine

## 🔧 Configuration

### Backend Configuration
```python
# app/config.py
class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"
```

### Frontend Configuration
```javascript
// src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
```

## 🛠️ Development

### Local Development Setup

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

### Database Management
```bash
# Create tables
python create_tables.py

# Reset database
rm phishing_detection.db
python create_tables.py
```

### Testing
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 🔒 Security Features

### Authentication Security
- **JWT Tokens** with configurable expiration
- **Password Hashing** using bcrypt
- **Role-Based Access Control** (RBAC)
- **Session Management** with automatic cleanup

### Data Protection
- **Input Validation** using Pydantic models
- **SQL Injection Prevention** via SQLAlchemy ORM
- **CORS Configuration** for cross-origin requests
- **Environment Variable** management for secrets

### Email Security
- **IMAP SSL/TLS** connections
- **Secure Credential Storage** (not persisted)
- **Email Content Encryption** in transit
- **Quarantine Isolation** for suspicious content

## 📈 Performance Optimization

### Backend Optimizations
- **Database Indexing** on frequently queried fields
- **Connection Pooling** for database efficiency
- **Async/Await** for non-blocking operations
- **Caching** for frequently accessed data

### Frontend Optimizations
- **Code Splitting** for faster loading
- **Lazy Loading** of components
- **Memoization** for expensive calculations
- **Optimized Bundle** size

## 🐛 Troubleshooting

### Common Issues

#### Docker Issues
```bash
# Clean up containers and volumes
docker-compose down -v
docker system prune -a

# Rebuild from scratch
docker-compose up --build --force-recreate
```

#### Database Issues
```bash
# Reset database
docker-compose exec backend rm -f phishing_detection.db
docker-compose restart backend
```

#### Authentication Issues
```bash
# Clear browser cache and localStorage
# Check JWT token expiration
# Verify SECRET_KEY environment variable
```

### Logs and Debugging
```bash
# View backend logs
docker-compose logs backend

# View frontend logs
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f backend
```

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. Create a **feature branch**
3. Make your **changes**
4. Add **tests** for new functionality
5. Update **documentation**
6. Submit a **pull request**

### Code Standards
- **Python**: Follow PEP 8 guidelines
- **JavaScript**: Use ESLint and Prettier
- **Comments**: Comprehensive docstrings and inline comments
- **Testing**: Minimum 80% code coverage

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FastAPI** for the robust backend framework
- **React** for the modern frontend library
- **SQLAlchemy** for database management
- **Chart.js** for data visualization
- **PhishTank** and **OpenPhish** for threat intelligence

## 📞 Support

For support and questions:
- **Issues**: Create a GitHub issue
- **Documentation**: Check the `/docs` endpoint
- **Email**: support@phishguard.ai

---

**Made with ❤️ for a safer internet**





