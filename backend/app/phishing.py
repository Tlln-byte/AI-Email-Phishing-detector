# Machine learning-based phishing URL detection module
# Handles model training, loading, and prediction for phishing detection

import os, pickle
from sklearn.linear_model import LogisticRegression  # ML model for classification
from sklearn.feature_extraction.text import TfidfVectorizer  # Converts text/URLs to numeric features
from app.models import Feedback
from sqlalchemy.orm import Session
import numpy as np
import pandas as pd

# Global variables for the trained model and vectorizer
model = None
vectorizer = None

# File paths for saving/loading the trained model and vectorizer
MODEL_PATH = "phishing_model.pkl"
VECTORIZER_PATH = "vectorizer.pkl"


def load_model():
    """
    Loads the trained model and vectorizer from disk.
    If they do not exist, triggers training first.
    """
    global model, vectorizer
    if not os.path.exists(MODEL_PATH) or not os.path.exists(VECTORIZER_PATH):
        train_model()
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    with open(VECTORIZER_PATH, "rb") as f:
        vectorizer = pickle.load(f)


def train_model():
    """
    Trains the phishing detection model using a dataset of URLs and labels.
    Prefers a real-world CSV dataset if available, otherwise uses a small fallback list.
    Saves the trained model and vectorizer to disk for future use.
    """
    from sklearn.model_selection import train_test_split

    # Try to load from CSV for larger, real-world dataset
    try:
        df = pd.read_csv("phishlegiturls.csv")
        data = df['URL'].tolist()
        labels = df['Label'].tolist()
    except Exception as e:
        print(f"[WARN] Could not load phishlegiturls.csv: {e}\nUsing fallback small dataset.")
        # Fallback: small hardcoded dataset
    data = [
        # Safe URLs
        "http://example.com",
        "http://safe-site.com",
        "https://www.google.com",
        "https://www.wikipedia.org",
        "https://www.github.com",
            # Phishing URLs
        "http://malicious.xyz/phish",
        "http://www.testingmcafeesites.com/testcat_ph.html",
        "http://phishingsite.com",
        "http://malicious-link.net",
        "http://fakebank-login.com",
        "http://paypal-security-alert.com",
        "http://update-your-account.com",
        "http://secure-appleid.com",
        "http://login-facebook-support.com"
    ]
    labels = [
        0, 0, 0, 0, 0,  # Safe
        1, 1, 1, 1, 1, 1, 1, 1, 1  # Phishing
    ]

    global model, vectorizer
    # Convert URLs to TF-IDF features
    vectorizer = TfidfVectorizer()
    X = vectorizer.fit_transform(data)
    # Train a logistic regression classifier
    model = LogisticRegression()
    model.fit(X, labels)
    # Save the trained model and vectorizer for later use
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    with open(VECTORIZER_PATH, "wb") as f:
        pickle.dump(vectorizer, f)


def predict(url: str):
    """
    Predicts whether a given URL is phishing or safe.
    Returns (is_phishing: int, confidence: float)
    """
    if model is None or vectorizer is None:
        load_model()
    
    # Double-check after loading
    if model is None or vectorizer is None:
        raise ValueError("Model or vectorizer could not be loaded.")
    
    # Transform the input URL to features and predict
    features = vectorizer.transform([url])
    proba = model.predict_proba(features)[0]
    # Return 1 if phishing probability > 0.5, else 0, and the probability
    return int(proba[1] > 0.5), float(proba[1])
