from rest_framework import serializers
from main.models import (
  Quotation,
  QuotationResponse,
  QuotationAccepted,
  Item,
  ResponseItem
)
from django.contrib.auth import get_user_model


User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
  password = serializers.CharField(write_only=True)

  class Meta:
    model = User
    fields = [
      "id",
      "username",
      "email",
      "password",
      "phone",
      "role",
    ]

  def create(self, validated_data):
    password = validated_data.pop("password")
    user = User(**validated_data)
    user.set_password(password)
    user.save()

    return user


class UserSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = [
      "id",
      "username",
      "email",
      "phone",
      "role",
    ]


class QuotationSerializer(serializers.ModelSerializer):
  class Meta:
    model = Quotation
    fields = [
      "id",
      "title",
      "department",
      "category",
      "description",
      "submission_deadline",
      "status",
      "delivery_period",
      "created_by",
    ]


class QuotationAcceptedSerializer(serializers.ModelSerializer):
  class Meta:
    model = QuotationAccepted
    fields = ["id", "quotation", "response"]


class ItemSerializer(serializers.ModelSerializer):
  quotation = serializers.PrimaryKeyRelatedField(
    queryset=Quotation.objects.all(),
    required=False,
    write_only=True,
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
      "category",
      "submission_deadline",
      "status",
      "delivery_period",
      # new column responses
      "qt_req_verified_accountant",
      "final_qt_verified_accountant"   ,
      "qt_verified_principal",
      "otp_verified",
      "items"
    ]

  def create(self, validated_data):
    items_data = validated_data.pop("items")
    quotation = Quotation.objects.create(**validated_data)

    for item in items_data:
      quotation.items.create(**item)

    return quotation


class ResponseItemSerializer(serializers.ModelSerializer):
  quotation_response = serializers.PrimaryKeyRelatedField(
    queryset=QuotationResponse.objects.all(),
    required=False,
    write_only=True
  )

  class Meta:
    model = ResponseItem
    fields = [
      "id",
      "item",
      "brand_model",
      "delivery_period",
      "unit_price",
      "description",
      "quotation_response"
    ]


class QuotationResponseSerializer(serializers.ModelSerializer):
  response_items = ResponseItemSerializer(many=True)
  vendor = serializers.PrimaryKeyRelatedField(read_only=True)

  class Meta:
    model = QuotationResponse
    fields = ["id", "quotation", "vendor", "response_items"]

  def create(self, validated_data):
    items_data = validated_data.pop("response_items")
    validated_data["vendor"] = self.context["request"].user
    quotation_response = QuotationResponse.objects.create(**validated_data)

    for item in items_data:
      quotation_response.response_items.create(**item)

    return quotation_response


class GenerateOTPSerializer(serializers.Serializer):
  quotation_id = serializers.IntegerField()


class VerifyOTPSerializer(serializers.Serializer):
  quotation_id = serializers.IntegerField()
  otp = serializers.CharField(max_length=6)
