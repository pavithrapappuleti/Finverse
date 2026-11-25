from flask import Blueprint, request, jsonify
import os
import hashlib
import random
import secrets

from datetime import datetime, timedelta

from werkzeug.utils import secure_filename

from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)

from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)

from database import db

from models.user import User
from models.account import Account
from models.admin import Admin
from models.virtual_card import VirtualCard
from models.password_reset import PasswordReset
from models.kyc import KYCDetails
from models.kyc_resubmission_token import KYCResubmissionToken

from utils.virtual_card_utils import (
    generate_card_number,
    generate_cvv,
    generate_expiry_date
)

from flask_mail import Message
from extensions import mail


# =========================================================
# BLUEPRINT
# =========================================================

auth_bp = Blueprint("auth", __name__)


# =========================================================
# GENERATE OTP
# =========================================================

def generate_otp():

    return str(
        random.randint(100000, 999999)
    )


# =========================================================
# REGISTER
# =========================================================

@auth_bp.route("/register", methods=["POST"])
def register():

    try:

        # =====================================================
        # GET FORM DATA
        # =====================================================

        full_name = request.form.get("full_name")
        email = request.form.get("email")
        phone = request.form.get("phone")
        password = request.form.get("password")
        date_of_birth = request.form.get("date_of_birth")
        address = request.form.get("address")

        # Account details
        account_type = request.form.get("account_type")
        account_pin = request.form.get("account_pin")

        # KYC details
        document_type = request.form.get("document_type")
        document_number = request.form.get("document_number")
        document = request.files.get("document")

        # =====================================================
        # REQUIRED FIELD VALIDATION
        # =====================================================

        if (
            not full_name
            or not email
            or not phone
            or not password
        ):

            return jsonify({

                "status": "error",

                "message": (
                    "Full name, email, phone "
                    "and password are required"
                )

            }), 400

        if not account_type:

            return jsonify({

                "status": "error",

                "message": "Account type is required"

            }), 400

        if not account_pin:

            return jsonify({

                "status": "error",

                "message": "Account PIN is required"

            }), 400

        # =====================================================
        # VALIDATE PIN
        # =====================================================

        account_pin = str(account_pin)

        if (
            not account_pin.isdigit()
            or len(account_pin) != 4
        ):

            return jsonify({

                "status": "error",

                "message": (
                    "Account PIN must be exactly 4 digits"
                )

            }), 400

        # =====================================================
        # ACCOUNT TYPE CONVERSION
        # =====================================================

        account_type_map = {

            "Savings Account": "SAVINGS",

            "Current Account": "CURRENT",

            "Loan Account": "LOAN",

            "SAVINGS": "SAVINGS",

            "CURRENT": "CURRENT",

            "LOAN": "LOAN"

        }

        account_type = account_type_map.get(
            account_type
        )

        if not account_type:

            return jsonify({

                "status": "error",

                "message": "Invalid account type"

            }), 400

        # =====================================================
        # KYC VALIDATION
        # =====================================================

        if not document_type:

            return jsonify({

                "status": "error",

                "message": "Document type is required"

            }), 400

        if not document_number:

            return jsonify({

                "status": "error",

                "message": "Document number is required"

            }), 400

        if not document:

            return jsonify({

                "status": "error",

                "message": "KYC document is required"

            }), 400

        if not document.filename:

            return jsonify({

                "status": "error",

                "message": "Please select a KYC document"

            }), 400

        # =====================================================
        # ALLOWED KYC DOCUMENT TYPES
        # =====================================================

        allowed_document_types = [

            "Aadhaar",

            "PAN",

            "Passport",

            "Driving Licence",

            "Voter ID"

        ]

        if document_type not in allowed_document_types:

            return jsonify({

                "status": "error",

                "message": "Invalid document type"

            }), 400

        # =====================================================
        # FILE VALIDATION
        # =====================================================

        allowed_extensions = {

            "pdf",

            "jpg",

            "jpeg",

            "png"

        }

        original_filename = secure_filename(
            document.filename
        )

        if not original_filename:

            return jsonify({

                "status": "error",

                "message": "Invalid document file"

            }), 400

        if "." not in original_filename:

            return jsonify({

                "status": "error",

                "message": "Invalid document file"

            }), 400

        file_extension = (
            original_filename
            .rsplit(".", 1)[1]
            .lower()
        )

        if file_extension not in allowed_extensions:

            return jsonify({

                "status": "error",

                "message": (
                    "Only PDF, JPG, JPEG and PNG "
                    "files are allowed"
                )

            }), 400

        # =====================================================
        # FILE SIZE VALIDATION
        # =====================================================

        document.seek(
            0,
            os.SEEK_END
        )

        file_size = document.tell()

        document.seek(0)

        max_size = 5 * 1024 * 1024

        if file_size > max_size:

            return jsonify({

                "status": "error",

                "message": (
                    "KYC document size must be "
                    "less than 5 MB"
                )

            }), 400

        # =====================================================
        # CHECK EXISTING EMAIL
        # =====================================================

        email = email.strip().lower()

        existing_email = User.query.filter_by(
            email=email
        ).first()

        if existing_email:

            return jsonify({

                "status": "error",

                "message": "Email already registered"

            }), 409

        # =====================================================
        # CHECK EXISTING PHONE
        # =====================================================

        phone = phone.strip()

        existing_phone = User.query.filter_by(
            phone=phone
        ).first()

        if existing_phone:

            return jsonify({

                "status": "error",

                "message": "Phone number already registered"

            }), 409

        # =====================================================
        # HASH PASSWORD
        # =====================================================

        password_hash = generate_password_hash(
            password
        )

        # =====================================================
        # HASH ACCOUNT PIN
        # =====================================================

        pin_hash = generate_password_hash(
            account_pin
        )

        # =====================================================
        # CREATE USER
        # =====================================================

        new_user = User(

            full_name=full_name.strip(),

            email=email,

            phone=phone,

            password_hash=password_hash,

            date_of_birth=date_of_birth,

            address=(
                address.strip()
                if address
                else None
            ),

            status="PENDING"

        )

        db.session.add(new_user)

        # Get generated user_id
        db.session.flush()

        # =====================================================
        # GENERATE ACCOUNT NUMBER
        # =====================================================

        account_number = (
            "1000000000"
            + str(new_user.user_id)
        )

        # =====================================================
        # CREATE BANK ACCOUNT
        # =====================================================

        new_account = Account(

            user_id=new_user.user_id,

            account_number=account_number,

            account_type=account_type,

            balance=0.00,

            pin_hash=pin_hash

        )

        db.session.add(new_account)

        # =====================================================
        # CREATE VIRTUAL CARD
        # =====================================================

        card_number = generate_card_number()

        cvv = generate_cvv()

        expiry_date = generate_expiry_date()

        new_virtual_card = VirtualCard(

            user_id=new_user.user_id,

            card_number=card_number,

            card_holder=full_name.strip(),

            expiry_date=expiry_date,

            cvv=cvv,

            status="ACTIVE",

            spending_limit=50000.00,

            online_payments=True

        )

        db.session.add(
            new_virtual_card
        )

        # =====================================================
        # CREATE KYC UPLOAD FOLDER
        # =====================================================

        upload_folder = os.path.join(

            os.getcwd(),

            "uploads",

            "kyc"

        )

        os.makedirs(

            upload_folder,

            exist_ok=True

        )

        # =====================================================
        # SAVE KYC DOCUMENT
        # =====================================================

        filename = (

            str(new_user.user_id)

            + "_"

            + original_filename

        )

        document_path = os.path.join(

            upload_folder,

            filename

        )

        document.save(
            document_path
        )

        # =====================================================
        # CREATE KYC RECORD
        # =====================================================

        new_kyc = KYCDetails(

            user_id=new_user.user_id,

            document_type=document_type,

            document_number=document_number.strip(),

            document_path=document_path,

            status="PENDING"

        )

        db.session.add(
            new_kyc
        )

        # =====================================================
        # COMMIT EVERYTHING
        # =====================================================

        db.session.commit()

        # =====================================================
        # SUCCESS RESPONSE
        # =====================================================

        return jsonify({

            "status": "success",

            "message": (
                "Registration successful. "
                "Your account and KYC are pending "
                "admin approval."
            ),

            "user": new_user.to_dict(),

            "account": new_account.to_dict(),

            "kyc": new_kyc.to_dict()

        }), 201

    except Exception as e:

        db.session.rollback()

        print(
            "Registration Error:",
            e
        )

        return jsonify({

            "status": "error",

            "message": "Registration failed",

            "error": str(e)

        }), 500


