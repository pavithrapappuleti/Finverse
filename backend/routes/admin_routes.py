import os
from flask import Blueprint, request, jsonify, send_file

from werkzeug.security import check_password_hash

from flask_jwt_extended import create_access_token

from flask_mail import Message
from extensions import mail

from models.admin import Admin
from models.user import User
from models.account import Account
from models.notification import Notification
from models.transaction import Transaction
from models.kyc import KYCDetails
from models.kyc_resubmission_token import KYCResubmissionToken

from database import db

import secrets
import hashlib
from datetime import datetime, timedelta


admin_bp = Blueprint("admin", __name__)


# =========================================================
# KYC RESUBMISSION TOKEN HELPER
# =========================================================

def generate_kyc_resubmission_token():

    # Generate secure random token
    raw_token = secrets.token_urlsafe(48)

    # Store only SHA-256 hash in database
    token_hash = hashlib.sha256(
        raw_token.encode("utf-8")
    ).hexdigest()

    return raw_token, token_hash


# =========================================================
# ADMIN LOGIN
# =========================================================

@admin_bp.route("/login", methods=["POST"])
def admin_login():

    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "No data provided"
        }), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "status": "error",
            "message": "Email and password are required"
        }), 400

    admin = Admin.query.filter_by(
        email=email
    ).first()

    if not admin:
        return jsonify({
            "status": "error",
            "message": "Invalid admin email or password"
        }), 401

    if admin.status != "ACTIVE":
        return jsonify({
            "status": "error",
            "message": "Admin account is inactive"
        }), 403

    if not check_password_hash(
        admin.password_hash,
        password
    ):
        return jsonify({
            "status": "error",
            "message": "Invalid admin email or password"
        }), 401

    access_token = create_access_token(
        identity=str(admin.admin_id)
    )

    return jsonify({
        "status": "success",
        "message": "Admin login successful",
        "access_token": access_token,
        "admin": admin.to_dict()
    }), 200


# =========================================================
# GET ALL USERS
# =========================================================

@admin_bp.route("/users", methods=["GET"])
def get_all_users():

    try:

        users = User.query.order_by(
            User.user_id.desc()
        ).all()

        user_list = []

        for user in users:

            account = Account.query.filter_by(
                user_id=user.user_id
            ).first()

            kyc = KYCDetails.query.filter_by(
                user_id=user.user_id
            ).first()

            user_list.append({

                "user_id": user.user_id,

                "full_name": user.full_name,

                "email": user.email,

                "phone": user.phone,

                "date_of_birth": (
                    user.date_of_birth.isoformat()
                    if user.date_of_birth
                    else None
                ),

                "address": user.address,

                "status": user.status,

                "account_number": (
                    account.account_number
                    if account
                    else None
                ),

                "account_type": (
                    account.account_type
                    if account
                    else None
                ),

                # KYC information

                "kyc_id": (
                    kyc.kyc_id
                    if kyc
                    else None
                ),

                "document_type": (
                    kyc.document_type
                    if kyc
                    else None
                ),

                "document_number": (
                    kyc.document_number
                    if kyc
                    else None
                ),

                "kyc_status": (
                    kyc.status
                    if kyc
                    else None
                ),

                "document_available": (
                    True
                    if kyc and kyc.document_path
                    else False
                )
            })

        return jsonify({
            "status": "success",
            "users": user_list
        }), 200

    except Exception as e:

        print("Get Users Error:", e)

        return jsonify({
            "status": "error",
            "message": "Failed to fetch users",
            "error": str(e)
        }), 500


# =========================================================
# VIEW KYC DOCUMENT
# =========================================================

