from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from werkzeug.security import (
    check_password_hash,
    generate_password_hash
)

from datetime import datetime, timedelta
from decimal import Decimal, InvalidOperation
import secrets

from database import db

from models.account import Account
from models.transaction import Transaction
from models.virtual_card import VirtualCard
from models.notification import Notification
from models.user import User
from models.pending_transfer import PendingTransfer

from gmail_service import send_email


transaction_bp = Blueprint("transaction", __name__)


# =========================================================
# DEPOSIT MONEY
# =========================================================

@transaction_bp.route("/deposit", methods=["POST"])
@jwt_required()
def deposit_money():

    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request data is required"
        }), 400

    amount = data.get("amount")
    pin = data.get("pin")
    description = data.get("description", "Cash deposit")

    if amount is None or not pin:
        return jsonify({
            "status": "error",
            "message": "Amount and PIN are required"
        }), 400

    try:
        amount = float(amount)
    except (ValueError, TypeError):
        return jsonify({
            "status": "error",
            "message": "Invalid amount"
        }), 400

    if amount <= 0:
        return jsonify({
            "status": "error",
            "message": "Amount must be greater than zero"
        }), 400

    if not str(pin).isdigit() or len(str(pin)) != 4:
        return jsonify({
            "status": "error",
            "message": "PIN must be exactly 4 digits"
        }), 400

    account = Account.query.filter_by(
        user_id=user_id
    ).first()

    if not account:
        return jsonify({
            "status": "error",
            "message": "Bank account not found"
        }), 404

    if not check_password_hash(account.pin_hash, str(pin)):
        return jsonify({
            "status": "error",
            "message": "Invalid PIN"
        }), 401

    try:
        account.balance = float(account.balance) + amount

        transaction = Transaction(
            account_id=account.account_id,
            transaction_type="DEPOSIT",
            amount=amount,
            recipient_account_id=None,
            description=description,
            status="SUCCESS"
        )

        notification = Notification(
            user_id=user_id,
            title="Deposit Successful",
            message=(
                f"₹{amount:,.2f} has been deposited "
                "into your account."
            ),
            is_read=False
        )

        db.session.add(transaction)
        db.session.add(notification)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Money deposited successfully",
            "deposit": {
                "transaction_id": transaction.transaction_id,
                "account_number": account.account_number,
                "amount": amount,
                "description": description,
                "new_balance": float(account.balance)
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        print("Deposit Error:", e)

        return jsonify({
            "status": "error",
            "message": "Deposit failed"
        }), 500


# =========================================================
# WITHDRAW MONEY
# =========================================================

@transaction_bp.route("/withdraw", methods=["POST"])
@jwt_required()
def withdraw_money():

    user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request data is required"
        }), 400

    amount = data.get("amount")
    pin = data.get("pin")

    if amount is None or not pin:
        return jsonify({
            "status": "error",
            "message": "Amount and PIN are required"
        }), 400

    try:
        amount = float(amount)
    except (ValueError, TypeError):
        return jsonify({
            "status": "error",
            "message": "Invalid amount"
        }), 400

    if amount <= 0:
        return jsonify({
            "status": "error",
            "message": "Amount must be greater than zero"
        }), 400

    if not str(pin).isdigit() or len(str(pin)) != 4:
        return jsonify({
            "status": "error",
            "message": "PIN must be exactly 4 digits"
        }), 400

    account = Account.query.filter_by(
        user_id=user_id
    ).first()

    if not account:
        return jsonify({
            "status": "error",
            "message": "Bank account not found"
        }), 404

    if not check_password_hash(account.pin_hash, str(pin)):
        return jsonify({
            "status": "error",
            "message": "Invalid PIN"
        }), 401

    if float(account.balance) < amount:
        return jsonify({
            "status": "error",
            "message": "Insufficient balance"
        }), 400

    try:
        account.balance = float(account.balance) - amount

        transaction = Transaction(
            account_id=account.account_id,
            transaction_type="WITHDRAW",
            amount=amount,
            recipient_account_id=None,
            description="Cash withdrawal",
            status="SUCCESS"
        )

        notification = Notification(
            user_id=user_id,
            title="Withdrawal Successful",
            message=(
                f"₹{amount:,.2f} has been withdrawn "
                "from your account."
            ),
            is_read=False
        )

        db.session.add(transaction)
        db.session.add(notification)
        db.session.commit()

        account_type = (
            account.account_type.value
            if hasattr(account.account_type, "value")
            else str(account.account_type)
        )

        return jsonify({
            "status": "success",
            "message": "Money withdrawn successfully",
            "withdrawal": {
                "transaction_id": transaction.transaction_id,
                "account_number": account.account_number,
                "account_type": account_type,
                "amount": amount,
                "remaining_balance": float(account.balance),
                "status": "SUCCESS"
            },
            "account": {
                "account_number": account.account_number,
                "account_type": account_type,
                "balance": float(account.balance)
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        print("Withdrawal Error:", e)

        return jsonify({
            "status": "error",
            "message": "Withdrawal failed"
        }), 500


# =========================================================
# STEP 1: INITIATE TRANSFER AND SEND EMAIL OTP
# =========================================================

@transaction_bp.route("/transfer", methods=["POST"])
@jwt_required()
def transfer_money():

    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    recipient_number = str(
        data.get("recipient_account", "")
    ).strip().upper()

    pin = str(data.get("pin", ""))

    description = data.get(
        "description",
        "Money transfer"
    )

    if not recipient_number or not data.get("amount") or not pin:
        return jsonify({
            "status": "error",
            "message": "Recipient account, amount and PIN are required"
        }), 400

    try:
        amount = Decimal(
            str(data.get("amount"))
        ).quantize(Decimal("0.01"))

    except (InvalidOperation, ValueError, TypeError):
        return jsonify({
            "status": "error",
            "message": "Invalid transfer amount"
        }), 400

    if not amount.is_finite() or amount <= 0:
        return jsonify({
            "status": "error",
            "message": "Amount must be greater than zero"
        }), 400

    if not pin.isdigit() or len(pin) != 4:
        return jsonify({
            "status": "error",
            "message": "PIN must be exactly 4 digits"
        }), 400

    sender = Account.query.filter_by(
        user_id=user_id
    ).first()

    if not sender:
        return jsonify({
            "status": "error",
            "message": "Sender account not found"
        }), 404

    recipient = Account.query.filter_by(
        account_number=recipient_number
    ).first()

    if not recipient:
        return jsonify({
            "status": "error",
            "message": "Recipient account not found"
        }), 404

    if sender.account_id == recipient.account_id:
        return jsonify({
            "status": "error",
            "message": "Cannot transfer money to your own account"
        }), 400

    if not check_password_hash(sender.pin_hash, pin):
        return jsonify({
            "status": "error",
            "message": "Invalid PIN"
        }), 401

    if Decimal(str(sender.balance)) < amount:
        return jsonify({
            "status": "error",
            "message": "Insufficient balance"
        }), 400

    user = User.query.filter_by(
        user_id=user_id
    ).first()

    if not user or not user.email:
        return jsonify({
            "status": "error",
            "message": "Registered email not found"
        }), 400

    if user.status != "ACTIVE":
        return jsonify({
            "status": "error",
            "message": "Your account is not active"
        }), 403

    # Generate secure six-digit OTP
    otp = f"{secrets.randbelow(1000000):06d}"

    now = datetime.utcnow()

    pending = PendingTransfer(
        sender_user_id=user_id,
        sender_account_id=sender.account_id,
        recipient_account_id=recipient.account_id,
        amount=amount,
        description=description,
        otp_hash=generate_password_hash(otp),
        expires_at=now + timedelta(minutes=5),
        last_otp_sent_at=now,
        attempts=0,
        status="PENDING"
    )

    try:
        db.session.add(pending)
        db.session.commit()

    except Exception as e:
        db.session.rollback()
        print("Pending transfer error:", e)

        return jsonify({
            "status": "error",
            "message": "Unable to initiate transfer"
        }), 500

    # Send OTP to registered email
    try:
        send_email(
            user.email,
            "FINVERSE - Transaction Verification OTP",
            f"""
Hello {user.full_name},

A money transfer has been initiated from your FINVERSE account.

Recipient Account: ****{recipient.account_number[-4:]}

Transfer Amount: Rs. {amount:.2f}

Your transaction verification OTP is:

{otp}

This OTP expires in 5 minutes.

You have a maximum of 5 verification attempts.

Do not share this OTP with anyone.

If you did not initiate this transaction, please contact FINVERSE support.

Regards,
FINVERSE Security Team
"""
        )

    except Exception as e:
        print("Transfer OTP email error:", e)

        return jsonify({
            "status": "error",
            "message": "Unable to send OTP. Please try resending.",
            "pending_transfer_id": pending.pending_transfer_id
        }), 502

    return jsonify({
        "status": "success",
        "message": "Verification OTP sent to your registered email",
        "pending_transfer_id": pending.pending_transfer_id,
        "email": user.email[:2] + "***",
        "expires_in": 300
    }), 200


# =========================================================
# STEP 2: VERIFY OTP AND COMPLETE TRANSFER
# =========================================================

@transaction_bp.route("/transfer/verify-otp", methods=["POST"])
@jwt_required()
def verify_transfer_otp():

    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    pending_id = data.get("pending_transfer_id")
    otp = str(data.get("otp", ""))

    if not pending_id or len(otp) != 6 or not otp.isdigit():
        return jsonify({
            "status": "error",
            "message": "Valid transfer ID and six-digit OTP are required"
        }), 400

    try:
        pending_id = int(pending_id)
    except (ValueError, TypeError):
        return jsonify({
            "status": "error",
            "message": "Invalid transfer ID"
        }), 400

    try:
        pending = PendingTransfer.query.filter_by(
            pending_transfer_id=pending_id,
            sender_user_id=user_id
        ).with_for_update().first()

        if not pending:
            return jsonify({
                "status": "error",
                "message": "Pending transfer not found"
            }), 404

        if pending.status != "PENDING":
            return jsonify({
                "status": "error",
                "message": "This transfer is no longer pending"
            }), 400

        if pending.expires_at <= datetime.utcnow():
            pending.status = "EXPIRED"
            db.session.commit()

            return jsonify({
                "status": "error",
                "message": "OTP expired. Please request a new OTP."
            }), 400

        if pending.attempts >= 5:
            pending.status = "LOCKED"
            db.session.commit()

            return jsonify({
                "status": "error",
                "message": "Maximum OTP attempts exceeded"
            }), 429

        if not check_password_hash(pending.otp_hash, otp):

            pending.attempts += 1

            if pending.attempts >= 5:
                pending.status = "LOCKED"

            db.session.commit()

            return jsonify({
                "status": "error",
                "message": "Incorrect OTP"
            }), 401

        # Lock both accounts in a consistent order
        accounts = Account.query.filter(
            Account.account_id.in_([
                pending.sender_account_id,
                pending.recipient_account_id
            ])
        ).order_by(
            Account.account_id
        ).with_for_update().all()

        account_map = {
            account.account_id: account
            for account in accounts
        }

        sender = account_map.get(
            pending.sender_account_id
        )

        recipient = account_map.get(
            pending.recipient_account_id
        )

        if not sender or not recipient:
            raise ValueError("Transfer account not found")

        amount = Decimal(str(pending.amount))

        # Check account ownership and status again
        sender_user = User.query.filter_by(
            user_id=user_id
        ).first()

        if not sender_user or sender_user.status != "ACTIVE":
            raise ValueError("Sender account is not active")

        # Recheck balance immediately before execution
        if Decimal(str(sender.balance)) < amount:
            pending.status = "FAILED"
            db.session.commit()

            return jsonify({
                "status": "error",
                "message": "Insufficient balance"
            }), 400

        # Execute transfer
        sender.balance = (
            Decimal(str(sender.balance)) - amount
        )

        recipient.balance = (
            Decimal(str(recipient.balance)) + amount
        )

        sender_transaction = Transaction(
            account_id=sender.account_id,
            transaction_type="TRANSFER",
            amount=float(amount),
            recipient_account_id=recipient.account_id,
            description=pending.description,
            status="SUCCESS"
        )

        recipient_transaction = Transaction(
            account_id=recipient.account_id,
            transaction_type="TRANSFER",
            amount=float(amount),
            recipient_account_id=sender.account_id,
            description="Money received",
            status="SUCCESS"
        )

        db.session.add(sender_transaction)
        db.session.add(recipient_transaction)

        db.session.add(Notification(
            user_id=user_id,
            title="Transfer Successful",
            message=(
                f"₹{amount:,.2f} has been transferred "
                f"to account {recipient.account_number}."
            ),
            is_read=False
        ))

        db.session.add(Notification(
            user_id=recipient.user_id,
            title="Money Received",
            message=(
                f"₹{amount:,.2f} has been received "
                "in your account."
            ),
            is_read=False
        ))

        # Mark completed in the same database transaction
        pending.status = "COMPLETED"
        pending.completed_at = datetime.utcnow()

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Money transferred successfully",
            "transfer": {
                "transaction_id": sender_transaction.transaction_id,
                "from_account": sender.account_number,
                "to_account": recipient.account_number,
                "amount": float(amount),
                "remaining_balance": float(sender.balance),
                "status": "SUCCESS"
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        print("Transfer verification error:", e)

        return jsonify({
            "status": "error",
            "message": "Transfer failed. Please try again."
        }), 500


# =========================================================
# STEP 3: RESEND TRANSFER OTP
# =========================================================

@transaction_bp.route("/transfer/resend-otp", methods=["POST"])
@jwt_required()
def resend_transfer_otp():

    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    pending_id = data.get("pending_transfer_id")

    try:
        pending_id = int(pending_id)
    except (ValueError, TypeError):
        return jsonify({
            "status": "error",
            "message": "Valid transfer ID is required"
        }), 400

    try:
        pending = PendingTransfer.query.filter_by(
            pending_transfer_id=pending_id,
            sender_user_id=user_id
        ).with_for_update().first()

        if not pending:
            return jsonify({
                "status": "error",
                "message": "Pending transfer not found"
            }), 404

        if pending.status not in ["PENDING", "EXPIRED"]:
            return jsonify({
                "status": "error",
                "message": "OTP cannot be resent for this transfer"
            }), 400

        if pending.attempts >= 5:
            pending.status = "LOCKED"
            db.session.commit()

            return jsonify({
                "status": "error",
                "message": "Maximum OTP attempts exceeded"
            }), 429

        now = datetime.utcnow()

        if (
            pending.last_otp_sent_at
            and (
                now - pending.last_otp_sent_at
            ).total_seconds() < 60
        ):
            return jsonify({
                "status": "error",
                "message": "Please wait 60 seconds before requesting another OTP"
            }), 429

        user = User.query.filter_by(
            user_id=user_id
        ).first()

        if not user or not user.email or user.status != "ACTIVE":
            return jsonify({
                "status": "error",
                "message": "Active registered email not found"
            }), 400

        otp = f"{secrets.randbelow(1000000):06d}"

        pending.otp_hash = generate_password_hash(otp)
        pending.expires_at = now + timedelta(minutes=5)
        pending.last_otp_sent_at = now
        pending.attempts = 0
        pending.status = "PENDING"

        db.session.commit()

        # Send new OTP
        send_email(
            user.email,
            "FINVERSE - New Transaction Verification OTP",
            f"""
Hello {user.full_name},

Your new FINVERSE transaction verification OTP is:

{otp}

This OTP expires in 5 minutes.

Do not share this OTP with anyone.

Regards,
FINVERSE Security Team
"""
        )

        return jsonify({
            "status": "success",
            "message": "A new OTP has been sent to your registered email",
            "expires_in": 300
        }), 200

    except Exception as e:
        db.session.rollback()
        print("Resend OTP error:", e)

        return jsonify({
            "status": "error",
            "message": "Unable to resend OTP. Please try again later."
        }), 500


# =========================================================
# TRANSACTION HISTORY
# =========================================================

@transaction_bp.route("/history", methods=["GET"])
@jwt_required()
def transaction_history():

    user_id = int(get_jwt_identity())

    account = Account.query.filter_by(
        user_id=user_id
    ).first()

    if not account:
        return jsonify({
            "status": "error",
            "message": "Bank account not found"
        }), 404

    transactions = (
        Transaction.query
        .filter_by(account_id=account.account_id)
        .order_by(Transaction.transaction_date.desc())
        .all()
    )

    return jsonify({
        "status": "success",
        "message": "Transaction history retrieved successfully",
        "account_number": account.account_number,
        "current_balance": float(account.balance),
        "transactions": [
            transaction.to_dict()
            for transaction in transactions
        ]
    }), 200


# =========================================================
# VIRTUAL CARD PAYMENT
# =========================================================

@transaction_bp.route("/card-payment", methods=["POST"])
@jwt_required()
def card_payment():

    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()

        if not data:
            return jsonify({
                "status": "error",
                "message": "Request data is required"
            }), 400

        recipient = data.get("recipient_account_number")
        amount = data.get("amount")
        description = data.get(
            "description",
            "Virtual card payment"
        )
        pin = data.get("pin")

        if not recipient or not str(recipient).strip():
            return jsonify({
                "status": "error",
                "message": "Recipient account number is required"
            }), 400

        if amount is None or not pin:
            return jsonify({
                "status": "error",
                "message": "Amount and PIN are required"
            }), 400

        try:
            amount = float(amount)
        except (ValueError, TypeError):
            return jsonify({
                "status": "error",
                "message": "Invalid amount"
            }), 400

        if amount <= 0:
            return jsonify({
                "status": "error",
                "message": "Amount must be greater than zero"
            }), 400

        if not str(pin).isdigit() or len(str(pin)) != 4:
            return jsonify({
                "status": "error",
                "message": "PIN must be exactly 4 digits"
            }), 400

        card = VirtualCard.query.filter_by(
            user_id=user_id
        ).first()

        if not card:
            return jsonify({
                "status": "error",
                "message": "Virtual card not found"
            }), 404

        if card.status == "FROZEN":
            return jsonify({
                "status": "error",
                "message": "Card is frozen. Payment cannot be processed"
            }), 400

        if not card.online_payments:
            return jsonify({
                "status": "error",
                "message": "Online payments are disabled"
            }), 400

        if amount > float(card.spending_limit):
            return jsonify({
                "status": "error",
                "message": "Payment exceeds the card spending limit"
            }), 400

        account = Account.query.filter_by(
            user_id=user_id
        ).first()

        if not account:
            return jsonify({
                "status": "error",
                "message": "Bank account not found"
            }), 404

        recipient_account = Account.query.filter_by(
            account_number=str(recipient).strip()
        ).first()

        if not recipient_account:
            return jsonify({
                "status": "error",
                "message": "Recipient account not found"
            }), 404

        if not check_password_hash(account.pin_hash, str(pin)):
            return jsonify({
                "status": "error",
                "message": "Invalid PIN"
            }), 401

        current_balance = float(account.balance)

        if current_balance < amount:
            return jsonify({
                "status": "error",
                "message": "Insufficient account balance"
            }), 400

        account.balance = current_balance - amount

        payment_description = (
            f"Recipient: {str(recipient).strip()} | "
            f"Purpose: {str(description).strip()}"
        )

        transaction = Transaction(
            account_id=account.account_id,
            transaction_type="CARD_PAYMENT",
            amount=amount,
            recipient_account_id=None,
            description=payment_description,
            status="SUCCESS"
        )

        notification = Notification(
            user_id=user_id,
            title="Card Payment Successful",
            message=(
                f"₹{amount:,.2f} payment made to "
                f"{str(recipient).strip()}."
            ),
            is_read=False
        )

        db.session.add(transaction)
        db.session.add(notification)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Virtual card payment successful",
            "payment": {
                "transaction_id": transaction.transaction_id,
                "account_number": account.account_number,
                "recipient": str(recipient).strip(),
                "amount": amount,
                "description": str(description).strip(),
                "remaining_balance": float(account.balance),
                "status": "SUCCESS"
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        print("Card Payment Error:", e)

        return jsonify({
            "status": "error",
            "message": "Card payment failed"
        }), 500
