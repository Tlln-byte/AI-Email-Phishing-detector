import requests, csv
import logging
from app.models import ExternalPhishingEntry
from app.database import SessionLocal
from app.config import PHISHTANK_URL, OPENPHISH_URL
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def fetch_and_store():
    """
    Fetches phishing URLs from external threat intelligence feeds (PhishTank and OpenPhish)
    and stores any new URLs in the database for use in model retraining and detection.
    """
    db = SessionLocal()
    urls = set()  # Use a set to avoid duplicate URLs
    logger.info("Fetching phishing feeds...")
    try:
        # 1. Fetch and parse the PhishTank CSV feed
        resp = requests.get(PHISHTANK_URL, timeout=10)
        reader = csv.DictReader(resp.text.splitlines())
        for row in reader:
            urls.add((row["url"], "PhishTank"))
        logger.info(f"Fetched {len(urls)} URLs from PhishTank.")
    except Exception as e:
        logger.error(f"Failed to fetch from PhishTank: {e}")

    try:
        # 2. Fetch and parse the OpenPhish plain text feed
        resp = requests.get(OPENPHISH_URL, timeout=10)
        count = 0
        for line in resp.text.splitlines():
            urls.add((line.strip(), "OpenPhish"))
            count += 1
        logger.info(f"Fetched {count} URLs from OpenPhish.")
    except Exception as e:
        logger.error(f"Failed to fetch from OpenPhish: {e}")

    added = 0
    # 3. Store any new URLs in the database (skip duplicates)
    for url, source in urls:
        if not db.query(ExternalPhishingEntry).filter_by(url=url).first():
            db.add(ExternalPhishingEntry(url=url, source=source))
            added += 1
    db.commit()
    db.close()
    logger.info(f"Stored {added} new phishing URLs.")
