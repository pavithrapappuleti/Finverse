from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models.user import User
from models.account import Account


profile_bp = Blueprint("profile", __name__)


@profile_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():

    try:
        user_id = int(get_jwt_identity())

        # Find user
        user = User.query.filter_by(user_id=user_id).first()

        if not user:
            return jsonify({
                "status": "error",
                "message": "User not found"
            }), 404

        # Find account
        account = Account.query.filter_by(
            user_id=user_id
        ).first()

        if not account:
            return jsonify({
                "status": "error",
                "message": "Bank account not found"
            }), 404

        return jsonify({
            "status": "success",

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

                "created_at": (
                    user.created_at.isoformat()
                    if user.created_at
                    else None
                ),

                "status": user.status
            },

            "account": {
                "account_number": account.account_number,

                "account_type": (
                    account.account_type.value
                    if hasattr(account.account_type, "value")
                    else str(account.account_type)
                ),

                "balance": float(account.balance)
            }
        }), 200

    except Exception as e:

        print("PROFILE ERROR:", e)

        return jsonify({
            "status": "error",
            "message": "Unable to fetch profile"
        }), 500