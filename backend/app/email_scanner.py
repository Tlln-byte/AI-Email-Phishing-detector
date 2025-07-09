def scan_inbox():
    return ["http://malicious.example.com"]


def extract_urls(email_content: str):
    import re

    return re.findall(r"https?://\S+", email_content)
