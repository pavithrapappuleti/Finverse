from database import db


class SavingsGoalContribution(db.Model):

    __tablename__ = "savings_goal_contributions"

    contribution_id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    goal_id = db.Column(
        db.Integer,
        nullable=False
    )

    amount = db.Column(
        db.Numeric(15, 2),
        nullable=False
    )

    saved_after = db.Column(
        db.Numeric(15, 2),
        nullable=False
    )

    created_at = db.Column(
        db.TIMESTAMP,
        server_default=db.text("CURRENT_TIMESTAMP")
    )

    def to_dict(self):

        return {
            "contribution_id": self.contribution_id,
            "goal_id": self.goal_id,
            "amount": float(self.amount),
            "saved_after": float(self.saved_after),
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            )
        }