# =========================================================
# LOGIN
# =========================================================

@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    if not data:

        return jsonify({
            "status": "error",
            "message": "No data provided"
        }), 400

    email = data.get("email")

    password = data.get("password")

    # =====================================================
    # VALIDATE FIELDS
    # =====================================================

    if not email or not password:

        return jsonify({

            "status": "error",

            "message": "Email and password are required"

        }), 400

    email = email.strip().lower()

    # =====================================================
    # CHECK ADMIN FIRST
    # =====================================================

    admin = Admin.query.filter_by(
        email=email
    ).first()

    if admin:

        if admin.status != "ACTIVE":

            return jsonify({

                "status": "error",

                "message": "Admin account is inactive"

            }), 403

        if check_password_hash(
            admin.password_hash,
            password
        ):

            access_token = create_access_token(

                identity=str(
                    admin.admin_id
                ),

                additional_claims={

                    "role": "admin"

                }

            )

            return jsonify({

                "status": "success",

                "message": "Admin login successful",

                "access_token": access_token,

                "role": "admin",

                "admin": admin.to_dict()

            }), 200

        else:

            return jsonify({

                "status": "error",

                "message": "Invalid email or password"

            }), 401

    # =====================================================
    # CHECK NORMAL USER
    # =====================================================

    user = User.query.filter_by(
        email=email
    ).first()

    if not user:

        return jsonify({

            "status": "error",

            "message": "Invalid email or password"

        }), 401

    # =====================================================
    # CHECK PASSWORD
    # =====================================================

    if not check_password_hash(

        user.password_hash,

        password

    ):

        return jsonify({

            "status": "error",

            "message": "Invalid email or password"

        }), 401

    # =====================================================
    # CHECK PENDING
    # =====================================================

    if user.status == "PENDING":

        return jsonify({

            "status": "error",

            "message": (
                "Your account is waiting "
                "for admin approval."
            )

        }), 403

    # =====================================================
    # CHECK INACTIVE
    # =====================================================

    if user.status == "INACTIVE":

        kyc = KYCDetails.query.filter_by(

            user_id=user.user_id

        ).first()

        # -------------------------------------------------
        # KYC REJECTED
        # -------------------------------------------------

        if kyc and kyc.status == "REJECTED":

            access_token = create_access_token(

                identity=str(
                    user.user_id
                ),

                additional_claims={

                    "role": "user",

                    "kyc_resubmission": True

                }

            )

            return jsonify({

                "status": "kyc_rejected",

                "message": (
                    "Your KYC verification was rejected. "
                    "Please resubmit your KYC documents."
                ),

                "access_token": access_token,

                "role": "user",

                "kyc_resubmission": True,

                "kyc_status": kyc.status,

                "remarks": kyc.remarks

            }), 200

        # -------------------------------------------------
        # OTHER INACTIVE USERS
        # -------------------------------------------------

        return jsonify({

            "status": "error",

            "message": (
                "Your account has been deactivated."
            )

        }), 403

    # =====================================================
    # CREATE NORMAL USER JWT
    # =====================================================

    access_token = create_access_token(

        identity=str(
            user.user_id
        ),

        additional_claims={

            "role": "user",

            "kyc_resubmission": False

        }

    )

    # =====================================================
    # GET ACCOUNT
    # =====================================================

    account = Account.query.filter_by(

        user_id=user.user_id

    ).first()

    return jsonify({

        "status": "success",

        "message": "Login successful",

        "access_token": access_token,

        "role": "user",

        "kyc_resubmission": False,

        "user": user.to_dict(),

        "account": (

            account.to_dict()

            if account

            else None

        )

    }), 200


