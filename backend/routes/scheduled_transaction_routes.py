from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import check_password_hash

from database import db
from models.account import Account
from models.scheduled_transaction import ScheduledTransaction


scheduled_transaction_bp = Blueprint(
    "scheduled_transaction",
    __name__
)


# -----------------------------------
# CREATE SCHEDULED TRANSACTION
# -----------------------------------

@scheduled_transaction_bp.route("", methods=["POST"])
@jwt_required()
def create_scheduled_transaction():

    try:

        user_id = int(get_jwt_identity())

        data = request.get_json()

        if not data:
            return jsonify({
                "status": "error",
                "message": "Request data is required"
            }), 400

        transaction_type = data.get("transaction_type")
        amount = data.get("amount")
        description = data.get("description")
        scheduled_date = data.get("scheduled_date")
        frequency = data.get("frequency", "ONCE")
        recipient_account_id = data.get("recipient_account_id")
        pin = data.get("pin")


        # -----------------------------------
        # VALIDATE PIN
        # -----------------------------------

        if pin is None:
            return jsonify({
                "status": "error",
                "message": "Account PIN is required"
            }), 400

        pin = str(pin)

        if not pin.isdigit() or len(pin) != 4:
            return jsonify({
                "status": "error",
                "message": "PIN must be exactly 4 digits"
            }), 400


        # -----------------------------------
        # CHECK LOGGED-IN USER'S ACCOUNT
        # -----------------------------------

        account = Account.query.filter_by(
            user_id=user_id
        ).first()

        if not account:
            return jsonify({
                "status": "error",
                "message": "Bank account not found"
            }), 404


        # -----------------------------------
        # VERIFY ACCOUNT PIN
        # -----------------------------------

        if not check_password_hash(
            account.pin_hash,
            pin
        ):
            return jsonify({
                "status": "error",
                "message": "Invalid account PIN"
            }), 401


        # -----------------------------------
        # VALIDATE TRANSACTION TYPE
        # -----------------------------------

        if transaction_type not in [
            "PAYMENT",
            "TRANSFER"
        ]:
            return jsonify({
                "status": "error",
                "message": "Invalid transaction type"
            }), 400


        # -----------------------------------
        # VALIDATE AMOUNT
        # -----------------------------------

        if amount is None:
            return jsonify({
                "status": "error",
                "message": "Amount is required"
            }), 400

        try:

            amount = float(amount)

        except (TypeError, ValueError):

            return jsonify({
                "status": "error",
                "message": "Invalid amount"
            }), 400

        if amount <= 0:
            return jsonify({
                "status": "error",
                "message": "Amount must be greater than zero"
            }), 400


        # -----------------------------------
        # VALIDATE DATE AND TIME
        # -----------------------------------

        if not scheduled_date:

            return jsonify({
                "status": "error",
                "message": "Scheduled date and time are required"
            }), 400

        try:

            scheduled_date = datetime.strptime(
                scheduled_date,
                "%Y-%m-%dT%H:%M"
            )

        except ValueError:

            return jsonify({
                "status": "error",
                "message": "Invalid scheduled date and time"
            }), 400


        # -----------------------------------
        # DATE AND TIME MUST BE IN THE FUTURE
        # -----------------------------------

        if scheduled_date <= datetime.now():

            return jsonify({
                "status": "error",
                "message": "Scheduled date and time must be in the future"
            }), 400


        # -----------------------------------
        # VALIDATE FREQUENCY
        # -----------------------------------

        if frequency not in [
            "ONCE",
            "DAILY",
            "WEEKLY",
            "MONTHLY"
        ]:

            return jsonify({
                "status": "error",
                "message": "Invalid frequency"
            }), 400


        # -----------------------------------
        # TRANSFER VALIDATION
        # -----------------------------------

        if transaction_type == "TRANSFER":

            # Receiver required
            if not recipient_account_id:

                return jsonify({
                    "status": "error",
                    "message": "Recipient account is required for transfer"
                }), 400


            # Convert recipient account number to integer
            try:

                recipient_account_id = int(
                    recipient_account_id
                )

            except (TypeError, ValueError):

                return jsonify({
                    "status": "error",
                    "message": "Invalid recipient account"
                }), 400


            # -----------------------------------
            # FIND RECIPIENT ACCOUNT
            # -----------------------------------

            recipient_account = Account.query.filter_by(
                account_number=str(recipient_account_id)
            ).first()

            if not recipient_account:

                return jsonify({
                    "status": "error",
                    "message": "Recipient account not found"
                }), 404


            # -----------------------------------
            # STORE INTERNAL ACCOUNT ID
            # -----------------------------------

            recipient_account_id = recipient_account.account_id


            # -----------------------------------
            # PREVENT TRANSFER TO OWN ACCOUNT
            # -----------------------------------

            if account.account_id == recipient_account_id:

                return jsonify({
                    "status": "error",
                    "message": "You cannot schedule a transfer to your own account"
                }), 400

        else:

            # Payment does not need recipient account
            recipient_account_id = None


        # -----------------------------------
        # CREATE SCHEDULE
        # -----------------------------------

        scheduled_transaction = ScheduledTransaction(

            user_id=user_id,

            transaction_type=transaction_type,

            recipient_account_id=recipient_account_id,

            amount=amount,

            description=description,

            scheduled_date=scheduled_date,

            frequency=frequency,

            status="SCHEDULED"

        )


        db.session.add(
            scheduled_transaction
        )

        db.session.commit()


        # -----------------------------------
        # SUCCESS RESPONSE
        # -----------------------------------

        return jsonify({

            "status": "success",

            "message": "Transaction scheduled successfully",

            "schedule": scheduled_transaction.to_dict()

        }), 201


    except Exception as e:

        db.session.rollback()

        print(
            "Scheduled Transaction Error:",
            str(e)
        )

        return jsonify({

            "status": "error",

            "message": "Failed to schedule transaction",

            "error": str(e)

        }), 500



