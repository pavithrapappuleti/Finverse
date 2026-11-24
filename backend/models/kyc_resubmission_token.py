from datetime import datetime
from database import db


class KYCResubmissionToken(db.Model):
    __tablename__ = "kyc_resubmission_tokens"

    token_id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False
    )

    token_hash = db.Column(
        db.String(64),
        unique=True,
        nullable=False
    )

    expires_at = db.Column(
        db.DateTime,
        nullable=False
    )

    used_at = db.Column(
        db.DateTime,
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    def to_dict(self):
        return {
            "token_id": self.token_id,
            "user_id": self.user_id,
            "expires_at": self.expires_at.isoformat()
            if self.expires_at else None,
            "used_at": self.used_at.isoformat()
            if self.used_at else None,
            "created_at": self.created_at.isoformat()
            if self.created_at else None
        }