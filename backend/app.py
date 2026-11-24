from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy import text
import os

from models.kyc_resubmission_token import KYCResubmissionToken

from config import Config
from database import db

# --------------------------------
# Models
# --------------------------------

from models.user import User
from models.virtual_card import VirtualCard
from models.scheduled_transaction import ScheduledTransaction
from models.savings_goal import SavingsGoal
from models.savings_goal_contribution import SavingsGoalContribution
from models.password_reset import PasswordReset


# --------------------------------
# Routes
# --------------------------------

from routes.auth_routes import auth_bp
from routes.account_routes import account_bp
from routes.transaction_routes import transaction_bp
from routes.Profile_routes import profile_bp
from routes.admin_routes import admin_bp
from routes.virtual_card_routes import virtual_card_bp
from routes.scheduled_transaction_routes import scheduled_transaction_bp
from routes.notification_routes import notification_bp
from routes.savings_goal_routes import savings_goal_bp

from models.password_reset import PasswordReset
# --------------------------------
# JWT
# --------------------------------

from flask_jwt_extended import JWTManager


# --------------------------------
# Scheduler
# --------------------------------

from scheduler import start_scheduler


# --------------------------------
# Email
# --------------------------------

from extensions import mail






# --------------------------------
# Create Flask App
# --------------------------------

app = Flask(__name__)


# --------------------------------
# Load Configuration
# --------------------------------

app.config.from_object(Config)


# --------------------------------
# Email Configuration
# --------------------------------
# Replace these two values with
# your FINVERSE Gmail and App Password

app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True

app.config["MAIL_USERNAME"] = "bankingfinverse@gmail.com"
app.config["MAIL_PASSWORD"] = "wshv fqkn sexx rugw"

app.config["MAIL_DEFAULT_SENDER"] = "bankingfinverse@gmail.com"

# Initialize Flask-Mail

mail.init_app(app)


# --------------------------------
# JWT
# --------------------------------

jwt = JWTManager(app)


# --------------------------------
# Enable CORS
# --------------------------------

CORS(app)


# --------------------------------
# Initialize Database
# --------------------------------

db.init_app(app)


# --------------------------------
# Register Blueprints
# --------------------------------

app.register_blueprint(
    auth_bp,
    url_prefix="/api"
)


app.register_blueprint(
    account_bp,
    url_prefix="/api/account"
)


app.register_blueprint(
    transaction_bp,
    url_prefix="/api"
)


app.register_blueprint(
    profile_bp,
    url_prefix="/api"
)


app.register_blueprint(
    admin_bp,
    url_prefix="/api/admin"
)


app.register_blueprint(
    virtual_card_bp,
    url_prefix="/api/card"
)


app.register_blueprint(
    scheduled_transaction_bp,
    url_prefix="/api/scheduled"
)


app.register_blueprint(
    savings_goal_bp,
    url_prefix="/api/savings"
)


app.register_blueprint(
    notification_bp,
    url_prefix="/api"
)


# --------------------------------
# Create Missing Database Tables
# --------------------------------
# This creates password_resets if it
# does not already exist.
# Existing tables are not deleted.

with app.app_context():
    db.create_all()


# --------------------------------
# Start Scheduled Transaction Worker
# --------------------------------
#
# Flask debug mode creates a reloader
# process. We start the scheduler only
# in the actual Flask process to prevent
# duplicate execution.
#

if not app.debug or os.environ.get("WERKZEUG_RUN_MAIN") == "true":

    scheduler = start_scheduler(app)

    print("Scheduled transaction worker started.")


# --------------------------------
# Home Route
# --------------------------------

@app.route("/")
def home():

    return jsonify({
        "message": "Welcome to FINVERSE API",
        "status": "Backend is running"
    })


# --------------------------------
# Test Database
# --------------------------------

@app.route("/api/test-db")
def test_database():

    try:

        with db.engine.connect() as connection:

            connection.execute(
                text("SELECT 1")
            )

        return jsonify({
            "status": "success",
            "message": "Database connected successfully",
            "database": "finverse_db"
        })

    except Exception as e:

        return jsonify({
            "status": "error",
            "message": "Database connection failed",
            "error": str(e)
        }), 500


# --------------------------------
# Run Flask
# --------------------------------

if __name__ == "__main__":

    app.run(debug=True)