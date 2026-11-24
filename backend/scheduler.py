from datetime import datetime, timedelta

from apscheduler.schedulers.background import BackgroundScheduler

from database import db
from models.account import Account
from models.transaction import Transaction
from models.scheduled_transaction import ScheduledTransaction


scheduler = BackgroundScheduler(
    timezone="Asia/Kolkata"
)


def execute_due_scheduled_transactions(app):

    with app.app_context():

        try:

            now = datetime.now()

            schedules = ScheduledTransaction.query.filter(
                ScheduledTransaction.status == "SCHEDULED",
                ScheduledTransaction.scheduled_date <= now
            ).all()

            if not schedules:
                return

            print(
                f"Found {len(schedules)} due scheduled transaction(s)."
            )

            for schedule in schedules:

                try:

                    # ------------------------------------------------
                    # TRANSFER
                    # ------------------------------------------------

                    if schedule.transaction_type == "TRANSFER":

                        sender = Account.query.filter_by(
                            user_id=schedule.user_id
                        ).first()

                        recipient = Account.query.filter_by(
                            account_id=schedule.recipient_account_id
                        ).first()

                        if not sender:
                            print(
                                f"Schedule {schedule.schedule_id}: "
                                "Sender account not found."
                            )
                            continue

                        if not recipient:
                            print(
                                f"Schedule {schedule.schedule_id}: "
                                "Recipient account not found."
                            )
                            continue

                        # Check balance

                        if float(sender.balance) < float(schedule.amount):

                            print(
                                f"Schedule {schedule.schedule_id}: "
                                "Insufficient balance."
                            )

                            # Keep it SCHEDULED.
                            # It can execute later if money is added.
                            continue

                        # Prevent transfer to same account

                        if sender.account_id == recipient.account_id:

                            print(
                                f"Schedule {schedule.schedule_id}: "
                                "Sender and recipient are same."
                            )
                            continue

                        # --------------------------------------------
                        # Debit sender
                        # --------------------------------------------

                        sender.balance = (
                            float(sender.balance)
                            - float(schedule.amount)
                        )

                        # --------------------------------------------
                        # Credit recipient
                        # --------------------------------------------

                        recipient.balance = (
                            float(recipient.balance)
                            + float(schedule.amount)
                        )

                        # --------------------------------------------
                        # Create sender transaction
                        # --------------------------------------------

                        sender_transaction = Transaction(
                            account_id=sender.account_id,
                            transaction_type="TRANSFER",
                            amount=schedule.amount,
                            recipient_account_id=recipient.account_id,
                            description=schedule.description
                            or "Scheduled transfer",
                            status="SUCCESS"
                        )

                        db.session.add(
                            sender_transaction
                        )

                        # --------------------------------------------
                        # Create recipient transaction
                        # --------------------------------------------

                        recipient_transaction = Transaction(
                            account_id=recipient.account_id,
                            transaction_type="TRANSFER",
                            amount=schedule.amount,
                            recipient_account_id=sender.account_id,
                            description=schedule.description
                            or "Scheduled transfer received",
                            status="SUCCESS"
                        )

                        db.session.add(
                            recipient_transaction
                        )

                        # --------------------------------------------
                        # Update schedule
                        # --------------------------------------------

                        if schedule.frequency == "ONCE":

                            schedule.status = "COMPLETED"

                        elif schedule.frequency == "DAILY":

                            schedule.scheduled_date += timedelta(
                                days=1
                            )

                        elif schedule.frequency == "WEEKLY":

                            schedule.scheduled_date += timedelta(
                                weeks=1
                            )

                        elif schedule.frequency == "MONTHLY":

                            # Simple monthly calculation
                            # Preserve the current day when possible

                            month = schedule.scheduled_date.month
                            year = schedule.scheduled_date.year

                            if month == 12:
                                month = 1
                                year += 1
                            else:
                                month += 1

                            try:

                                schedule.scheduled_date = (
                                    schedule.scheduled_date.replace(
                                        year=year,
                                        month=month
                                    )
                                )

                            except ValueError:

                                # For dates such as 31st,
                                # move to the first valid day
                                # of the following month.

                                if month == 12:
                                    next_month = 1
                                    next_year = year + 1
                                else:
                                    next_month = month + 1
                                    next_year = year

                                schedule.scheduled_date = (
                                    schedule.scheduled_date.replace(
                                        year=next_year,
                                        month=next_month,
                                        day=1
                                    )
                                )

                        db.session.commit()

                        print(
                            f"Schedule {schedule.schedule_id}: "
                            "TRANSFER completed successfully."
                        )

                except Exception as e:

                    db.session.rollback()

                    print(
                        f"Schedule {schedule.schedule_id} "
                        f"execution error: {str(e)}"
                    )

        except Exception as e:

            print(
                "Scheduled Transaction Worker Error:",
                str(e)
            )


def start_scheduler(app):

    if scheduler.running:
        return

    scheduler.add_job(
        func=execute_due_scheduled_transactions,
        args=[app],
        trigger="interval",
        seconds=30,
        id="scheduled_transaction_worker",
        replace_existing=True
    )

    scheduler.start()

    print(
        "FINVERSE Scheduled Transaction Worker started."
    )