# =========================================================
# FORGOT PASSWORD
# SEND OTP
# =========================================================

@auth_bp.route(
    "/forgot-password",
    methods=["POST"]
)
def forgot_password():

    data = request.get_json()

    if not data:

        return jsonify({

            "status": "error",

            "message": "Request data is required"

        }), 400

    email = data.get("email")

    if not email:

        return jsonify({

            "status": "error",

            "message": "Email is required"

        }), 400

    email = email.strip().lower()

    # =====================================================
    # FIND USER
    # =====================================================

    user = User.query.filter_by(

        email=email

    ).first()

    # =====================================================
    # DON'T REVEAL EMAIL EXISTENCE
    # =====================================================

    if not user:

        return jsonify({

            "status": "success",

            "message": (
                "If the email is registered, "
                "an OTP has been sent"
            )

        }), 200

    # =====================================================
    # GENERATE OTP
    # =====================================================

    otp = generate_otp()

    print(
        "Generated OTP:",
        otp
    )

    # =====================================================
    # HASH OTP
    # =====================================================

    otp_hash = generate_password_hash(
        otp
    )

    # =====================================================
    # OTP EXPIRES AFTER 5 MINUTES
    # =====================================================

    expires_at = (

        datetime.utcnow()

        + timedelta(minutes=5)

    )

    try:

        # =================================================
        # INVALIDATE PREVIOUS REQUESTS
        # =================================================

        previous_requests = PasswordReset.query.filter_by(

            user_id=user.user_id,

            is_used=False

        ).all()

        for reset_request in previous_requests:

            reset_request.is_used = True

        # =================================================
        # CREATE NEW RESET REQUEST
        # =================================================

        reset_request = PasswordReset(

            user_id=user.user_id,

            email=email,

            otp_hash=otp_hash,

            expires_at=expires_at,

            is_verified=False,

            is_used=False

        )

        db.session.add(
            reset_request
        )

        db.session.commit()

        # =================================================
        # CREATE EMAIL
        # =================================================

        message = Message(
    subject="FINVERSE - Password Reset OTP",
    recipients=[email]
)

        message.body = f"""

Hello {user.full_name},

We received a request to reset your FINVERSE account password.

Your OTP is:

{otp}

This OTP is valid for 5 minutes.

If you did not request a password reset, please ignore this email.

Regards,
FINVERSE Banking Team

"""

        # =================================================
        # SEND EMAIL
        # =================================================

        mail.send(message)

        return jsonify({

            "status": "success",

            "message": "OTP has been sent to your email"

        }), 200

    except Exception as e:

        db.session.rollback()

        print(
            "Forgot Password Error:",
            e
        )

        return jsonify({

            "status": "error",

            "message": "Unable to send OTP"

        }), 500


