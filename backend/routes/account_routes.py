from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash

from database import db
from models.user import User
from models.account import Account
from models.transaction import Transaction


account_bp = Blueprint("account", __name__)


@account_bp.route("/balance", methods=["POST"])
@jwt_required()
def check_balance():

    # Get logged-in user's ID from JWT
    user_id = int(get_jwt_identity())

    # Get PIN from request
    data = request.get_json()

    if not data or "pin" not in data:
        return jsonify({
            "status": "error",
            "message": "PIN is required"
        }), 400

    pin = data["pin"]

    # Find user's account
    account = Account.query.filter_by(user_id=user_id).first()

    if not account:
        return jsonify({
            "status": "error",
            "message": "Bank account not found"
        }), 404

    # Verify PIN
    if not check_password_hash(account.pin_hash, pin):
        return jsonify({
            "status": "error",
            "message": "Invalid PIN"
        }), 401

    return jsonify({
        "status": "success",
        "message": "Balance retrieved successfully",
        "account": {
            "account_number": account.account_number,
            "account_type": account.account_type,
            "balance": float(account.balance)
        }
    }), 200

@account_bp.route("/deposit", methods=["POST"])
@jwt_required()
def deposit_money():

    # Get logged-in user's ID from JWT
    user_id = int(get_jwt_identity())

    # Get request data
    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request data is required"
        }), 400

    # Check amount
    if "amount" not in data:
        return jsonify({
            "status": "error",
            "message": "Deposit amount is required"
        }), 400

    amount = data["amount"]

    # Validate amount
    try:
        amount = float(amount)
    except (ValueError, TypeError):
        return jsonify({
            "status": "error",
            "message": "Invalid deposit amount"
        }), 400

    if amount <= 0:
        return jsonify({
            "status": "error",
            "message": "Deposit amount must be greater than zero"
        }), 400

    # Find user's account
    account = Account.query.filter_by(user_id=user_id).first()

    if not account:
        return jsonify({
            "status": "error",
            "message": "Bank account not found"
        }), 404

    # Update account balance
    account.balance = float(account.balance) + amount

    # Create transaction record
    transaction = Transaction(
        account_id=account.account_id,
        transaction_type="DEPOSIT",
        amount=amount,
        description=data.get(
            "description",
            "Cash deposit"
        ),
        status="SUCCESS"
    )

    # Save changes
    try:
        db.session.add(transaction)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print("Withdrawl Error:",e)

        return jsonify({
            "status": "error",
            "message": "Transaction failed"
        }), 500

    return jsonify({
        "status": "success",
        "message": "Deposit successful",
        "transaction": transaction.to_dict(),
        "account": {
            "account_number": account.account_number,
            "account_type": account.account_type,
            "balance": float(account.balance)
        }
    }), 200

@account_bp.route("/withdraw", methods=["POST"])
@jwt_required()
def withdraw_money():

    # Get logged-in user's ID from JWT
    user_id = int(get_jwt_identity())

    # Get request data
    data = request.get_json()

    if not data:
        return jsonify({
            "status": "error",
            "message": "Request data is required"
        }), 400

    # Check amount
    if "amount" not in data:
        return jsonify({
            "status": "error",
            "message": "Withdrawal amount is required"
        }), 400

    # Check PIN
    if "pin" not in data:
        return jsonify({
            "status": "error",
            "message": "PIN is required"
        }), 400

    # Validate amount
    try:
        amount = float(data["amount"])
    except (ValueError, TypeError):
        return jsonify({
            "status": "error",
            "message": "Invalid withdrawal amount"
        }), 400

    if amount <= 0:
        return jsonify({
            "status": "error",
            "message": "Withdrawal amount must be greater than zero"
        }), 400

    pin = str(data["pin"])

    # Find user's account
    account = Account.query.filter_by(user_id=user_id).first()

    if not account:
        return jsonify({
            "status": "error",
            "message": "Bank account not found"
        }), 404

    # Verify PIN
    if not check_password_hash(account.pin_hash, pin):
        return jsonify({
            "status": "error",
            "message": "Invalid PIN"
        }), 401

    # Check sufficient balance
    current_balance = float(account.balance)

    if amount > current_balance:
        return jsonify({
            "status": "error",
            "message": "Insufficient balance"
        }), 400

    # Update balance
    account.balance = current_balance - amount

    # Create transaction record
    transaction = Transaction(
        account_id=account.account_id,
        transaction_type="WITHDRAW",
        amount=amount,
        description=data.get(
            "description",
            "Cash withdrawal"
        ),
        status="SUCCESS"
    )

    # Save changes
    try:
        db.session.add(transaction)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print("Deposit Error:",e)

        return jsonify({
            "status": "error",
            "message": "Transaction failed"
        }), 500

    return jsonify({
        "status": "success",
        "message": "Withdrawal successful",
        "transaction": transaction.to_dict(),
        "account": {
            "account_number": account.account_number,
            "account_type": account.account_type,
            "balance": float(account.balance)
        }
    }), 200