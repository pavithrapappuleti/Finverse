from database import db


class Transaction(db.Model):
    __tablename__ = "transactions"

    transaction_id = db.Column(
        db.BigInteger,
        primary_key=True,
        autoincrement=True
    )

    account_id = db.Column(
        db.Integer,
        nullable=False
    )

    transaction_type = db.Column(
        db.Enum("DEPOSIT", "WITHDRAW", "TRANSFER",  "CARD_PAYMENT"),
        nullable=False
    )

    amount = db.Column(
        db.Numeric(15, 2),
        nullable=False
    )

    recipient_account_id = db.Column(
        db.Integer,
        nullable=True
    )

    description = db.Column(
        db.String(255),
        nullable=True
    )

    transaction_date = db.Column(
        db.TIMESTAMP,
        server_default=db.text("CURRENT_TIMESTAMP")
    )

    status = db.Column(
        db.Enum("SUCCESS", "FAILED", "PENDING"),
        default="SUCCESS"
    )

    def to_dict(self):
        return {
            "transaction_id": self.transaction_id,
            "account_id": self.account_id,
            "transaction_type": self.transaction_type,
            "amount": float(self.amount),
            "recipient_account_id": self.recipient_account_id,
            "description": self.description,
            "transaction_date": (
                self.transaction_date.isoformat()
                if self.transaction_date
                else None
            ),
            "status": self.status
        }