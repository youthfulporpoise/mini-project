from django.shortcuts import render

from rest_framework import generics, renderers
from rest_framework.response import Response

from main.models import Vendor, Client, Quotation, QuotationResponse, QuotationAccepted
