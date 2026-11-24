from database import db


class Account(db.Model):
    __tablename__ = "accounts"

    account_id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    user_id = db.Column(
        db.Integer,
        nullable=False
    )

    account_number = db.Column(
        db.String(20),
        nullable=False,
        unique=True
    )

    account_type = db.Column(
        db.Enum("SAVINGS", "CURRENT", "LOAN"),
        nullable=False
    )

    balance = db.Column(
        db.Numeric(15, 2),
        nullable=False,
        default=0.00
    )

    pin_hash = db.Column(
        db.String(255),
        nullable=False
    )

    created_at = db.Column(
        db.TIMESTAMP,
        server_default=db.text("CURRENT_TIMESTAMP")
    )

    def to_dict(self):
        return {
            "account_id": self.account_id,
            "user_id": self.user_id,
            "account_number": self.account_number,
            "account_type": self.account_type,
            "balance": float(self.balance),
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            )
        }