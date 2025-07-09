import os, pickle
from sklearn.linear_model import LogisticRegression
from sklearn.feature_extraction.text import TfidfVectorizer
from app.models import Feedback
from sqlalchemy.orm import Session
import numpy as np

model = None
vectorizer = None

MODEL_PATH = "phishing_model.pkl"
VECTORIZER_PATH = "vectorizer.pkl"


def load_model():
    global model, vectorizer
    if not os.path.exists(MODEL_PATH) or not os.path.exists(VECTORIZER_PATH):
        train_model()
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    with open(VECTORIZER_PATH, "rb") as f:
        vectorizer = pickle.load(f)


def train_model():
    from sklearn.model_selection import train_test_split

    # Expanded dataset with known phishing and safe URLs
    data = [
        # Safe URLs
        "http://example.com",
        "http://safe-site.com",
        "https://www.google.com",
        "https://www.wikipedia.org",
        "https://www.github.com",
        # Phishing URLs (including test and real-world examples)
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
    vectorizer = TfidfVectorizer()
    X = vectorizer.fit_transform(data)
    model = LogisticRegression()
    model.fit(X, labels)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    with open(VECTORIZER_PATH, "wb") as f:
        pickle.dump(vectorizer, f)


def predict(url: str):
    if model is None or vectorizer is None:
        load_model()
    features = vectorizer.transform([url])
    proba = model.predict_proba(features)[0]
    return int(proba[1] > 0.5), float(proba[1])
