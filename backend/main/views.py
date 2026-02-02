from django.shortcuts import render

from rest_framework import generics, renderers, permissions
from rest_framework.response import Response

from main.models import   \
  Vendor,                 \
  Quotation,              \
  QuotationResponse,      \
  QuotationAccepted,      \
  Item,                   \
  ResponseItem

from main.serializers import      \
  VendorSerializer,               \
  QuotationSerializer,            \
  QuotationResponseSerializer,    \
  QuotationAcceptedSerializer,    \
  ItemSerializer,                 \
  QuotationWithItemSerializer,    \
  ResponseItemSerializer


class VendorList(generics.ListCreateAPIView):
  permission_class = [permissions.AllowAny]
  queryset = Vendor.objects.all()
  serializer_class = VendorSerializer


class QuotationList(generics.ListCreateAPIView):
  permission_classes = [permissions.AllowAny]
  queryset = Quotation.objects.all()
  serializer_class = QuotationSerializer


class QuotationResponseList(generics.ListCreateAPIView):
  permission_classes = [permissions.AllowAny]
  queryset = QuotationResponse.objects.all()
  serializer_class = QuotationResponseSerializer


class QuotationResponseDetail(generics.RetrieveUpdateDestroyAPIView):
  permission_classes = [permissions.AllowAny]
  queryset = QuotationResponse.objects.all()
  serializer_class = QuotationResponseSerializer


class ResponseItemList(generics.ListCreateAPIView):
  permission_classes = [permissions.AllowAny]
  queryset = ResponseItem.objects.all()
  serializer_class = ResponseItemSerializer


class QuotationAcceptedList(generics.ListCreateAPIView):
  permission_classes = [permissions.AllowAny]
  queryset = QuotationAccepted.objects.all()
  serializer_class = QuotationAcceptedSerializer


class ItemList(generics.ListCreateAPIView):
  permission_classes = [permissions.AllowAny]
  queryset = Item.objects.all()
  serializer_class = ItemSerializer


class QuotationDetail(generics.RetrieveUpdateDestroyAPIView):
  permission_classes = [permissions.AllowAny]
  queryset = Quotation.objects.all()
  serializer_class = QuotationSerializer
  

class QuotationWithItemList(generics.ListCreateAPIView):
  permission_classes = [permissions.AllowAny]
  queryset = Quotation.objects.all()
  serializer_class = QuotationWithItemSerializer


class QuotationWithItemDetail(generics.RetrieveUpdateDestroyAPIView):
  permission_classes = [permissions.AllowAny]
  queryset = Quotation.objects.all()
  serializer_class = QuotationWithItemSerializer
