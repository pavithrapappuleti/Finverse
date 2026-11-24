from datetime import date

from database import db


class User(db.Model):
    __tablename__ = "users"

    user_id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    full_name = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(100),
        unique=True,
        nullable=False
    )

    phone = db.Column(
        db.String(15),
        unique=True,
        nullable=False
    )

    password_hash = db.Column(
        db.String(255),
        nullable=False
    )

    date_of_birth = db.Column(
        db.Date,
        nullable=True
    )

    address = db.Column(
        db.String(255),
        nullable=True
    )

    created_at = db.Column(
        db.TIMESTAMP,
        server_default=db.text("CURRENT_TIMESTAMP")
    )

    status = db.Column(
        db.Enum("PENDING","ACTIVE", "INACTIVE"),
        default="PENDING"
    )

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "full_name": self.full_name,
            "email": self.email,
            "phone": self.phone,
            "date_of_birth": (
                self.date_of_birth.isoformat()
                if self.date_of_birth
                else None
            ),
            "address": self.address,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),
            "status": self.status
        }