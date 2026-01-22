from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from main import views


urlpatterns = [
  path("vendors/", views.VendorList.as_view()),
  path("quotations/", views.QuotationList.as_view()),
  path("quotations/responses/", views.QuotationResponseList.as_view()),
  path("quotations/accepted/", views.QuotationAcceptedList.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)
