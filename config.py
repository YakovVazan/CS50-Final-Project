import os
from dotenv import load_dotenv

load_dotenv()

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")

X_API_KEY = os.getenv("X_API_KEY")
X_KEY_SECRET = os.getenv("X_KEY_SECRET")
X_ACCESS_TOKEN = os.getenv("X_ACCESS_TOKEN")
X_ACCESS_TOKEN_SECRET = os.getenv("X_ACCESS_TOKEN_SECRET")
X_BEARER_TOKEN = os.getenv("X_BEARER_TOKEN")
X_CLIENT_ID = os.getenv("X_CLIENT_ID")
X_CLIENT_SECRET = os.getenv("X_CLIENT_SECRET")

SOCIALHUB_APP_OWNER_EMAIL = os.getenv("SOCIALHUB_APP_OWNER_EMAIL")
SOCIALHUB_APP_OFFICIAL_EMAIL = os.getenv("SOCIALHUB_APP_OFFICIAL_EMAIL")
SOCIALHUB_APP_OFFICIAL_EMAIL_PASSWORD = os.getenv(
    "SOCIALHUB_APP_OFFICIAL_EMAIL_PASSWORD")
SOCIALHUB_VERSION_NUMBERING = os.getenv("SOCIALHUB_VERSION_NUMBERING")

email_visuals = {
    "src": "https://cdn.jim-nielsen.com/ios/1024/mail-2023-10-05.png",
    "alt": "mail-logo"
}
