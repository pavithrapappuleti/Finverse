from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash
from decimal import Decimal, InvalidOperation
from datetime import datetime, date

from database import db
from models.savings_goal import SavingsGoal
from models.savings_goal_contribution import SavingsGoalContribution
from models.account import Account
from models.transaction import Transaction


savings_goal_bp = Blueprint(
    "savings_goal",
    __name__
)


# ---------------------------------------------------------
# CREATE SAVINGS GOAL
# ---------------------------------------------------------
@savings_goal_bp.route("", methods=["POST"])
@jwt_required()
def create_savings_goal():

    user_id = get_jwt_identity()

    data = request.get_json()

    goal_name = data.get("goal_name")
    target_amount = data.get("target_amount")
    target_date = data.get("target_date")

    # -----------------------------
    # Validate goal name
    # -----------------------------
    if not goal_name:
        return jsonify({
            "error": "Goal name is required"
        }), 400

    goal_name = goal_name.strip()

    if not goal_name:
        return jsonify({
            "error": "Goal name cannot be empty"
        }), 400

    # -----------------------------
    # Validate target amount
    # -----------------------------
    try:
        target_amount = Decimal(str(target_amount))
    except (InvalidOperation, TypeError, ValueError):
        return jsonify({
            "error": "Invalid target amount"
        }), 400

    if target_amount <= 0:
        return jsonify({
            "error": "Target amount must be greater than 0"
        }), 400

    target_amount = target_amount.quantize(
        Decimal("0.01")
    )

    # -----------------------------
    # Validate target date
    # -----------------------------
    parsed_date = None

    if target_date:

        try:
            parsed_date = datetime.strptime(
                target_date,
                "%Y-%m-%d"
            ).date()

        except ValueError:
            return jsonify({
                "error": "Invalid target date"
            }), 400

        if parsed_date < date.today():
            return jsonify({
                "error": "Target date cannot be in the past"
            }), 400

    # -----------------------------
    # Create goal
    # -----------------------------
    goal = SavingsGoal(
        user_id=user_id,
        goal_name=goal_name,
        target_amount=target_amount,
        saved_amount=Decimal("0.00"),
        target_date=parsed_date,
        status="ACTIVE"
    )

    db.session.add(goal)
    db.session.commit()

    return jsonify({
        "message": "Savings goal created successfully",
        "goal": goal.to_dict()
    }), 201


# ---------------------------------------------------------
# GET ALL SAVINGS GOALS
# ---------------------------------------------------------
@savings_goal_bp.route("", methods=["GET"])
@jwt_required()
def get_savings_goals():

    user_id = get_jwt_identity()

    goals = SavingsGoal.query.filter_by(
        user_id=user_id
    ).order_by(
        SavingsGoal.created_at.desc()
    ).all()

    result = []

    for goal in goals:

        goal_data = goal.to_dict()

        contributions = SavingsGoalContribution.query.filter_by(
            goal_id=goal.goal_id
        ).order_by(
            SavingsGoalContribution.created_at.asc()
        ).all()

        goal_data["contributions"] = [
            contribution.to_dict()
            for contribution in contributions
        ]

        result.append(goal_data)

    return jsonify({
        "goals": result
    }), 200


# ---------------------------------------------------------
# GET SINGLE SAVINGS GOAL
# ---------------------------------------------------------
@savings_goal_bp.route("/<int:goal_id>", methods=["GET"])
@jwt_required()
def get_savings_goal(goal_id):

    user_id = get_jwt_identity()

    goal = SavingsGoal.query.filter_by(
        goal_id=goal_id,
        user_id=user_id
    ).first()

    if not goal:
        return jsonify({
            "error": "Savings goal not found"
        }), 404

    contributions = SavingsGoalContribution.query.filter_by(
        goal_id=goal.goal_id
    ).order_by(
        SavingsGoalContribution.created_at.asc()
    ).all()

    goal_data = goal.to_dict()

    goal_data["contributions"] = [
        contribution.to_dict()
        for contribution in contributions
    ]

    return jsonify({
        "goal": goal_data
    }), 200


