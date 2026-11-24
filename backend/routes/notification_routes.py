from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from models.notification import Notification
from database import db


notification_bp = Blueprint(
    "notification",
    __name__
)


# =========================================================
# GET USER NOTIFICATIONS
# =========================================================

@notification_bp.route("/notifications", methods=["GET"])
@jwt_required()
def get_notifications():

    try:

        user_id = int(get_jwt_identity())

        notifications = (
            Notification.query
            .filter_by(user_id=user_id)
            .order_by(
                Notification.created_at.desc()
            )
            .all()
        )

        unread_count = (
            Notification.query
            .filter_by(
                user_id=user_id,
                is_read=False
            )
            .count()
        )

        notification_list = []

        for notification in notifications:

            notification_list.append({

                "notification_id":
                    notification.notification_id,

                "title":
                    notification.title,

                "message":
                    notification.message,

                "is_read":
                    notification.is_read,

                "created_at":
                    notification.created_at.isoformat()
                    if notification.created_at
                    else None

            })

        return jsonify({

            "status": "success",

            "notifications":
                notification_list,

            "unread_count":
                unread_count

        }), 200

    except Exception as e:

        print(
            "Get Notifications Error:",
            str(e)
        )

        return jsonify({

            "status": "error",

            "message":
                "Failed to retrieve notifications",

            "error":
                str(e)

        }), 500


# =========================================================
# MARK ONE NOTIFICATION AS READ
# =========================================================

@notification_bp.route(
    "/notifications/<int:notification_id>/read",
    methods=["PUT"]
)
@jwt_required()
def mark_notification_read(notification_id):

    try:

        user_id = int(get_jwt_identity())

        notification = Notification.query.filter_by(

            notification_id=notification_id,

            user_id=user_id

        ).first()

        if not notification:

            return jsonify({

                "status": "error",

                "message":
                    "Notification not found"

            }), 404

        notification.is_read = True

        db.session.commit()

        return jsonify({

            "status": "success",

            "message":
                "Notification marked as read"

        }), 200

    except Exception as e:

        db.session.rollback()

        print(
            "Mark Notification Error:",
            str(e)
        )

        return jsonify({

            "status": "error",

            "message":
                "Failed to update notification",

            "error":
                str(e)

        }), 500


# =========================================================
# MARK ALL NOTIFICATIONS AS READ
# =========================================================

@notification_bp.route(
    "/notifications/read-all",
    methods=["PUT"]
)
@jwt_required()
def mark_all_notifications_read():

    try:

        user_id = int(get_jwt_identity())

        notifications = Notification.query.filter_by(

            user_id=user_id,

            is_read=False

        ).all()

        for notification in notifications:

            notification.is_read = True

        db.session.commit()

        return jsonify({

            "status": "success",

            "message":
                "All notifications marked as read"

        }), 200

    except Exception as e:

        db.session.rollback()

        print(
            "Mark All Notifications Error:",
            str(e)
        )

        return jsonify({

            "status": "error",

            "message":
                "Failed to update notifications",

            "error":
                str(e)

        }), 500