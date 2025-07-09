#!/bin/bash

# Create database tables and admin user
python create_tables.py

# Start the FastAPI application
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