# =========================================================
# VERIFY RESET OTP
# =========================================================

@auth_bp.route(
    "/verify-reset-otp",
    methods=["POST"]
)
def verify_reset_otp():

    data = request.get_json()

    if not data:

        return jsonify({

            "status": "error",

            "message": "Request data is required"

        }), 400

    email = data.get("email")

    otp = data.get("otp")

    if not email or not otp:

        return jsonify({

            "status": "error",

            "message": "Email and OTP are required"

        }), 400

    email = email.strip().lower()

    otp = str(otp).strip()

    # =====================================================
    # VALIDATE OTP
    # =====================================================

    if not otp.isdigit() or len(otp) != 6:

        return jsonify({

            "status": "error",

            "message": "OTP must be exactly 6 digits"

        }), 400

    # =====================================================
    # FIND USER
    # =====================================================

    user = User.query.filter_by(

        email=email

    ).first()

    if not user:

        return jsonify({

            "status": "error",

            "message": "Invalid OTP"

        }), 400

    # =====================================================
    # FIND LATEST RESET REQUEST
    # =====================================================

    reset_request = PasswordReset.query.filter_by(

        user_id=user.user_id,

        email=email,

        is_used=False

    ).order_by(

        PasswordReset.reset_id.desc()

    ).first()

    if not reset_request:

        return jsonify({

            "status": "error",

            "message": (
                "No active password reset "
                "request found"
            )

        }), 400

    # =====================================================
    # CHECK EXPIRATION
    # =====================================================

    if datetime.utcnow() > reset_request.expires_at:

        reset_request.is_used = True

        db.session.commit()

        return jsonify({

            "status": "error",

            "message": "OTP has expired"

        }), 400

    # =====================================================
    # CHECK OTP
    # =====================================================

    if not check_password_hash(

        reset_request.otp_hash,

        otp

    ):

        return jsonify({

            "status": "error",

            "message": "Invalid OTP"

        }), 400

    # =====================================================
    # MARK VERIFIED
    # =====================================================

    reset_request.is_verified = True

    db.session.commit()

    return jsonify({

        "status": "success",

        "message": "OTP verified successfully"

    }), 200


# =========================================================
# RESET PASSWORD
# =========================================================

