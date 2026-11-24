from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash

from models.account import Account
from models.transaction import Transaction
from models.virtual_card import VirtualCard
from models.notification import Notification
from database import db


transaction_bp = Blueprint("transaction", __name__)


# =========================================================
# DEPOSIT MONEY
# =========================================================

@transaction_bp.route("/deposit", methods=["POST"])
@jwt_required()
def deposit_money():

    user_id = int(get_jwt_identity())

    data = request.get_json()

    # -----------------------------------------------------
    # Check request data
    # -----------------------------------------------------

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request data is required"
        }), 400

    # -----------------------------------------------------
    # Get deposit information
    # -----------------------------------------------------

    amount = data.get("amount")
    pin = data.get("pin")
    description = data.get(
        "description",
        "Cash deposit"
    )

    # -----------------------------------------------------
    # Validate fields
    # -----------------------------------------------------

    if amount is None or not pin:
        return jsonify({
            "status": "error",
            "message": "Amount and PIN are required"
        }), 400

    # -----------------------------------------------------
    # Validate amount
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # Validate PIN
    # -----------------------------------------------------

    if not str(pin).isdigit() or len(str(pin)) != 4:

        return jsonify({
            "status": "error",
            "message": "PIN must be exactly 4 digits"
        }), 400

    # -----------------------------------------------------
    # Find user's account
    # -----------------------------------------------------

    account = Account.query.filter_by(
        user_id=user_id
    ).first()

    if not account:

        return jsonify({
            "status": "error",
            "message": "Bank account not found"
        }), 404

    # -----------------------------------------------------
    # Verify PIN
    # -----------------------------------------------------

    if not check_password_hash(
        account.pin_hash,
        str(pin)
    ):

        return jsonify({
            "status": "error",
            "message": "Invalid PIN"
        }), 401

    # -----------------------------------------------------
    # Add money to account balance
    # -----------------------------------------------------

    account.balance = float(account.balance) + amount

    # -----------------------------------------------------
    # Create deposit transaction
    # -----------------------------------------------------

    transaction = Transaction(
        account_id=account.account_id,
        transaction_type="DEPOSIT",
        amount=amount,
        recipient_account_id=None,
        description=description,
        status="SUCCESS"
    )

    # -----------------------------------------------------
    # Save transaction + dynamic notification
    # -----------------------------------------------------

    try:

        db.session.add(transaction)

        notification = Notification(
            user_id=user_id,
            title="Deposit Successful",
            message=(
                f"₹{amount:,.2f} has been deposited "
                f"into your account."
            ),
            is_read=False
        )

        db.session.add(notification)

        db.session.commit()

    except Exception as e:

        db.session.rollback()

        import traceback

        print("========== WITHDRAWAL ERROR ==========")
        traceback.print_exc()
        print("======================================")

        return jsonify({
            "status": "error",
            "message": "Withdrawal failed",
            "error": str(e)
        }), 500

    # -----------------------------------------------------
    # Successful response
    # -----------------------------------------------------

    return jsonify({

        "status": "success",

        "message": "Money deposited successfully",

        "deposit": {

            "transaction_id":
                transaction.transaction_id,

            "account_number":
                account.account_number,

            "amount":
                amount,

            "description":
                description,

            "new_balance":
                float(account.balance)
        }

    }), 200


# =========================================================
# WITHDRAW MONEY
# =========================================================