@admin_bp.route(
    "/users/<int:user_id>/kyc-document",
    methods=["GET"]
)
def view_kyc_document(user_id):

    try:

        kyc = KYCDetails.query.filter_by(
            user_id=user_id
        ).first()

        if not kyc:
            return jsonify({
                "status": "error",
                "message": "KYC details not found"
            }), 404

        if not kyc.document_path:
            return jsonify({
                "status": "error",
                "message": "KYC document not available"
            }), 404

        return send_file(
            kyc.document_path,
            as_attachment=False
        )

    except FileNotFoundError:

        return jsonify({
            "status": "error",
            "message": "KYC document file not found on server"
        }), 404

    except Exception as e:

        print("View KYC Document Error:", e)

        return jsonify({
            "status": "error",
            "message": "Failed to open KYC document",
            "error": str(e)
        }), 500


# =========================================================
# GET KYC DETAILS FOR ONE USER
# =========================================================

@admin_bp.route(
    "/users/<int:user_id>/kyc",
    methods=["GET"]
)
def get_user_kyc(user_id):

    try:

        kyc = KYCDetails.query.filter_by(
            user_id=user_id
        ).first()

        if not kyc:
            return jsonify({
                "status": "error",
                "message": "KYC details not found"
            }), 404

        return jsonify({
            "status": "success",
            "kyc": kyc.to_dict()
        }), 200

    except Exception as e:

        print("Get KYC Error:", e)

        return jsonify({
            "status": "error",
            "message": "Failed to fetch KYC details",
            "error": str(e)
        }), 500


# =========================================================
# REJECT USER KYC
# =========================================================