@auth_bp.route(
    "/reset-password",
    methods=["POST"]
)
def reset_password():

    data = request.get_json()

    if not data:

        return jsonify({

            "status": "error",

            "message": "Request data is required"

        }), 400

    email = data.get("email")

    otp = data.get("otp")

    new_password = data.get(
        "new_password"
    )

    if not email or not otp or not new_password:

        return jsonify({

            "status": "error",

            "message": (
                "Email, OTP and new password "
                "are required"
            )

        }), 400

    email = email.strip().lower()

    otp = str(otp).strip()

    # =====================================================
    # VALIDATE OTP
    # =====================================================

    if not otp.isdigit() or len(otp) != 6:

        return jsonify({

            "status": "error",

            "message": "OTP must be exactly 6 digits"

        }), 400

    # =====================================================
    # VALIDATE PASSWORD
    # =====================================================

    if len(new_password) < 8:

        return jsonify({

            "status": "error",

            "message": (
                "Password must contain at least "
                "8 characters"
            )

        }), 400

    if not any(
        char.isupper()
        for char in new_password
    ):

        return jsonify({

            "status": "error",

            "message": (
                "Password must contain at least "
                "one uppercase letter"
            )

        }), 400

    if not any(
        char.islower()
        for char in new_password
    ):

        return jsonify({

            "status": "error",

            "message": (
                "Password must contain at least "
                "one lowercase letter"
            )

        }), 400

    if not any(
        char.isdigit()
        for char in new_password
    ):

        return jsonify({

            "status": "error",

            "message": (
                "Password must contain at least "
                "one digit"
            )

        }), 400

    # =====================================================
    # FIND USER
    # =====================================================

    user = User.query.filter_by(

        email=email

    ).first()

    if not user:

        return jsonify({

            "status": "error",

            "message": (
                "Invalid password reset request"
            )

        }), 400

    # =====================================================
    # FIND RESET REQUEST
    # =====================================================

    reset_request = PasswordReset.query.filter_by(

        user_id=user.user_id,

        email=email,

        is_used=False

    ).order_by(

        PasswordReset.reset_id.desc()

    ).first()

    if not reset_request:

        return jsonify({

            "status": "error",

            "message": (
                "No active password reset "
                "request found"
            )

        }), 400

    # =====================================================
    # CHECK EXPIRATION
    # =====================================================

    if datetime.utcnow() > reset_request.expires_at:

        reset_request.is_used = True

        db.session.commit()

        return jsonify({

            "status": "error",

            "message": "OTP has expired"

        }), 400

    # =====================================================
    # CHECK OTP VERIFICATION
    # =====================================================

    if not reset_request.is_verified:

        return jsonify({

            "status": "error",

            "message": (
                "Please verify the OTP first"
            )

        }), 400

    # =====================================================
    # VERIFY OTP AGAIN
    # =====================================================

    if not check_password_hash(

        reset_request.otp_hash,

        otp

    ):

        return jsonify({

            "status": "error",

            "message": "Invalid OTP"

        }), 400

    # =====================================================
    # HASH NEW PASSWORD
    # =====================================================

    user.password_hash = generate_password_hash(
        new_password
    )

    # =====================================================
    # MARK USED
    # =====================================================

    reset_request.is_used = True

    try:

        db.session.commit()

        return jsonify({

            "status": "success",

            "message": (
                "Password reset successfully. "
                "You can now login."
            )

        }), 200

    except Exception as e:

        db.session.rollback()

        print(
            "Reset Password Error:",
            e
        )

        return jsonify({

            "status": "error",

            "message": "Unable to reset password"

        }), 500


# =========================================================
# PROFILE
# =========================================================

@auth_bp.route(
    "/profile",
    methods=["GET"]
)
@jwt_required()
def get_profile():

    user_id = int(
        get_jwt_identity()
    )

    user = User.query.filter_by(

        user_id=user_id

    ).first()

    if not user:

        return jsonify({

            "status": "error",

            "message": "User not found"

        }), 404

    account = Account.query.filter_by(

        user_id=user_id

    ).first()

    return jsonify({

        "status": "success",

        "message": (
            "Profile retrieved successfully"
        ),

        "user": {

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

            "status": user.status

        },

        "account": (

            account.to_dict()

            if account

            else None

        )

    }), 200


# =========================================================
# RESET PIN
# =========================================================

