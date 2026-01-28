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
  amount = models.IntegerField(default=0)


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
