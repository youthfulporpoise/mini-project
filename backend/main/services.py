# services.py
import razorpay
from django.conf import settings


def get_razorpay_client():
    return razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )


def create_razorpay_order(amount_inr: float, currency="INR", notes=None):
    """Creates a Razorpay order and returns the raw API response."""

    client = get_razorpay_client()
    return client.order.create({
        "amount":   int(amount_inr * 100),  # convert to paise
        "currency": currency,
        "notes":    notes or {},
    })


def fetch_payment(payment_id: str):
    """Fetches a payment's full details from Razorpay API."""

    client = get_razorpay_client()
    return client.payment.fetch(payment_id)


def verify_signature(order_id, payment_id, signature):
    """Returns True if the webhook signature is valid."""

    client = get_razorpay_client()
    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id":   order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature":  signature,
        })
        return True
    except razorpay.errors.SignatureVerificationError:
        return False
