from rest_framework import serializers
from main.models import Vendor, Quotation, QuotationResponse, QuotationAccepted


class VendorSerializer(serializers.ModelSerializer):
  class Meta:
    model = Vendor
    fields = ["id", "name", "address", "email"]


class QuotationSerializer(serializers.ModelSerializer):
  class Meta:
    model = Quotation
    fields = [
      "id",
      "title",
      "department",
      "description",
      "amount",
      "submission_deadline",
      "status",
      "approved"
      ]


class QuotationResponseSerializer(serializers.ModelSerializer):
  class Meta:
    model = QuotationResponse
    fields = ["id", "quotation", "vendor", "amount"]


class QuotationAcceptedSerializer(serializers.ModelSerializer):
  class Meta:
    model = QuotationAccepted
    fields = ["id", "quotation", "response"]