@transaction_bp.route("/withdraw", methods=["POST"])
@jwt_required()
def withdraw_money():

    user_id = int(get_jwt_identity())

    data = request.get_json()

    # -----------------------------------------------------
    # Check request data
    # -----------------------------------------------------

    if not data:

        return jsonify({
            "status": "error",
            "message": "Request data is required"
        }), 400

    # -----------------------------------------------------
    # Get withdrawal information
    # -----------------------------------------------------

    amount = data.get("amount")
    pin = data.get("pin")

    # -----------------------------------------------------
    # Validate fields
    # -----------------------------------------------------

    if amount is None or not pin:

        return jsonify({
            "status": "error",
            "message": "Amount and PIN are required"
        }), 400

    # -----------------------------------------------------
    # Validate amount
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # Validate PIN
    # -----------------------------------------------------

    if not str(pin).isdigit() or len(str(pin)) != 4:

        return jsonify({
            "status": "error",
            "message": "PIN must be exactly 4 digits"
        }), 400

    # -----------------------------------------------------
    # Find user's account
    # -----------------------------------------------------

    account = Account.query.filter_by(
        user_id=user_id
    ).first()

    if not account:

        return jsonify({
            "status": "error",
            "message": "Bank account not found"
        }), 404

    # -----------------------------------------------------
    # Verify PIN
    # -----------------------------------------------------

    if not check_password_hash(
        account.pin_hash,
        str(pin)
    ):

        return jsonify({
            "status": "error",
            "message": "Invalid PIN"
        }), 401

    # -----------------------------------------------------
    # Check balance
    # -----------------------------------------------------

    current_balance = float(account.balance)

    if current_balance < amount:

        return jsonify({
            "status": "error",
            "message": "Insufficient balance"
        }), 400

    # -----------------------------------------------------
    # Deduct money
    # -----------------------------------------------------

    account.balance = current_balance - amount

    # -----------------------------------------------------
    # Create withdrawal transaction
    # -----------------------------------------------------

    transaction = Transaction(
        account_id=account.account_id,
        transaction_type="WITHDRAW",
        amount=amount,
        recipient_account_id=None,
        description="Cash withdrawal",
        status="SUCCESS"
    )

    # -----------------------------------------------------
    # Save transaction + dynamic notification
    # -----------------------------------------------------

    try:

        db.session.add(transaction)

        notification = Notification(
            user_id=user_id,
            title="Withdrawal Successful",
            message=(
                f"₹{amount:,.2f} has been withdrawn "
                f"from your account."
            ),
            is_read=False
        )

        db.session.add(notification)

        db.session.commit()

    except Exception as e:

        db.session.rollback()

        print("Withdraw Error:", e)

        return jsonify({
            "status": "error",
            "message": "Withdrawal failed",
            "error": str(e)
        }), 500

    # -----------------------------------------------------
    # Successful response
    # -----------------------------------------------------

    return jsonify({

        "status": "success",

        "message": "Money withdrawn successfully",

        "withdrawal": {

            "transaction_id":
                transaction.transaction_id,

            "account_number":
                account.account_number,

            "account_type":
                account.account_type.value
                if hasattr(account.account_type, "value")
                else str(account.account_type),

            "amount":
                amount,

            "remaining_balance":
                float(account.balance),

            "status":
                "SUCCESS"
        },

        "account": {

            "account_number":
                account.account_number,

            "account_type":
                account.account_type.value
                if hasattr(account.account_type, "value")
                else str(account.account_type),

            "balance":
                float(account.balance)
        }

    }), 200


# =========================================================
# TRANSFER MONEY
# =========================================================

