from rest_framework import serializers
from main.models import Vendor, Quotation, QuotationResponse, QuotationAccepted, Item


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


class ItemSerializer(serializers.ModelSerializer):
  quotation = serializers.PrimaryKeyRelatedField(
    queryset=Quotation.objects.all(),
    required=False,
  )

  class Meta:
    model = Item
    fields = [
      "id",
      "name",
      "description",
      "amount",
      "quotation"
    ]


class QuotationWithItemSerializer(serializers.ModelSerializer):
  items = ItemSerializer(many=True)

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
      "approved",
      "items"
    ]

  def create(self, validated_data):
    items_data = validated_data.pop("items")
    quotation = Quotation.objects.create(**validated_data)

    for item in items_data:
      quotation.items.create(**item)

    return quotation