@admin_bp.route(
    "/users/<int:user_id>/kyc/reject",
    methods=["PUT"]
)
def reject_user_kyc(user_id):

    try:

        # -------------------------------------------------
        # FIND USER
        # -------------------------------------------------

        user = User.query.filter_by(
            user_id=user_id
        ).first()

        if not user:
            return jsonify({
                "status": "error",
                "message": "User not found"
            }), 404

        # -------------------------------------------------
        # FIND KYC
        # -------------------------------------------------

        kyc = KYCDetails.query.filter_by(
            user_id=user_id
        ).first()

        if not kyc:
            return jsonify({
                "status": "error",
                "message": "KYC details not found"
            }), 404

        # -------------------------------------------------
        # GET REJECTION REASON
        # -------------------------------------------------

        data = request.get_json()

        if not data:
            return jsonify({
                "status": "error",
                "message": "No data provided"
            }), 400

        remarks = data.get("remarks")

        if not remarks or not remarks.strip():
            return jsonify({
                "status": "error",
                "message": "Rejection reason is required"
            }), 400

        # -------------------------------------------------
        # REJECT KYC
        # -------------------------------------------------

        kyc.status = "REJECTED"

        kyc.reviewed_at = db.func.now()

        kyc.remarks = remarks.strip()

        # -------------------------------------------------
        # KEEP USER INACTIVE
        # -------------------------------------------------

        user.status = "INACTIVE"

        # -------------------------------------------------
        # INVALIDATE OLD RESUBMISSION TOKENS
        # -------------------------------------------------

        old_tokens = KYCResubmissionToken.query.filter_by(
            user_id=user_id,
            used_at=None
        ).all()

        for old_token in old_tokens:

            old_token.used_at = datetime.utcnow()

        # -------------------------------------------------
        # GENERATE NEW RESUBMISSION TOKEN
        # -------------------------------------------------

        raw_token, token_hash = (
            generate_kyc_resubmission_token()
        )

        # Token valid for 24 hours
        expires_at = (
            datetime.utcnow()
            + timedelta(hours=24)
        )

        new_token = KYCResubmissionToken(

            user_id=user_id,

            token_hash=token_hash,

            expires_at=expires_at

        )

        db.session.add(new_token)

        # -------------------------------------------------
        # SAVE DATABASE CHANGES
        # -------------------------------------------------

        db.session.commit()

        # -------------------------------------------------
        # FRONTEND RESUBMISSION URL
        # -------------------------------------------------

        frontend_url = os.getenv(
            "FRONTEND_URL",
            "https://finverse-flax.vercel.app"
        )

        resubmission_url = (
            f"{frontend_url.rstrip('/')}/kyc-resubmit"
            f"?token={raw_token}"
        )

        resubmission_url = (
            f"{frontend_url}/kyc-resubmit"
            f"?token={raw_token}"
        )

        # -------------------------------------------------
        # SEND EMAIL
        # -------------------------------------------------

        email_status = "sent"

        try:

            msg = Message(

                subject=
                    "FINVERSE KYC Verification Rejected",

                recipients=[
                    user.email
                ]
            )

            # -------------------------------------------------
            # PLAIN TEXT EMAIL
            # -------------------------------------------------

            msg.body = f"""
Hello {user.full_name},

Your KYC verification for your FINVERSE account has been rejected.

Reason:

{remarks.strip()}

You can submit a new KYC document using the link below:

{resubmission_url}

This link is valid for 24 hours and can be used only once.

Your account will remain inactive until your KYC verification
is successfully completed.

Regards,
FINVERSE Administration
"""

            # -------------------------------------------------
            # HTML EMAIL
            # -------------------------------------------------

            msg.html = f"""
<!DOCTYPE html>

<html>

<head>

    <meta charset="UTF-8">

    <title>
        FINVERSE KYC Verification Rejected
    </title>

</head>

<body style="
    margin: 0;
    padding: 0;
    background-color: #f4f7fb;
    font-family: Arial, sans-serif;
">

<div style="
    max-width: 600px;
    margin: 40px auto;
    background-color: #ffffff;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
">

    <h2 style="
        color: #06182d;
        margin-bottom: 20px;
    ">

        FINVERSE KYC Verification

    </h2>


    <p>

        Hello
        <strong>
            {user.full_name}
        </strong>,

    </p>


    <p>

        Your KYC verification for your FINVERSE
        account has been rejected.

    </p>


    <div style="
        background-color: #fff1f1;
        border-left: 4px solid #dc3545;
        padding: 15px;
        margin: 20px 0;
    ">

        <strong>
            Reason for rejection:
        </strong>

        <p style="
            margin-bottom: 0;
        ">

            {remarks.strip()}

        </p>

    </div>


    <p>

        You can submit a new KYC document
        using the button below.

    </p>


    <div style="
        text-align: center;
        margin: 30px 0;
    ">

        <a
            href="{resubmission_url}"
            style="
                display: inline-block;
                padding: 14px 28px;
                background-color: #0d6efd;
                color: #ffffff;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
            "
        >

            Resubmit KYC

        </a>

    </div>


    <p style="
        color: #666666;
        font-size: 14px;
    ">

        This resubmission link is valid for
        <strong>24 hours</strong>
        and can be used only once.

    </p>


    <p style="
        color: #666666;
        font-size: 14px;
    ">

        Your account will remain inactive until
        your KYC verification is successfully completed.

    </p>


    <hr style="
        border: none;
        border-top: 1px solid #dddddd;
        margin: 25px 0;
    ">


    <p style="
        color: #666666;
        font-size: 13px;
    ">

        Regards,<br>

        FINVERSE Administration

    </p>

</div>

</body>

</html>
"""

            mail.send(msg)

        except Exception as email_error:

            print(
                "KYC Rejection Email Error:",
                email_error
            )

            email_status = "failed"

        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        return jsonify({

            "status":
                "success",

            "message":
                "KYC rejected successfully",

            "email_status":
                email_status,

            "kyc_status":
                kyc.status,

            "user_status":
                user.status,

            "remarks":
                kyc.remarks

        }), 200

    except Exception as e:

        db.session.rollback()

        print(
            "Reject KYC Error:",
            e
        )

        return jsonify({

            "status":
                "error",

            "message":
                "Failed to reject KYC",

            "error":
                str(e)

        }), 500


# =========================================================
# VERIFY USER KYC
# =========================================================

