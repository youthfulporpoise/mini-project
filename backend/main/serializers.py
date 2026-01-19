from rest_framework import serializers
from main.models import Vendor, Client, Quotation, QuotationResponse, QuotationAccepted


class VendorSerializer(serializers.HyperlinkedModelSerializer):
  class Meta:
    model = Vendor
    fields = ["url", "name"]


class ClientSerializer(serializers.HyperlinkedModelSerializer):
  class Meta:
    model = Client
    fields = ["url", "name"]


class QuotationSerializer(serializers.HyperlinkedSerializer):
  class Meta:
    model = Quotation
    fields = ["url", "title", "client"]


class QuotationResponseSerializer(serializers.HyperlinkedSerializer):
  class Meta:
    model = QuotationResponse
    fields = ["url", "quotation", "vendor"]


class QuotationAccepted(serializers.HyperlinkedSerializer):
  class Meta:
    model = QuotationAccepted
    fields = ["url", "quotation", "response"]