@auth_bp.route(
    "/reset-pin",
    methods=["POST"]
)
@jwt_required()
def reset_pin():

    user_id = int(
        get_jwt_identity()
    )

    data = request.get_json()

    if not data:

        return jsonify({

            "status": "error",

            "message": "Request data is required"

        }), 400

    password = data.get(
        "password"
    )

    new_pin = data.get(
        "new_pin"
    )

    if not password or not new_pin:

        return jsonify({

            "status": "error",

            "message": (
                "Password and new PIN are required"
            )

        }), 400

    new_pin = str(
        new_pin
    )

    # =====================================================
    # VALIDATE PIN
    # =====================================================

    if (

        not new_pin.isdigit()

        or len(new_pin) != 4

    ):

        return jsonify({

            "status": "error",

            "message": (
                "PIN must contain exactly 4 digits"
            )

        }), 400

    # =====================================================
    # FIND USER
    # =====================================================

    user = User.query.filter_by(

        user_id=user_id

    ).first()

    if not user:

        return jsonify({

            "status": "error",

            "message": "User not found"

        }), 404

    # =====================================================
    # VERIFY PASSWORD
    # =====================================================

    if not check_password_hash(

        user.password_hash,

        password

    ):

        return jsonify({

            "status": "error",

            "message": "Incorrect account password"

        }), 401

    # =====================================================
    # FIND ACCOUNT
    # =====================================================

    account = Account.query.filter_by(

        user_id=user_id

    ).first()

    if not account:

        return jsonify({

            "status": "error",

            "message": "Bank account not found"

        }), 404

    # =====================================================
    # HASH NEW PIN
    # =====================================================

    account.pin_hash = generate_password_hash(
        new_pin
    )

    try:

        db.session.commit()

        return jsonify({

            "status": "success",

            "message": "PIN reset successfully"

        }), 200

    except Exception as e:

        db.session.rollback()

        print(
            "Reset PIN Error:",
            e
        )

        return jsonify({

            "status": "error",

            "message": "Failed to reset PIN"

        }), 500


# =========================================================
# KYC RESUBMISSION
# =========================================================
#
# IMPORTANT:
#
# This endpoint does NOT use @jwt_required().
#
# The token received from the email link is a temporary
# KYC resubmission token, not a normal login JWT.
#
# =========================================================