@transaction_bp.route("/transfer", methods=["POST"])
@jwt_required()
def transfer_money():

    user_id = int(get_jwt_identity())

    data = request.get_json()

    # -----------------------------------------------------
    # Check request data
    # -----------------------------------------------------

    if not data:

        return jsonify({
            "status": "error",
            "message": "Request data is required"
        }), 400

    # -----------------------------------------------------
    # Get transfer information
    # -----------------------------------------------------

    recipient_account_number = data.get(
        "recipient_account"
    )

    amount = data.get("amount")

    pin = data.get("pin")

    description = data.get(
        "description",
        "Money transfer"
    )

    # -----------------------------------------------------
    # Validate fields
    # -----------------------------------------------------

    if (
        not recipient_account_number
        or amount is None
        or not pin
    ):

        return jsonify({
            "status": "error",
            "message":
                "Recipient account, amount and PIN are required"
        }), 400

    # -----------------------------------------------------
    # Validate amount
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # Validate PIN
    # -----------------------------------------------------

    if not str(pin).isdigit() or len(str(pin)) != 4:

        return jsonify({
            "status": "error",
            "message": "PIN must be exactly 4 digits"
        }), 400

    # -----------------------------------------------------
    # Find sender account
    # -----------------------------------------------------

    sender = Account.query.filter_by(
        user_id=user_id
    ).first()

    if not sender:

        return jsonify({
            "status": "error",
            "message": "Sender account not found"
        }), 404

    # -----------------------------------------------------
    # Find recipient account
    # -----------------------------------------------------

    recipient = Account.query.filter_by(
        account_number=recipient_account_number
    ).first()

    if not recipient:

        return jsonify({
            "status": "error",
            "message": "Recipient account not found"
        }), 404

    # -----------------------------------------------------
    # Prevent self transfer
    # -----------------------------------------------------

    if sender.account_id == recipient.account_id:

        return jsonify({
            "status": "error",
            "message":
                "Cannot transfer money to your own account"
        }), 400

    # -----------------------------------------------------
    # Verify sender PIN
    # -----------------------------------------------------

    if not check_password_hash(
        sender.pin_hash,
        str(pin)
    ):

        return jsonify({
            "status": "error",
            "message": "Invalid PIN"
        }), 401

    # -----------------------------------------------------
    # Check sender balance
    # -----------------------------------------------------

    if float(sender.balance) < amount:

        return jsonify({
            "status": "error",
            "message": "Insufficient balance"
        }), 400

    # -----------------------------------------------------
    # Update balances
    # -----------------------------------------------------

    sender.balance = (
        float(sender.balance) - amount
    )

    recipient.balance = (
        float(recipient.balance) + amount
    )

    # -----------------------------------------------------
    # Create sender transaction
    # -----------------------------------------------------

    sender_transaction = Transaction(

        account_id=sender.account_id,

        transaction_type="TRANSFER",

        amount=amount,

        recipient_account_id=
            recipient.account_id,

        description=description,

        status="SUCCESS"
    )

    # -----------------------------------------------------
    # Create recipient transaction
    # -----------------------------------------------------

    recipient_transaction = Transaction(

        account_id=recipient.account_id,

        transaction_type="TRANSFER",

        amount=amount,

        recipient_account_id=
            sender.account_id,

        description="Money received",

        status="SUCCESS"
    )

    # -----------------------------------------------------
    # Save transfer + dynamic notifications
    # -----------------------------------------------------

    try:

        db.session.add(sender_transaction)

        db.session.add(recipient_transaction)

        # -------------------------------------------------
        # Sender notification
        # -------------------------------------------------

        sender_notification = Notification(

            user_id=user_id,

            title="Transfer Successful",

            message=(
                f"₹{amount:,.2f} has been transferred "
                f"to account {recipient.account_number}."
            ),

            is_read=False
        )

        # -------------------------------------------------
        # Recipient notification
        # -------------------------------------------------

        recipient_notification = Notification(

            user_id=recipient.user_id,

            title="Money Received",

            message=(
                f"₹{amount:,.2f} has been received "
                f"in your account."
            ),

            is_read=False
        )

        db.session.add(sender_notification)

        db.session.add(recipient_notification)

        db.session.commit()

    except Exception as e:

        db.session.rollback()

        print("Transfer Error:", e)

        return jsonify({

            "status": "error",

            "message": "Transfer failed",

            "error": str(e)

        }), 500

    # -----------------------------------------------------
    # Successful response
    # -----------------------------------------------------

    return jsonify({

        "status": "success",

        "message":
            "Money transferred successfully",

        "transfer": {

            "from_account":
                sender.account_number,

            "to_account":
                recipient.account_number,

            "amount":
                amount,

            "description":
                description,

            "remaining_balance":
                float(sender.balance)
        }

    }), 200


# =========================================================
# TRANSACTION HISTORY
# =========================================================

