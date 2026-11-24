from database import db


class SavingsGoal(db.Model):

    __tablename__ = "savings_goals"

    goal_id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    user_id = db.Column(
        db.Integer,
        nullable=False
    )

    goal_name = db.Column(
        db.String(100),
        nullable=False
    )

    target_amount = db.Column(
        db.Numeric(15, 2),
        nullable=False
    )

    saved_amount = db.Column(
        db.Numeric(15, 2),
        nullable=False,
        default=0.00
    )

    target_date = db.Column(
        db.Date,
        nullable=True
    )

    status = db.Column(
        db.Enum("ACTIVE", "COMPLETED"),
        default="ACTIVE"
    )

    created_at = db.Column(
        db.TIMESTAMP,
        server_default=db.text("CURRENT_TIMESTAMP")
    )

    def to_dict(self):

        return {
            "goal_id": self.goal_id,
            "user_id": self.user_id,
            "goal_name": self.goal_name,
            "target_amount": float(self.target_amount),
            "saved_amount": float(self.saved_amount),
            "target_date": (
                self.target_date.isoformat()
                if self.target_date
                else None
            ),
            "status": self.status,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            )
        }