@admin_bp.route(
    "/users/<int:user_id>/kyc/verify",
    methods=["PUT"]
)
def verify_user_kyc(user_id):

    try:

        # -------------------------------------------------
        # FIND USER
        # -------------------------------------------------

        user = User.query.filter_by(
            user_id=user_id
        ).first()

        if not user:
            return jsonify({
                "status": "error",
                "message": "User not found"
            }), 404

        # -------------------------------------------------
        # FIND KYC
        # -------------------------------------------------

        kyc = KYCDetails.query.filter_by(
            user_id=user_id
        ).first()

        if not kyc:
            return jsonify({
                "status": "error",
                "message": "KYC details not found"
            }), 404

        # -------------------------------------------------
        # CHECK DOCUMENT
        # -------------------------------------------------

        if not kyc.document_path:
            return jsonify({
                "status": "error",
                "message": "KYC document is not available"
            }), 400

        # -------------------------------------------------
        # VERIFY KYC
        # -------------------------------------------------

        kyc.status = "VERIFIED"

        kyc.reviewed_at = db.func.now()

        kyc.remarks = "KYC verified by admin"

        # -------------------------------------------------
        # KEEP USER INACTIVE
        # -------------------------------------------------

        user.status = "INACTIVE"

        # -------------------------------------------------
        # SAVE CHANGES
        # -------------------------------------------------

        db.session.commit()

        return jsonify({

            "status":
                "success",

            "message":
                "KYC verified successfully",

            "kyc_status":
                kyc.status,

            "user_status":
                user.status,

            "remarks":
                kyc.remarks

        }), 200

    except Exception as e:

        db.session.rollback()

        print(
            "Verify KYC Error:",
            e
        )

        return jsonify({

            "status":
                "error",

            "message":
                "Failed to verify KYC",

            "error":
                str(e)

        }), 500


# =========================================================
# CHANGE USER STATUS
# =========================================================

@admin_bp.route(
    "/users/<int:user_id>/status",
    methods=["PUT"]
)
def change_user_status(user_id):

    try:

        user = User.query.filter_by(
            user_id=user_id
        ).first()

        if not user:
            return jsonify({
                "status": "error",
                "message": "User not found"
            }), 404

        data = request.get_json()

        if not data:
            return jsonify({
                "status": "error",
                "message": "No data provided"
            }), 400

        new_status = data.get("status")

        if new_status not in [
            "ACTIVE",
            "INACTIVE"
        ]:

            return jsonify({
                "status": "error",
                "message": "Invalid status"
            }), 400

        # -------------------------------------------------
        # FIND KYC
        # -------------------------------------------------

        kyc = KYCDetails.query.filter_by(
            user_id=user_id
        ).first()

        # -------------------------------------------------
        # ACTIVATE USER
        # -------------------------------------------------

        if new_status == "ACTIVE":

            # User can be activated only
            # when KYC is verified

            if kyc and kyc.status != "VERIFIED":

                return jsonify({

                    "status":
                        "error",

                    "message":
                        "User cannot be activated because KYC is not verified",

                    "kyc_status":
                        kyc.status

                }), 400

            user.status = "ACTIVE"

        # -------------------------------------------------
        # DEACTIVATE USER
        # -------------------------------------------------

        elif new_status == "INACTIVE":

            user.status = "INACTIVE"

            # Do not change KYC status
            # when verified user is deactivated.

        # -------------------------------------------------
        # SAVE CHANGES
        # -------------------------------------------------

        db.session.commit()

        return jsonify({

            "status":
                "success",

            "message":
                f"User status changed to {new_status}",

            "user":
                user.to_dict(),

            "kyc_status": (

                kyc.status

                if kyc

                else None

            )

        }), 200

    except Exception as e:

        db.session.rollback()

        print(
            "Change User Status Error:",
            e
        )

        return jsonify({

            "status":
                "error",

            "message":
                "Failed to change user status",

            "error":
                str(e)

        }), 500


