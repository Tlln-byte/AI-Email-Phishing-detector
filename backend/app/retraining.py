import logging
from app.database import SessionLocal
from app.models import Feedback, ExternalPhishingEntry
from app.phishing import train_model

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def retrain():
    """
    Retrains the phishing detection model using all available user feedback and external phishing feeds.
    Combines user-labeled feedback and external threat intelligence to improve the model.
    Saves the new model and vectorizer to disk.
    """
    logger.info("Retraining model started.")
    db = SessionLocal()
    try:
        # 1. Fetch all user feedback and external phishing URLs from the database
        feedback = db.query(Feedback).all()
        external = db.query(ExternalPhishingEntry).all()

        # 2. Prepare the training data and labels
        #    - User feedback: use the user's label (is_phishing)
        #    - External feeds: always label as phishing (1)
        data = [x.url for x in feedback] + [x.url for x in external]
        labels = [x.is_phishing for x in feedback] + [1] * len(external)

        if data:
            # 3. Train a new model using all available data
            from sklearn.feature_extraction.text import TfidfVectorizer
            from sklearn.linear_model import LogisticRegression
            import pickle

            vectorizer = TfidfVectorizer()
            X = vectorizer.fit_transform(data)
            model = LogisticRegression()
            model.fit(X, labels)
            # 4. Save the retrained model and vectorizer to disk
            with open("phishing_model.pkl", "wb") as f:
                pickle.dump(model, f)
            with open("vectorizer.pkl", "wb") as f:
                pickle.dump(vectorizer, f)
            logger.info("Retraining completed and model saved.")
        else:
            logger.warning("No data available for retraining.")
    except Exception as e:
        logger.error(f"Retraining failed: {e}")
    finally:
        db.close()
