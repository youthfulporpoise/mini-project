from django.db import models
from django.utils import timezone
from datetime import timedelta

from django.contrib.auth.models import AbstractUser
from random import randint


# This is the USER MODEL.

class User(AbstractUser):
  class Role(models.TextChoices):
    HOD = "HOD", "Head of Department"
    PRINCIPAL = "PRINCIPAL", "Principal"
    ACCOUNTANT = "ACCOUNTANT", "Accountant"
    VENDOR = "VENDOR", "Vendor"
    ADMIN = "ADMIN", "Admin"

  role = models.CharField(max_length=30, choices=Role.choices, default=Role.VENDOR)
  phone = models.CharField(max_length=15, blank=True)


# These are the SYSTEM MODELS, viz.
# vendors, quotations, items, responses, etc.

def submission_deadline_default():
  return timezone.now() + timedelta(days=7)


class Quotation(models.Model):
  class Status(models.TextChoices):
    PENDING = "PENDING", "Pending"
    APPROVED = "APPROVED", "Approved"
    REJECTED = "REJECTED", "Rejected"
    DELIVERED = "DELIVERED", "Delivered"

  title = models.CharField(max_length=512)
  department = models.CharField(max_length=512)
  description = models.TextField()
  category = models.CharField(max_length=128, default="Administrative")
  submission_deadline = models.DateTimeField(default=submission_deadline_default)
  status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
  delivery_period = models.DurationField(default=timedelta(days=28))
  created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="quotations")

  qt_req_verified_accountant = models.BooleanField(default=False)
  final_qt_verified_accountant = models.BooleanField(default=False)
  qt_verified_principal = models.BooleanField(default=False )


class QuotationResponse(models.Model):
  quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE)
  vendor = models.ForeignKey(User, on_delete=models.CASCADE)


class QuotationAccepted(models.Model):
  quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE)
  response = models.ForeignKey(QuotationResponse, on_delete=models.CASCADE)


class Item(models.Model):
  name = models.CharField(max_length=128)
  description = models.CharField(max_length=512)
  amount = models.IntegerField()
  quotation = models.ForeignKey(
    Quotation,
    on_delete=models.CASCADE,
    related_name="items",
  )


class ResponseItem(models.Model):
  item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="item_reponses")
  brand_model = models.CharField(max_length=256)
  delivery_period = models.DurationField(default=timedelta(days=28))
  unit_price = models.IntegerField()
  description = models.CharField(max_length=512)
  quotation_response = models.ForeignKey(
    QuotationResponse,
    on_delete=models.CASCADE,
    related_name="response_items",
    default=0
  )


class Payment(models.Model):
    quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE)
    razorpay_order_id = models.CharField(max_length=256)
    razorpay_payment_id = models.CharField(max_length=256, blank=True)
    razorpay_signature = models.CharField(max_length=256, blank=True)
    amount = models.IntegerField() # in paise
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.razorpay_order_id}"


class DeliveryVerification(models.Model):
  quotation = models.OneToOneField(
    Quotation, on_delete=models.CASCADE, related_name="delivery"
  )
  otp = models.CharField(max_length=6)
  is_verified = models.BooleanField(default=False)
  created_at = models.DateTimeField(auto_now_add=True)

  def is_expired(self):
    return timezone.now() > self.created_at + timezone.timedelta(minutes=5)

  @staticmethod
  def generate_otp():
    return str(randint(100000, 999999))