@transaction_bp.route("/history", methods=["GET"])
@jwt_required()
def transaction_history():

    user_id = int(get_jwt_identity())

    # -----------------------------------------------------
    # Find logged-in user's account
    # -----------------------------------------------------

    account = Account.query.filter_by(
        user_id=user_id
    ).first()

    if not account:

        return jsonify({
            "status": "error",
            "message": "Bank account not found"
        }), 404

    # -----------------------------------------------------
    # Get transactions
    # -----------------------------------------------------

    transactions = (

        Transaction.query

        .filter_by(
            account_id=account.account_id
        )

        .order_by(
            Transaction.transaction_date.desc()
        )

        .all()
    )

    # -----------------------------------------------------
    # Return history
    # -----------------------------------------------------

    return jsonify({

        "status": "success",

        "message":
            "Transaction history retrieved successfully",

        "account_number":
            account.account_number,

        "current_balance":
            float(account.balance),

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

        # -------------------------------------------------
        # Check request data
        # -------------------------------------------------

        if not data:

            return jsonify({
                "status": "error",
                "message": "Request data is required"
            }), 400

        # -------------------------------------------------
        # Get payment information
        # -------------------------------------------------

        recipient = data.get("recipient_account_number")

        amount = data.get("amount")

        description = data.get(
            "description",
            "Virtual card payment"
        )

        pin = data.get("pin")

        # -------------------------------------------------
        # Validate required fields
        # -------------------------------------------------

        if not recipient or not recipient.strip():

            return jsonify({
                "status": "error",
                "message": "Recipient account number is required"
            }), 400

        if amount is None or not pin:

            return jsonify({
                "status": "error",
                "message": "Amount and PIN are required"
            }), 400

        # -------------------------------------------------
        # Validate amount
        # -------------------------------------------------

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

        # -------------------------------------------------
        # Validate PIN format
        # -------------------------------------------------

        if not str(pin).isdigit() or len(str(pin)) != 4:

            return jsonify({
                "status": "error",
                "message": "PIN must be exactly 4 digits"
            }), 400

        # -------------------------------------------------
        # Find virtual card
        # -------------------------------------------------

        card = VirtualCard.query.filter_by(
            user_id=user_id
        ).first()

        if not card:

            return jsonify({
                "status": "error",
                "message": "Virtual card not found"
            }), 404

        # -------------------------------------------------
        # Check card status
        # -------------------------------------------------

        if card.status == "FROZEN":

            return jsonify({
                "status": "error",
                "message":
                    "Card is frozen. Payment cannot be processed"
            }), 400

        # -------------------------------------------------
        # Check online payments
        # -------------------------------------------------

        if not card.online_payments:

            return jsonify({
                "status": "error",
                "message": "Online payments are disabled"
            }), 400

        # -------------------------------------------------
        # Check spending limit
        # -------------------------------------------------

        if amount > float(card.spending_limit):

            return jsonify({
                "status": "error",
                "message":
                    "Payment exceeds the card spending limit"
            }), 400

        # -------------------------------------------------
        # Find user's bank account
        # -------------------------------------------------

        account = Account.query.filter_by(
            user_id=user_id
        ).first()

        if not account:

            return jsonify({
                "status": "error",
                "message": "Bank account not found"
            }), 404
        # -------------------------------------------------
        # Verify recipient account
        # -------------------------------------------------

        recipient_account = Account.query.filter_by(
            account_number=recipient.strip()
        ).first()

        if not recipient_account:

            return jsonify({
                "status": "error",
                "message": "Recipient account not found"
            }), 404

        # -------------------------------------------------
        # Verify Account PIN
        # -------------------------------------------------

        if not check_password_hash(
            account.pin_hash,
            str(pin)
        ):

            return jsonify({
                "status": "error",
                "message": "Invalid PIN"
            }), 401

        # -------------------------------------------------
        # Check account balance
        # -------------------------------------------------

        current_balance = float(account.balance)

        if current_balance < amount:

            return jsonify({
                "status": "error",
                "message": "Insufficient account balance"
            }), 400

        # -------------------------------------------------
        # Deduct payment amount
        # -------------------------------------------------

        account.balance = current_balance - amount

        # -------------------------------------------------
        # Create payment description
        # -------------------------------------------------

        payment_description = (
            f"Recipient: {recipient.strip()} | "
            f"Purpose: {description.strip()}"
        )

        # -------------------------------------------------
        # Create card payment transaction
        # -------------------------------------------------

        transaction = Transaction(

            account_id=account.account_id,

            transaction_type="CARD_PAYMENT",

            amount=amount,

            recipient_account_id=None,

            description=payment_description,

            status="SUCCESS"
        )

        # -------------------------------------------------
        # Save transaction + dynamic notification
        # -------------------------------------------------

        db.session.add(transaction)

        notification = Notification(

            user_id=user_id,

            title="Card Payment Successful",

            message=(
                f"₹{amount:,.2f} payment made to "
                f"{recipient.strip()}."
            ),

            is_read=False
        )

        db.session.add(notification)

        db.session.commit()

        # -------------------------------------------------
        # Successful response
        # -------------------------------------------------

        return jsonify({

            "status": "success",

            "message":
                "Virtual card payment successful",

            "payment": {

                "transaction_id":
                    transaction.transaction_id,

                "account_number":
                    account.account_number,

                "recipient":
                    recipient.strip(),

                "amount":
                    amount,

                "description":
                    description.strip(),

                "remaining_balance":
                    float(account.balance),

                "status":
                    "SUCCESS"
            }

        }), 200

    except Exception as e:

        db.session.rollback()

        print(
            "Card Payment Error:",
            str(e)
        )

        return jsonify({

            "status": "error",

            "message":
                "Card payment failed",

            "error":
                str(e)

        }), 500