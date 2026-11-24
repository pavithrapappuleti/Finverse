from datetime import datetime

from database import db


class KYCDetails(db.Model):
    __tablename__ = "kyc_details"

    kyc_id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id"),
        nullable=False
    )

    document_type = db.Column(
        db.Enum(
            "Aadhaar",
            "PAN",
            "Passport",
            "Driving Licence",
            "Voter ID"
        ),
        nullable=False
    )

    document_number = db.Column(
        db.String(50),
        nullable=False
    )

    document_path = db.Column(
        db.String(255),
        nullable=False
    )

    status = db.Column(
        db.Enum(
            "PENDING",
            "VERIFIED",
            "REJECTED"
        ),
        default="PENDING",
        nullable=False
    )

    submitted_at = db.Column(
        db.TIMESTAMP,
        server_default=db.text("CURRENT_TIMESTAMP")
    )

    reviewed_at = db.Column(
        db.TIMESTAMP,
        nullable=True
    )

    reviewed_by = db.Column(
        db.Integer,
        nullable=True
    )

    remarks = db.Column(
        db.String(255),
        nullable=True
    )

    def to_dict(self):
        return {
            "kyc_id": self.kyc_id,
            "user_id": self.user_id,
            "document_type": self.document_type,
            "document_number": self.document_number,
            "document_path": self.document_path,
            "status": self.status,
            "submitted_at": (
                self.submitted_at.isoformat()
                if self.submitted_at
                else None
            ),
            "reviewed_at": (
                self.reviewed_at.isoformat()
                if self.reviewed_at
                else None
            ),
            "reviewed_by": self.reviewed_by,
            "remarks": self.remarks
        }