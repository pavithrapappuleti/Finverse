
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL
from werkzeug.security import check_password_hash

load_dotenv()

url = URL.create(
    drivername="mysql+pymysql",
    username=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    host=os.getenv("DB_HOST"),
    port=int(os.getenv("DB_PORT", 3306)),
    database=os.getenv("DB_NAME")
)

engine = create_engine(url)

with engine.connect() as connection:
    result = connection.execute(
        text("""
            SELECT password_hash
            FROM admin
            WHERE email = :email
        """),
        {"email": "admin@finverse.com"}
    ).fetchone()

    if result:
        print(
            "Aiven password matches:",
            check_password_hash(result[0], "Admin@123")
        )
    else:
        print("Admin not found in configured database")