# =========================================================
# GET ALL ACCOUNTS
# =========================================================

@admin_bp.route(
    "/accounts",
    methods=["GET"]
)
def get_all_accounts():

    try:

        accounts = Account.query.order_by(
            Account.account_id.desc()
        ).all()

        account_list = []

        for account in accounts:

            user = User.query.filter_by(
                user_id=account.user_id
            ).first()

            account_list.append({

                "account_id":
                    account.account_id,

                "account_number":
                    account.account_number,

                "account_type":
                    account.account_type,

                "balance": (
                    float(account.balance)
                    if account.balance is not None
                    else 0
                ),

                "user_id":
                    account.user_id,

                "full_name": (
                    user.full_name
                    if user
                    else "Unknown User"
                ),

                "email": (
                    user.email
                    if user
                    else "-"
                ),

                "user_status": (
                    user.status
                    if user
                    else "UNKNOWN"
                )

            })

        return jsonify({

            "status":
                "success",

            "accounts":
                account_list

        }), 200

    except Exception as e:

        print(
            "Get Accounts Error:",
            e
        )

        return jsonify({

            "status":
                "error",

            "message":
                "Failed to fetch accounts",

            "error":
                str(e)

        }), 500


# =========================================================
# GET ALL TRANSACTIONS
# =========================================================

@admin_bp.route(
    "/transactions",
    methods=["GET"]
)
def get_all_transactions():

    try:

        transactions = Transaction.query.order_by(
            Transaction.transaction_id.desc()
        ).all()

        transaction_list = []

        for transaction in transactions:

            account = Account.query.filter_by(
                account_id=transaction.account_id
            ).first()

            user = None

            if account:

                user = User.query.filter_by(
                    user_id=account.user_id
                ).first()

            transaction_list.append({

                "transaction_id":
                    transaction.transaction_id,

                "user_id": (

                    account.user_id

                    if account

                    else None

                ),

                "full_name": (

                    user.full_name

                    if user

                    else "Unknown User"

                ),

                "email": (

                    user.email

                    if user

                    else "-"

                ),

                "account_number": (

                    account.account_number

                    if account

                    else "-"

                ),

                "transaction_type":
                    transaction.transaction_type,

                "amount": (

                    float(transaction.amount)

                    if transaction.amount is not None

                    else 0

                ),

                "description":
                    transaction.description,

                "status":
                    transaction.status,

                "created_at": (

                    transaction.transaction_date.isoformat()

                    if transaction.transaction_date

                    else None

                )

            })

        return jsonify({

            "status":
                "success",

            "transactions":
                transaction_list

        }), 200

    except Exception as e:

        print(
            "Get Transactions Error:",
            e
        )

        return jsonify({

            "status":
                "error",

            "message":
                "Failed to fetch transactions",

            "error":
                str(e)

        }), 500


# =========================================================
# GET ALL BANK UPDATES
# =========================================================

@admin_bp.route(
    "/updates",
    methods=["GET"]
)
def get_all_updates():

    try:

        notifications = Notification.query.order_by(
            Notification.notification_id.desc()
        ).all()

        update_list = []

        for notification in notifications:

            user = User.query.filter_by(
                user_id=notification.user_id
            ).first()

            update_list.append({

                "notification_id":
                    notification.notification_id,

                "user_id":
                    notification.user_id,

                "user_name": (

                    user.full_name

                    if user

                    else "Unknown User"

                ),

                "user_email": (

                    user.email

                    if user

                    else "-"

                ),

                "title":
                    notification.title,

                "message":
                    notification.message,

                "is_read":
                    notification.is_read,

                "created_at": (

                    notification.created_at.isoformat()

                    if notification.created_at

                    else None

                )

            })

        return jsonify({

            "status":
                "success",

            "updates":
                update_list

        }), 200

    except Exception as e:

        print(
            "Get Updates Error:",
            e
        )

        return jsonify({

            "status":
                "error",

            "message":
                "Failed to fetch bank updates",

            "error":
                str(e)

        }), 500


