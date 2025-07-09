import requests
import json

# Test data
data = {
    "email": "yearfourth6@gmail.com",
    "password": "trhbrxvtogbhevck", 
    "imap_server": "imap.gmail.com",
    "imap_port": 993
}

# Test the connection
try:
    response = requests.post(
        "http://localhost:8000/connect-email",
        json=data,
        headers={"Content-Type": "application/json"}
    )
    
    print("Status Code:", response.status_code)
    print("Response:", response.json())
    
except Exception as e:
    print("Error:", str(e)) 