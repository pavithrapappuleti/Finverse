import random
from datetime import datetime

from models.virtual_card import VirtualCard


def generate_card_number():

    while True:

        first_digit = random.choice("4567")

        remaining_digits = ""

        for i in range(15):
            remaining_digits += random.choice("0123456789")

        card_number = first_digit + remaining_digits

        existing_card = VirtualCard.query.filter_by(
            card_number=card_number
        ).first()

        if not existing_card:
            return card_number


def generate_cvv():

    cvv = ""

    for i in range(3):
        cvv += random.choice("0123456789")

    return cvv


def generate_expiry_date():

    current_year = datetime.now().year
    current_month = datetime.now().month

    expiry_year = current_year + 4

    return f"{current_month:02d}/{str(expiry_year)[-2:]}"