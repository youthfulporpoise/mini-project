from django.db import models
from django.utils import timezone
from datetime import timedelta


def submission_deadline_default():
  return timezone.now() + timedelta(days=7)


class Vendor(models.Model):
  name = models.CharField(max_length=64)
  address = models.TextField()
  email = models.CharField(max_length=64)


class Quotation(models.Model):
  title = models.CharField(max_length=512)
  department = models.CharField(max_length=512)
  description = models.TextField()
  category = models.CharField(max_length=128, default="Administrative")
  submission_deadline = models.DateTimeField(default=submission_deadline_default)
  status = models.IntegerField()
  delivery_period = models.DurationField(default=timedelta(days=28))


class QuotationResponse(models.Model):
  quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE)
  vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE)


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
