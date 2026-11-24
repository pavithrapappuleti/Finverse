from database import db


class VirtualCard(db.Model):

    __tablename__ = "virtual_cards"

    card_id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id", ondelete="CASCADE"),
        nullable=False
    )

    card_number = db.Column(
        db.String(16),
        unique=True,
        nullable=False
    )

    card_holder = db.Column(
        db.String(100),
        nullable=False
    )

    expiry_date = db.Column(
        db.String(5),
        nullable=False
    )

    cvv = db.Column(
        db.String(3),
        nullable=False
    )

    status = db.Column(
        db.Enum("ACTIVE", "FROZEN"),
        default="ACTIVE"
        
    )

    spending_limit = db.Column(
        db.Numeric(10, 2),
        default=50000.00
    )

    online_payments = db.Column(
        db.Boolean,
        default=True
    )

    created_at = db.Column(
        db.TIMESTAMP,
        server_default=db.text("CURRENT_TIMESTAMP")
    )

    def to_dict(self):

        return {
            "card_id": self.card_id,
            "user_id": self.user_id,
            "card_number": self.card_number,
            "card_holder": self.card_holder,
            "expiry_date": self.expiry_date,
            "cvv": self.cvv,
            "status": self.status,
            "spending_limit": float(self.spending_limit),
            "online_payments": self.online_payments,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            )
        }