
import os
from dotenv import load_dotenv
from sqlalchemy.engine import URL
from datetime import timedelta

load_dotenv()

class Config:

    SQLALCHEMY_DATABASE_URI = URL.create(
        drivername="mysql+pymysql",
        username=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", 3306)),
        database=os.getenv("DB_NAME")
    )

    # Enable SSL only when a CA certificate is configured
    ca_cert_path = os.getenv("DB_SSL_CA")

    if ca_cert_path:
        SQLALCHEMY_ENGINE_OPTIONS = {
            "connect_args": {
                "ssl": {
                    "ca": ca_cert_path
                }
            },
            "pool_pre_ping": True,
            "pool_recycle": 280
        }
    else:
        SQLALCHEMY_ENGINE_OPTIONS = {
            "pool_pre_ping": True,
            "pool_recycle": 280
        }

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=2)
