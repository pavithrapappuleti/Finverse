
import os
import base64

from email.mime.text import MIMEText

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build


SCOPES = [
    "https://www.googleapis.com/auth/gmail.send"
]


def send_email(to_email, subject, body):

    credentials = Credentials(
        token=None,
        refresh_token=os.getenv("GOOGLE_REFRESH_TOKEN"),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.getenv("GOOGLE_CLIENT_ID"),
        client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
        scopes=SCOPES
    )

    service = build(
        "gmail",
        "v1",
        credentials=credentials,
        cache_discovery=False
    )

    message = MIMEText(body)
    message["to"] = to_email
    message["from"] = os.getenv("GMAIL_SENDER_EMAIL")
    message["subject"] = subject

    encoded_message = base64.urlsafe_b64encode(
        message.as_bytes()
    ).decode()

    result = service.users().messages().send(
        userId="me",
        body={"raw": encoded_message}
    ).execute()

    print("Email sent successfully:", result.get("id"))

    return result
