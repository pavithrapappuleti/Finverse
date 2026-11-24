from flask import Blueprint, jsonify,request
from flask_jwt_extended import jwt_required, get_jwt_identity

from models.virtual_card import VirtualCard
from database import db

virtual_card_bp = Blueprint("virtual_card", __name__)


# =========================================================
# GET VIRTUAL CARD
# =========================================================

@virtual_card_bp.route("", methods=["GET"])
@jwt_required()
def get_virtual_card():

    try:

        # Get logged-in user's ID
        user_id = int(get_jwt_identity())

        # Find virtual card belonging to this user
        card = VirtualCard.query.filter_by(
            user_id=user_id
        ).first()

        # Card not found
        if not card:
            return jsonify({
                "status": "error",
                "message": "Virtual card not found"
            }), 404

        # Return card details
        return jsonify({
            "status": "success",
            "card": card.to_dict()
        }), 200

    except Exception as e:

        print("Virtual Card Error:", e)

        return jsonify({
            "status": "error",
            "message": "Failed to fetch virtual card"
        }), 500


# =========================================================
# FREEZE / UNFREEZE VIRTUAL CARD
# =========================================================

@virtual_card_bp.route("/status", methods=["PUT"])
@jwt_required()
def update_card_status():

    try:

        # Get logged-in user's ID
        user_id = int(get_jwt_identity())

        # Get request data
        data = request.get_json()

        if not data:
            return jsonify({
                "status": "error",
                "message": "Request data is required"
            }), 400

        # Get requested status
        new_status = data.get("status")

        # Validate status
        if new_status not in ["ACTIVE", "FROZEN"]:
            return jsonify({
                "status": "error",
                "message": "Invalid card status"
            }), 400

        # Find user's virtual card
        card = VirtualCard.query.filter_by(
            user_id=user_id
        ).first()

        if not card:
            return jsonify({
                "status": "error",
                "message": "Virtual card not found"
            }), 404

        # Update card status
        card.status = new_status

        # Save changes
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": (
                "Card frozen successfully"
                if new_status == "FROZEN"
                else "Card unfrozen successfully"
            ),
            "card": card.to_dict()
        }), 200

    except Exception as e:

        db.session.rollback()

        print("Card Status Error:", str(e))

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# ENABLE / DISABLE ONLINE PAYMENTS
@virtual_card_bp.route("/online-payments", methods=["PUT"])
@jwt_required()
def update_online_payments():

    try:
        user_id = int(get_jwt_identity())

        data = request.get_json()

        if not data:
            return jsonify({
                "status": "error",
                "message": "Request data is required"
            }), 400

        enabled = data.get("online_payments")

        if enabled not in [True, False]:
            return jsonify({
                "status": "error",
                "message": "Invalid online payments value"
            }), 400

        card = VirtualCard.query.filter_by(
            user_id=user_id
        ).first()

        if not card:
            return jsonify({
                "status": "error",
                "message": "Virtual card not found"
            }), 404

        card.online_payments = enabled

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": (
                "Online payments enabled successfully"
                if enabled
                else "Online payments disabled successfully"
            ),
            "card": card.to_dict()
        }), 200

    except Exception as e:

        db.session.rollback()

        print("Online Payments Error:", str(e))

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

# ==============================
# UPDATE SPENDING LIMIT
# ==============================

@virtual_card_bp.route("/spending-limit", methods=["PUT"])
@jwt_required()
def update_spending_limit():

    try:

        user_id = int(get_jwt_identity())

        data = request.get_json()

        if not data:
            return jsonify({
                "status": "error",
                "message": "Request data is required"
            }), 400

        new_limit = data.get("spending_limit")

        if new_limit is None:
            return jsonify({
                "status": "error",
                "message": "Spending limit is required"
            }), 400

        try:
            new_limit = float(new_limit)
        except (TypeError, ValueError):
            return jsonify({
                "status": "error",
                "message": "Invalid spending limit"
            }), 400

        if new_limit <= 0:
            return jsonify({
                "status": "error",
                "message": "Spending limit must be greater than 0"
            }), 400

        card = VirtualCard.query.filter_by(
            user_id=user_id
        ).first()

        if not card:
            return jsonify({
                "status": "error",
                "message": "Virtual card not found"
            }), 404

        card.spending_limit = new_limit

        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Spending limit updated successfully",
            "card": card.to_dict()
        }), 200

    except Exception as e:

        db.session.rollback()

        print(
            "Spending Limit Error:",
            str(e)
        )

        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500