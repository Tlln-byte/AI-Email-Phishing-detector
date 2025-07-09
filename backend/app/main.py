"""
AI Phishing Detection API - Main Application Entry Point

This module initializes the FastAPI application with all necessary middleware,
CORS configuration, and database setup. It serves as the main entry point
for the phishing detection backend service.

Features:
- FastAPI application with automatic API documentation
- CORS middleware for frontend communication
- Automatic database table creation
- Route registration and management
"""

from fastapi import FastAPI
from app.routes import router
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models import Base
from app.startup import initialize_database
import logging
from starlette.middleware.sessions import SessionMiddleware

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI application with metadata
app = FastAPI(
    title="AI Phishing Detection API",
    description="A comprehensive API for detecting and managing phishing emails using AI",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI documentation
    redoc_url="/redoc"  # ReDoc documentation
)

# CORS Configuration
# Allow all origins for development - should be restricted in production
origins = ["*"]

# Add CORS middleware to handle cross-origin requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # List of allowed origins
    allow_credentials=True,  # Allow cookies and authentication headers
    allow_methods=["*"],    # Allow all HTTP methods
    allow_headers=["*"],    # Allow all headers
)

# Add session middleware for temporary credential storage
app.add_middleware(SessionMiddleware, secret_key="your_super_secret_key")

# Database Initialization
# Automatically create all database tables on application startup
# This ensures the database schema is always up to date
Base.metadata.create_all(bind=engine)

# Initialize database with admin user and test data
logger.info("🚀 Starting database initialization...")
init_result = initialize_database()
logger.info(f"📊 Initialization result: {init_result}")

# Route Registration
# Include all API routes from the routes module
app.include_router(router)

@app.on_event("startup")
async def startup_event():
    """Initialize database and create admin user on application startup."""
    logger.info("🚀 Application starting up...")
    try:
        init_result = initialize_database()
        logger.info(f"✅ Startup initialization completed: {init_result}")
    except Exception as e:
        logger.error(f"❌ Startup initialization failed: {e}")

# Health Check Endpoint (Optional)
@app.get("/health")
async def health_check():
    """
    Health check endpoint to verify the API is running.
    
    Returns:
        dict: Status information about the API
    """
    return {
        "status": "healthy",
        "message": "AI Phishing Detection API is running",
        "version": "1.0.0"
    }


