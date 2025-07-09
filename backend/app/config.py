import os

PHISHTANK_URL = os.getenv(
    "PHISHTANK_URL", "http://data.phishtank.com/data/online-valid.csv"
)
OPENPHISH_URL = os.getenv("OPENPHISH_URL", "https://openphish.com/feed.txt")
MODEL_PATH = "phishing_model.pkl"
VECTORIZER_PATH = "vectorizer.pkl"
# Use environment variable for DB_URL, default to SQLite for dev
DB_URL = os.getenv("DB_URL", "sqlite:///./phishing.db")