# =========================================================
# SEND BANK UPDATE
# =========================================================

@admin_bp.route(
    "/updates",
    methods=["POST"]
)
def send_bank_update():

    try:

        data = request.get_json()

        if not data:

            return jsonify({

                "status":
                    "error",

                "message":
                    "No data provided"

            }), 400

        title = data.get("title")

        message = data.get("message")

        recipient = data.get("recipient")

        if (
            not title
            or not message
            or not recipient
        ):

            return jsonify({

                "status":
                    "error",

                "message":
                    "Title, message and recipient are required"

            }), 400

        # -------------------------------------------------
        # SEND TO ALL ACTIVE USERS
        # -------------------------------------------------

        if recipient == "ALL":

            users = User.query.filter_by(
                status="ACTIVE"
            ).all()

            if not users:

                return jsonify({

                    "status":
                        "error",

                    "message":
                        "No active users found"

                }), 404

            for user in users:

                notification = Notification(

                    user_id=user.user_id,

                    title=title,

                    message=message,

                    is_read=False

                )

                db.session.add(
                    notification
                )

            db.session.commit()

            return jsonify({

                "status":
                    "success",

                "message":
                    f"Update sent to {len(users)} users"

            }), 201

        # -------------------------------------------------
        # SEND TO ONE USER
        # -------------------------------------------------

        elif str(recipient).isdigit():

            user_id = int(recipient)

            user = User.query.filter_by(
                user_id=user_id
            ).first()

            if not user:

                return jsonify({

                    "status":
                        "error",

                    "message":
                        "User not found"

                }), 404

            notification = Notification(

                user_id=user.user_id,

                title=title,

                message=message,

                is_read=False

            )

            db.session.add(
                notification
            )

            db.session.commit()

            return jsonify({

                "status":
                    "success",

                "message":
                    "Update sent successfully"

            }), 201

        else:

            return jsonify({

                "status":
                    "error",

                "message":
                    "Invalid recipient"

            }), 400

    except Exception as e:

        db.session.rollback()

        print(
            "Send Update Error:",
            e
        )

        return jsonify({

            "status":
                "error",

            "message":
                "Failed to send update",

            "error":
                str(e)

        }), 500


# =========================================================
# DELETE BANK UPDATE
# =========================================================

@admin_bp.route(
    "/updates/<int:notification_id>",
    methods=["DELETE"]
)
def delete_bank_update(notification_id):

    try:

        notification = Notification.query.filter_by(
            notification_id=notification_id
        ).first()

        if not notification:

            return jsonify({

                "status":
                    "error",

                "message":
                    "Update not found"

            }), 404

        db.session.delete(
            notification
        )

        db.session.commit()

        return jsonify({

            "status":
                "success",

            "message":
                "Update deleted successfully"

        }), 200

    except Exception as e:

        db.session.rollback()

        print(
            "Delete Update Error:",
            e
        )

        return jsonify({

            "status":
                "error",

            "message":
                "Failed to delete update",

            "error":
                str(e)

        }), 500


# =========================================================
# ADMIN DASHBOARD STATISTICS
# =========================================================

@admin_bp.route(
    "/dashboard-stats",
    methods=["GET"]
)
def get_dashboard_stats():

    try:

        total_users = User.query.count()

        total_accounts = Account.query.count()

        total_transactions = Transaction.query.count()

        total_updates = Notification.query.count()

        return jsonify({

            "status":
                "success",

            "total_users":
                total_users,

            "total_accounts":
                total_accounts,

            "total_transactions":
                total_transactions,

            "total_updates":
                total_updates

        }), 200

    except Exception as e:

        print(
            "Dashboard Stats Error:",
            e
        )

        return jsonify({

            "status":
                "error",

            "message":
                "Failed to fetch dashboard statistics",

            "error":
                str(e)

        }), 500