@auth_bp.route(
    "/kyc/resubmit",
    methods=["PUT"]
)
def resubmit_kyc():

    try:

        # =================================================
        # GET TEMPORARY TOKEN
        # =================================================

        token = request.form.get("token")

        if not token:

            return jsonify({

                "status": "error",

                "message": (
                    "KYC resubmission token is required"
                )

            }), 400

        token = token.strip()

        # =================================================
        # HASH TOKEN
        # =================================================

        token_hash = hashlib.sha256(

            token.encode("utf-8")

        ).hexdigest()

        # =================================================
        # FIND TOKEN
        # =================================================

        resubmission_token = (
            KYCResubmissionToken.query
            .filter_by(
                token_hash=token_hash
            )
            .first()
        )

        if not resubmission_token:

            return jsonify({

                "status": "error",

                "message": (
                    "Invalid KYC resubmission link"
                )

            }), 401

        # =================================================
        # CHECK IF TOKEN ALREADY USED
        # =================================================

        if resubmission_token.used_at:

            return jsonify({

                "status": "error",

                "message": (
                    "This KYC resubmission link "
                    "has already been used"
                )

            }), 401

        # =================================================
        # CHECK TOKEN EXPIRATION
        # =================================================

        if (
            datetime.utcnow()
            > resubmission_token.expires_at
        ):

            return jsonify({

                "status": "error",

                "message": (
                    "This KYC resubmission link has expired"
                )

            }), 401

        # =================================================
        # GET USER ID FROM TOKEN
        # =================================================

        user_id = resubmission_token.user_id

        # =================================================
        # GET FORM DATA
        # =================================================

        document_type = request.form.get(
            "document_type"
        )

        document_number = request.form.get(
            "document_number"
        )

        document = request.files.get(
            "document"
        )

        # =================================================
        # VALIDATE REQUIRED FIELDS
        # =================================================

        if (
            not document_type
            or not document_number
            or not document
        ):

            return jsonify({

                "status": "error",

                "message": (
                    "Document type, document number "
                    "and document are required"
                )

            }), 400

        # =================================================
        # ALLOWED DOCUMENT TYPES
        # =================================================

        allowed_document_types = [

            "Aadhaar",

            "PAN",

            "Passport",

            "Driving Licence",

            "Voter ID"

        ]

        if document_type not in allowed_document_types:

            return jsonify({

                "status": "error",

                "message": "Invalid document type"

            }), 400

        # =================================================
        # FIND USER
        # =================================================

        user = User.query.filter_by(

            user_id=user_id

        ).first()

        if not user:

            return jsonify({

                "status": "error",

                "message": "User not found"

            }), 404

        # =================================================
        # FIND EXISTING KYC
        # =================================================

        kyc = KYCDetails.query.filter_by(

            user_id=user_id

        ).first()

        if not kyc:

            return jsonify({

                "status": "error",

                "message": "KYC details not found"

            }), 404

        # =================================================
        # ONLY REJECTED KYC CAN BE RESUBMITTED
        # =================================================

        if kyc.status != "REJECTED":

            return jsonify({

                "status": "error",

                "message": (
                    "KYC resubmission is allowed "
                    "only for rejected KYC"
                ),

                "kyc_status": kyc.status

            }), 400

        # =================================================
        # VALIDATE FILE
        # =================================================

        if not document.filename:

            return jsonify({

                "status": "error",

                "message": "Please select a document"

            }), 400

        # =================================================
        # VALIDATE FILE EXTENSION
        # =================================================

        allowed_extensions = {

            "pdf",

            "jpg",

            "jpeg",

            "png"

        }

        original_filename = secure_filename(

            document.filename

        )

        if not original_filename:

            return jsonify({

                "status": "error",

                "message": "Invalid document file"

            }), 400

        if "." not in original_filename:

            return jsonify({

                "status": "error",

                "message": "Invalid document file"

            }), 400

        file_extension = (

            original_filename
            .rsplit(".", 1)[1]
            .lower()

        )

        if file_extension not in allowed_extensions:

            return jsonify({

                "status": "error",

                "message": (
                    "Only PDF, JPG, JPEG and PNG "
                    "files are allowed"
                )

            }), 400

        # =================================================
        # VALIDATE FILE SIZE
        # =================================================

        document.seek(
            0,
            os.SEEK_END
        )

        file_size = document.tell()

        document.seek(0)

        max_size = 5 * 1024 * 1024

        if file_size > max_size:

            return jsonify({

                "status": "error",

                "message": (
                    "KYC document size must be "
                    "less than 5 MB"
                )

            }), 400

        # =================================================
        # CREATE UPLOAD FOLDER
        # =================================================

        upload_folder = os.path.join(

            os.getcwd(),

            "uploads",

            "kyc"

        )

        os.makedirs(

            upload_folder,

            exist_ok=True

        )

        # =================================================
        # SAVE NEW DOCUMENT
        # =================================================

        filename = (

            str(user_id)

            + "_"

            + original_filename

        )

        document_path = os.path.join(

            upload_folder,

            filename

        )

        document.save(

            document_path

        )

        # =================================================
        # UPDATE EXISTING KYC RECORD
        # =================================================

        kyc.document_type = document_type

        kyc.document_number = (

            document_number.strip().upper()

        )

        kyc.document_path = document_path

        # REJECTED → PENDING

        kyc.status = "PENDING"

        kyc.submitted_at = db.func.now()

        kyc.reviewed_at = None

        kyc.reviewed_by = None

        kyc.remarks = None

        # =================================================
        # KEEP USER ACCOUNT INACTIVE
        # =================================================

        user.status = "INACTIVE"

        # =================================================
        # MARK TEMPORARY TOKEN AS USED
        # =================================================

        resubmission_token.used_at = db.func.now()

        # =================================================
        # COMMIT EVERYTHING
        # =================================================

        db.session.commit()

        # =================================================
        # SUCCESS RESPONSE
        # =================================================

        return jsonify({

            "status": "success",

            "message": (
                "KYC resubmitted successfully. "
                "Your document is now under review."
            ),

            "kyc_status": kyc.status,

            "user_status": user.status

        }), 200

    except Exception as e:

        db.session.rollback()

        print(
            "KYC Resubmission Error:",
            e
        )

        return jsonify({

            "status": "error",

            "message": "KYC resubmission failed",

            "error": str(e)

        }), 500