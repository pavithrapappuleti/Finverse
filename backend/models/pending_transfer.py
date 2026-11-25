
from datetime import datetime
from database import db


class PendingTransfer(db.Model):
    __tablename__ = "pending_transfers"

    pending_transfer_id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    sender_user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        nullable=False
    )

    sender_account_id = db.Column(
        db.Integer,
        db.ForeignKey("accounts.account_id"),
        nullable=False
    )

    recipient_account_id = db.Column(
        db.Integer,
        db.ForeignKey("accounts.account_id"),
        nullable=False
    )

    amount = db.Column(
        db.Numeric(12, 2),
        nullable=False
    )

    description = db.Column(
        db.String(255),
        default="Money transfer"
    )

    otp_hash = db.Column(
        db.String(255),
        nullable=False
    )

    expires_at = db.Column(
        db.DateTime,
        nullable=False
    )

    last_otp_sent_at = db.Column(
        db.DateTime,
        nullable=False
    )

    attempts = db.Column(
        db.Integer,
        default=0,
        nullable=False
    )

    status = db.Column(
        db.String(20),
        default="PENDING",
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    completed_at = db.Column(
        db.DateTime,
        nullable=True
    )
