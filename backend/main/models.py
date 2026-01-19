from django.db import models


class Vendor(models.Model):
  name = models.CharField(max_length=64)


class Client(models.Model):
  name = models.CharField(max_length=64)


class Quotation(models.Model):
  title = models.CharField(max_length=512)
  client = ForeignKey(Client, on_delete=models.CASCADE)


class QuotationResponse(models.Model):
  quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE)
  vendor = models.ForeignKey(Vendor, on_delete=models.CASCADE)


class QuotationAccepted(models.Model):
  quotation = models.ForeignKey(Quotation, on_delete=models.CASCADE)
  response = models.ForeignKey(QuotationResponse, on_delete=models.CASCADE)
