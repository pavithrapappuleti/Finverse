
import os
from dotenv import load_dotenv
from sqlalchemy.engine import URL
from datetime import timedelta

load_dotenv()

# SSL certificate location
CA_CERT_PATH = os.getenv(
    "DB_SSL_CA",
    os.path.join(os.path.dirname(__file__), "ca.pem")
)


class Config:

    SQLALCHEMY_DATABASE_URI = URL.create(
        drivername="mysql+pymysql",
        username=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", 3306)),
        database=os.getenv("DB_NAME")
    )

    SQLALCHEMY_ENGINE_OPTIONS = {
        "connect_args": {
            "ssl": {
                "ca": CA_CERT_PATH
            }
        },
        "pool_pre_ping": True,
        "pool_recycle": 280
    }

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=2)
