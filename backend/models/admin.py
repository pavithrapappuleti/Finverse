from database import db


class Admin(db.Model):
    __tablename__ = "admin"

    admin_id = db.Column(
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

    password_hash = db.Column(
        db.String(255),
        nullable=False
    )

    created_at = db.Column(
        db.TIMESTAMP,
        server_default=db.text("CURRENT_TIMESTAMP")
    )

    status = db.Column(
        db.Enum("ACTIVE", "INACTIVE"),
        nullable=False,
        default="ACTIVE"
    )

    def to_dict(self):
        return {
            "admin_id": self.admin_id,
            "full_name": self.full_name,
            "email": self.email,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at
                else None
            ),
            "status": self.status
        }