# ---------------------------------------------------------
# ADD MONEY TO SAVINGS GOAL
# ---------------------------------------------------------
@savings_goal_bp.route("/<int:goal_id>/add-money", methods=["POST"])
@jwt_required()
def add_money_to_goal(goal_id):

    user_id = get_jwt_identity()

    data = request.get_json()

    amount = data.get("amount")
    pin = data.get("pin")

    # -----------------------------
    # Validate amount
    # -----------------------------
    try:
        amount = Decimal(str(amount))
    except (InvalidOperation, TypeError, ValueError):
        return jsonify({
            "error": "Invalid amount"
        }), 400

    if amount <= 0:
        return jsonify({
            "error": "Amount must be greater than 0"
        }), 400

    amount = amount.quantize(
        Decimal("0.01")
    )

    # -----------------------------
    # Validate PIN
    # -----------------------------
    if not pin:
        return jsonify({
            "error": "PIN is required"
        }), 400

    pin = str(pin)

    if len(pin) != 4 or not pin.isdigit():
        return jsonify({
            "error": "PIN must be 4 digits"
        }), 400

    # -----------------------------
    # Find account
    # -----------------------------
    account = Account.query.filter_by(
        user_id=user_id
    ).first()

    if not account:
        return jsonify({
            "error": "Account not found"
        }), 404

    # -----------------------------
    # Check PIN
    # -----------------------------
    if not check_password_hash(
        account.pin_hash,
        pin
    ):
        return jsonify({
            "error": "Incorrect PIN"
        }), 401

    # -----------------------------
    # Find goal
    # -----------------------------
    goal = SavingsGoal.query.filter_by(
        goal_id=goal_id,
        user_id=user_id
    ).first()

    if not goal:
        return jsonify({
            "error": "Savings goal not found"
        }), 404

    # -----------------------------
    # Check goal status
    # -----------------------------
    if goal.status == "COMPLETED":
        return jsonify({
            "error": "This savings goal is already completed"
        }), 400

    # -----------------------------
    # Calculate remaining amount
    # -----------------------------
    remaining = (
        Decimal(str(goal.target_amount))
        - Decimal(str(goal.saved_amount))
    )

    if amount > remaining:
        return jsonify({
            "error": "Amount is greater than the remaining goal amount",
            "remaining_amount": float(remaining)
        }), 400

    # -----------------------------
    # Check account balance
    # -----------------------------
    balance = Decimal(str(account.balance))

    if amount > balance:
        return jsonify({
            "error": "Insufficient account balance"
        }), 400

    # -----------------------------
    # Update goal
    # -----------------------------
    new_saved_amount = (
        Decimal(str(goal.saved_amount))
        + amount
    )

    goal.saved_amount = new_saved_amount

    if new_saved_amount >= Decimal(str(goal.target_amount)):
        goal.saved_amount = goal.target_amount
        goal.status = "COMPLETED"

    # -----------------------------
    # Deduct money from account
    # -----------------------------
    account.balance = balance - amount

    # -----------------------------
    # Save contribution
    # -----------------------------
    contribution = SavingsGoalContribution(
        goal_id=goal.goal_id,
        amount=amount,
        saved_after=goal.saved_amount
    )

    db.session.add(contribution)

    # -----------------------------
    # Create transaction history
    # -----------------------------
    transaction = Transaction(
        account_id=account.account_id,
        transaction_type="TRANSFER",
        amount=amount,
        recipient_account_id=None,
        description=f"Savings Goal - {goal.goal_name}",
        status="SUCCESS"
    )

    db.session.add(transaction)

    # -----------------------------
    # Commit everything
    # -----------------------------
    db.session.commit()

    return jsonify({
        "message": "Amount added to savings goal successfully",
        "goal": goal.to_dict(),
        "contribution": contribution.to_dict(),
        "remaining_amount": float(
            Decimal(str(goal.target_amount))
            - Decimal(str(goal.saved_amount))
        ),
        "account_balance": float(account.balance)
    }), 200


# ---------------------------------------------------------
# CANCEL / DELETE SAVINGS GOAL
# ---------------------------------------------------------
@savings_goal_bp.route("/<int:goal_id>", methods=["DELETE"])
@jwt_required()
def delete_savings_goal(goal_id):

    user_id = get_jwt_identity()

    goal = SavingsGoal.query.filter_by(
        goal_id=goal_id,
        user_id=user_id
    ).first()

    if not goal:
        return jsonify({
            "error": "Savings goal not found"
        }), 404

    # Do not delete a goal that already contains money.
    if Decimal(str(goal.saved_amount)) > Decimal("0.00"):
        return jsonify({
            "error": "Cannot delete a goal that contains saved money"
        }), 400

    db.session.delete(goal)
    db.session.commit()

    return jsonify({
        "message": "Savings goal deleted successfully"
    }), 200