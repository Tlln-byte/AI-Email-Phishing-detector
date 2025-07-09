# 📚 PhishGuard AI API Documentation

Complete API reference for the PhishGuard AI phishing detection system.

## 🔗 Base URL
```
http://localhost:8000
```

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📋 API Endpoints

### Authentication Endpoints

#### POST /signup
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Signup successful! Await admin approval."
}
```

**Error Codes:**
- `400` - Email already registered
- `422` - Validation error

---

#### POST /login
Authenticate user and receive JWT token.

**Request Body (Form Data):**
```
username=user@example.com&password=securepassword123
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Error Codes:**
- `401` - Invalid credentials
- `403` - Account pending admin approval

---

### Phishing Detection Endpoints

#### POST /predict
Analyze a URL for phishing indicators.

**Request Body:**
```json
{
  "url": "https://suspicious-site.com/login"
}
```

**Response:**
```json
{
  "prediction": true,
  "confidence": 0.95
}
```

**Error Codes:**
- `422` - Invalid URL format

---

#### POST /feedback
Submit feedback on quarantined email.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "email_id": 123,
  "is_phishing": true
}
```

**Response:**
```json
{
  "status": "Feedback saved"
}
```

**Error Codes:**
- `401` - Unauthorized
- `404` - Email not found or not accessible

---

### Dashboard & Analytics Endpoints

#### GET /dashboard
Get dashboard summary statistics.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total_feedback": 150,
  "phishing": 45
}
```

---

#### GET /logs
Get recent prediction logs.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "url": "https://example.com",
    "prediction": true,
    "confidence": 0.92,
    "timestamp": "2024-01-15T10:30:00Z"
  }
]
```

---

### Email Management Endpoints

#### POST /connect-email
Test IMAP email connection.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "emailpassword",
  "imap_server": "imap.gmail.com",
  "imap_port": 993
}
```

**Response:**
```json
{
  "success": true,
  "message": "IMAP connection successful."
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "IMAP connection failed: Authentication failed"
}
```

---

#### POST /scan-email
Scan email content for phishing indicators.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "email_content": "Subject: Urgent Action Required\n\nPlease click here..."
}
```

**Response:**
```json
{
  "is_phishing": true,
  "confidence": 0.88,
  "quarantined": true,
  "email_id": 456
}
```

---

#### GET /quarantine
Get user's quarantined emails.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 123,
    "email_content": "Subject: Urgent Action Required...",
    "reason": "phishing",
    "status": "pending",
    "timestamp": "2024-01-15T10:30:00Z"
  }
]
```

---

#### POST /scan-inbox
Scan entire email inbox.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "emailpassword",
  "imap_server": "imap.gmail.com",
  "imap_port": 993
}
```

**Response:**
```json
{
  "scanned": 25,
  "quarantined": 3,
  "phishing_detected": 2
}
```

---

### Admin Endpoints

#### GET /admin/users
List all users (Admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "role": "user",
    "is_approved": true
  }
]
```

**Error Codes:**
- `401` - Unauthorized
- `403` - Admin access required

---

#### GET /admin/pending-users
List users pending approval (Admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
[
  {
    "id": 2,
    "email": "newuser@example.com"
  }
]
```

---

#### POST /admin/approve-user
Approve a user account (Admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "user_id": 2
}
```

**Response:**
```json
{
  "message": "User approved successfully"
}
```

---

#### POST /admin/reject-user
Delete/reject a user account (Admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "user_id": 2
}
```

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

---

#### POST /admin/release-email
Release email from quarantine (Admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "email_id": 123
}
```

**Response:**
```json
{
  "message": "Email released from quarantine"
}
```

---

### Model Management Endpoints

#### POST /retrain
Retrain the AI model with new data.

**Response:**
```json
{
  "status": "Model retrained"
}
```

---

#### POST /update-feeds
Update external phishing feeds.

**Response:**
```json
{
  "status": "Feeds updated"
}
```

---

### Password Reset Endpoints

#### POST /request-password-reset
Request password reset token.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset email sent"
}
```

---

#### POST /reset-password
Reset password using token.

**Request Body:**
```json
{
  "token": "reset-token-here",
  "new_password": "newsecurepassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successful"
}
```

---

### File Upload Endpoints

#### POST /scan-eml
Scan uploaded .eml file.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```
Form data with eml_file field
```

**Response:**
```json
{
  "is_phishing": true,
  "confidence": 0.85,
  "quarantined": true,
  "email_id": 789
}
```

---

### Utility Endpoints

#### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "message": "AI Phishing Detection API is running",
  "version": "1.0.0"
}
```

---

## 📊 Data Models

### User Model
```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "user",
  "is_approved": true,
  "password_reset_token": null
}
```

### Feedback Model
```json
{
  "id": 1,
  "url": "https://example.com",
  "is_phishing": true,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### PredictionLog Model
```json
{
  "id": 1,
  "url": "https://example.com",
  "prediction": true,
  "confidence": 0.92,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### QuarantinedEmail Model
```json
{
  "id": 1,
  "user_id": 1,
  "email_content": "Subject: Urgent Action Required...",
  "reason": "phishing",
  "status": "pending",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 🚨 Error Handling

### Standard Error Response Format
```json
{
  "detail": "Error message description"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

### Validation Error Response
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

## 🔧 Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **Prediction endpoints**: 100 requests per hour
- **Admin endpoints**: 50 requests per minute
- **General endpoints**: 1000 requests per hour

## 🔒 Security Considerations

### JWT Token Security
- Tokens expire after 30 minutes
- Use HTTPS in production
- Store tokens securely in frontend
- Implement token refresh mechanism

### Input Validation
- All inputs are validated using Pydantic models
- URL validation for phishing detection
- Email format validation
- Password strength requirements

### CORS Configuration
```python
origins = ["http://localhost:3000", "https://yourdomain.com"]
```

## 📝 Usage Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

// Login
const loginResponse = await axios.post('http://localhost:8000/login', 
  'username=user@example.com&password=password123',
  { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
);

const token = loginResponse.data.access_token;

// Predict URL
const predictionResponse = await axios.post('http://localhost:8000/predict', 
  { url: 'https://suspicious-site.com' },
  { headers: { 'Authorization': `Bearer ${token}` } }
);
```

### Python
```python
import requests

# Login
login_data = {'username': 'user@example.com', 'password': 'password123'}
response = requests.post('http://localhost:8000/login', data=login_data)
token = response.json()['access_token']

# Predict URL
headers = {'Authorization': f'Bearer {token}'}
prediction_data = {'url': 'https://suspicious-site.com'}
response = requests.post('http://localhost:8000/predict', 
                        json=prediction_data, headers=headers)
```

### cURL
```bash
# Login
curl -X POST "http://localhost:8000/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=password123"

# Predict URL
curl -X POST "http://localhost:8000/predict" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://suspicious-site.com"}'
```

## 📚 Additional Resources

- **Interactive API Docs**: http://localhost:8000/docs (Swagger UI)
- **Alternative Docs**: http://localhost:8000/redoc (ReDoc)
- **OpenAPI Schema**: http://localhost:8000/openapi.json

---

**For more information, visit the main documentation or contact support.** 