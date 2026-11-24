from database import db


class ScheduledTransaction(db.Model):

    __tablename__ = "scheduled_transactions"

    schedule_id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    user_id = db.Column(
        db.Integer,
        nullable=False
    )

    transaction_type = db.Column(
        db.Enum("PAYMENT", "TRANSFER"),
        nullable=False
    )

    recipient_account_id = db.Column(
        db.Integer,
        nullable=True
    )

    amount = db.Column(
        db.Numeric(15, 2),
        nullable=False
    )

    description = db.Column(
        db.String(255),
        nullable=True
    )

    scheduled_date = db.Column(db.DateTime, nullable=False)

    frequency = db.Column(
        db.Enum("ONCE", "DAILY", "WEEKLY", "MONTHLY"),
        default="ONCE"
    )

    status = db.Column(
        db.Enum("SCHEDULED", "COMPLETED", "CANCELLED"),
        default="SCHEDULED"
    )

    created_at = db.Column(
        db.TIMESTAMP,
        server_default=db.text("CURRENT_TIMESTAMP")
    )

    def to_dict(self):
        return {
            "schedule_id": self.schedule_id,
            "user_id": self.user_id,
            "transaction_type": self.transaction_type,
            "recipient_account_id": self.recipient_account_id,
            "amount": float(self.amount),
            "description": self.description,
            "scheduled_date": (
                self.scheduled_date.isoformat()
                if self.scheduled_date
                else None
            ),
            "frequency": self.frequency,
            "status": self.status,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            )
        }