# -----------------------------------
# GET SCHEDULED TRANSACTIONS
# -----------------------------------

@scheduled_transaction_bp.route(
    "",
    methods=["GET"]
)
@jwt_required()
def get_scheduled_transactions():

    try:

        user_id = int(
            get_jwt_identity()
        )


        schedules = ScheduledTransaction.query.filter_by(

            user_id=user_id

        ).order_by(

            ScheduledTransaction.scheduled_date.asc()

        ).all()


        return jsonify({

            "status": "success",

            "schedules": [

                schedule.to_dict()

                for schedule in schedules

            ]

        }), 200


    except Exception as e:

        print(
            "Get Scheduled Transactions Error:",
            str(e)
        )

        return jsonify({

            "status": "error",

            "message": "Failed to fetch scheduled transactions"

        }), 500



# -----------------------------------
# CANCEL SCHEDULED TRANSACTION
# -----------------------------------

@scheduled_transaction_bp.route(
    "/<int:schedule_id>/cancel",
    methods=["PUT"]
)
@jwt_required()
def cancel_scheduled_transaction(
    schedule_id
):

    try:

        user_id = int(
            get_jwt_identity()
        )


        # -----------------------------------
        # FIND USER'S SCHEDULE
        # -----------------------------------

        schedule = ScheduledTransaction.query.filter_by(

            schedule_id=schedule_id,

            user_id=user_id

        ).first()


        if not schedule:

            return jsonify({

                "status": "error",

                "message": "Scheduled transaction not found"

            }), 404


        # -----------------------------------
        # ONLY SCHEDULED TRANSACTIONS
        # CAN BE CANCELLED
        # -----------------------------------

        if schedule.status != "SCHEDULED":

            return jsonify({

                "status": "error",

                "message": "Only scheduled transactions can be cancelled"

            }), 400


        # -----------------------------------
        # CANCEL SCHEDULE
        # -----------------------------------

        schedule.status = "CANCELLED"


        db.session.commit()


        # -----------------------------------
        # SUCCESS RESPONSE
        # -----------------------------------

        return jsonify({

            "status": "success",

            "message": "Scheduled transaction cancelled successfully",

            "schedule": schedule.to_dict()

        }), 200


    except Exception as e:

        db.session.rollback()

        print(
            "Cancel Scheduled Transaction Error:",
            str(e)
        )

        return jsonify({

            "status": "error",

            "message": "Failed to cancel scheduled transaction"

        }), 500