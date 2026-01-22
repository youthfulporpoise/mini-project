from django.db import models


class Vendor(models.Model):
  name = models.CharField(max_length=64)
  address = models.TextField()
  email = models.CharField(max_length=64)


class Quotation(models.Model):
  title = models.CharField(max_length=512)
  department = models.CharField(max_length=512)
  description = models.TextField()
  amount = models.IntegerField()
  submission_deadline = models.DateTimeField()
  status = models.IntegerField()
  approved = models.BooleanField(default=False)


class QuotationResponse(models.Model):
  quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE)
  vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE)
  amount = models.IntegerField(default=0)


class QuotationAccepted(models.Model):
  quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE)
  response = models.ForeignKey(QuotationResponse, on_delete=models.CASCADE)
