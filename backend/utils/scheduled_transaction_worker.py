from datetime import date, timedelta
import calendar

from models.scheduled_transaction import ScheduledTransaction
from models.account import Account
from models.transaction import Transaction
from models.virtual_card import VirtualCard

from database import db


# --------------------------------
# Calculate Next Monthly Date
# --------------------------------

def get_next_month_date(current_date):

    year = current_date.year
    month = current_date.month

    if month == 12:

        year += 1
        month = 1

    else:

        month += 1

    last_day = calendar.monthrange(
        year,
        month
    )[1]

    day = min(
        current_date.day,
        last_day
    )

    return current_date.replace(
        year=year,
        month=month,
        day=day
    )


# --------------------------------
# Execute Scheduled Transactions
# --------------------------------

def execute_scheduled_transactions(app):

    with app.app_context():

        today = date.today()

        schedules = ScheduledTransaction.query.filter(
            ScheduledTransaction.status == "SCHEDULED",
            ScheduledTransaction.scheduled_date <= today
        ).all()

        if not schedules:

            return

        print(
            f"Found {len(schedules)} scheduled transaction(s)."
        )

        for schedule in schedules:

            try:

                print(
                    f"Processing schedule "
                    f"{schedule.schedule_id}"
                )

                # --------------------------------
                # Find User Account
                # --------------------------------

                account = Account.query.filter_by(
                    user_id=schedule.user_id
                ).first()

                if not account:

                    print(
                        f"Schedule {schedule.schedule_id}: "
                        f"Bank account not found."
                    )

                    continue


                # =================================
                # PAYMENT
                # =================================

                if schedule.transaction_type == "PAYMENT":

                    # --------------------------------
                    # Find Virtual Card
                    # --------------------------------

                    card = VirtualCard.query.filter_by(
                        user_id=schedule.user_id
                    ).first()

                    if not card:

                        print(
                            f"Schedule {schedule.schedule_id}: "
                            f"Virtual card not found."
                        )

                        continue


                    # --------------------------------
                    # Check Card Status
                    # --------------------------------

                    if card.status == "FROZEN":

                        print(
                            f"Schedule {schedule.schedule_id}: "
                            f"Card is frozen."
                        )

                        continue


                    # --------------------------------
                    # Check Online Payments
                    # --------------------------------

                    if not card.online_payments:

                        print(
                            f"Schedule {schedule.schedule_id}: "
                            f"Online payments are disabled."
                        )

                        continue


                    # --------------------------------
                    # Check Spending Limit
                    # --------------------------------

                    if float(schedule.amount) > float(
                        card.spending_limit
                    ):

                        print(
                            f"Schedule {schedule.schedule_id}: "
                            f"Payment exceeds spending limit."
                        )

                        continue


                    # --------------------------------
                    # Check Account Balance
                    # --------------------------------

                    if float(account.balance) < float(
                        schedule.amount
                    ):

                        print(
                            f"Schedule {schedule.schedule_id}: "
                            f"Insufficient balance."
                        )

                        continue


                    # --------------------------------
                    # Deduct Payment
                    # --------------------------------

                    account.balance = (
                        float(account.balance)
                        - float(schedule.amount)
                    )


                    # --------------------------------
                    # Create Payment Transaction
                    # --------------------------------

                    transaction = Transaction(

                        account_id=account.account_id,

                        transaction_type="CARD_PAYMENT",

                        amount=schedule.amount,

                        recipient_account_id=None,

                        description=schedule.description,

                        status="SUCCESS"
                    )

                    db.session.add(transaction)


                # =================================
                # TRANSFER
                # =================================

                elif schedule.transaction_type == "TRANSFER":

                    # --------------------------------
                    # Check Recipient
                    # --------------------------------

                    if not schedule.recipient_account_id:

                        print(
                            f"Schedule {schedule.schedule_id}: "
                            f"Recipient account not specified."
                        )

                        continue


                    # --------------------------------
                    # Find Recipient Account
                    # --------------------------------

                    recipient = Account.query.filter_by(
                        account_id=schedule.recipient_account_id
                    ).first()

                    if not recipient:

                        print(
                            f"Schedule {schedule.schedule_id}: "
                            f"Recipient account not found."
                        )

                        continue


                    # --------------------------------
                    # Prevent Same Account Transfer
                    # --------------------------------

                    if recipient.account_id == account.account_id:

                        print(
                            f"Schedule {schedule.schedule_id}: "
                            f"Cannot transfer to same account."
                        )

                        continue


                    # --------------------------------
                    # Check Balance
                    # --------------------------------

                    if float(account.balance) < float(
                        schedule.amount
                    ):

                        print(
                            f"Schedule {schedule.schedule_id}: "
                            f"Insufficient balance."
                        )

                        continue


                    # --------------------------------
                    # Deduct From Sender
                    # --------------------------------

                    account.balance = (
                        float(account.balance)
                        - float(schedule.amount)
                    )


                    # --------------------------------
                    # Add To Recipient
                    # --------------------------------

                    recipient.balance = (
                        float(recipient.balance)
                        + float(schedule.amount)
                    )


                    # --------------------------------
                    # Create Transfer Transaction
                    # --------------------------------

                    transaction = Transaction(

                        account_id=account.account_id,

                        transaction_type="TRANSFER",

                        amount=schedule.amount,

                        recipient_account_id=recipient.account_id,

                        description=schedule.description,

                        status="SUCCESS"
                    )

                    db.session.add(transaction)


                # =================================
                # UNKNOWN TYPE
                # =================================

                else:

                    print(
                        f"Schedule {schedule.schedule_id}: "
                        f"Unknown transaction type."
                    )

                    continue


                # =================================
                # UPDATE SCHEDULE
                # =================================

                # --------------------------------
                # ONCE
                # --------------------------------

                if schedule.frequency == "ONCE":

                    schedule.status = "COMPLETED"


                # --------------------------------
                # DAILY
                # --------------------------------

                elif schedule.frequency == "DAILY":

                    schedule.scheduled_date = (
                        schedule.scheduled_date
                        + timedelta(days=1)
                    )


                # --------------------------------
                # WEEKLY
                # --------------------------------

                elif schedule.frequency == "WEEKLY":

                    schedule.scheduled_date = (
                        schedule.scheduled_date
                        + timedelta(days=7)
                    )


                # --------------------------------
                # MONTHLY
                # --------------------------------

                elif schedule.frequency == "MONTHLY":

                    schedule.scheduled_date = (
                        get_next_month_date(
                            schedule.scheduled_date
                        )
                    )


                # --------------------------------
                # Save Everything
                # --------------------------------

                db.session.commit()


                print(
                    f"Schedule {schedule.schedule_id} "
                    f"executed successfully."
                )


            except Exception as e:

                db.session.rollback()

                print(
                    f"Schedule {schedule.schedule_id} "
                    f"failed: {str(e)}"
                )