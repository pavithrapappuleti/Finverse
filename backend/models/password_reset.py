from database import db
from datetime import datetime


class PasswordReset(db.Model):

    __tablename__ = "password_resets"

    reset_id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    user_id = db.Column(
        db.Integer,
        nullable=False
    )

    email = db.Column(
        db.String(150),
        nullable=False
    )

    otp_hash = db.Column(
        db.String(255),
        nullable=False
    )

    expires_at = db.Column(
        db.DateTime,
        nullable=False
    )

    is_verified = db.Column(
        db.Boolean,
        default=False
    )

    is_used = db.Column(
        db.Boolean,
        default=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )