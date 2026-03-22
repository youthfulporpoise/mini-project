from django.urls import path
from django.views.decorators.csrf import ensure_csrf_cookie
from main import views

from django.http import JsonResponse
from rest_framework.urlpatterns import format_suffix_patterns

# from rest_framework_simplejwt.views import (
#   TokenObtainPairView,
#   TokenRefreshView,
# )


@ensure_csrf_cookie
def get_csrf_cookie(request):
  return JsonResponse({ "message": "csrf cookie set" })


urlpatterns = [
  path("payment/create-order/", views.CreatePaymentOrderView.as_view()),
  path("payment/verify/",       views.VerifyPaymentView.as_view()),

  path("vendors/", views.VendorList.as_view()),

  path("quotations/", views.QuotationList.as_view()),
  path("quotations/<int:pk>", views.QuotationDetail.as_view()),
  path("quotations/accepted/", views.QuotationAcceptedList.as_view()),
  path("qt/", views.QuotationWithItemList.as_view()),
  path("qt/<int:pk>", views.QuotationWithItemDetail.as_view()),

  path("responses/", views.QuotationResponseList.as_view()),
  path("responses/<int:pk>", views.QuotationResponseDetail.as_view()),

  path("items/", views.ItemList.as_view()),
  path("ritems/", views.ResponseItemList.as_view()),

  path("register/", views.RegisterView.as_view()),
  path("users/", views.UserListView.as_view()),
  path("profile/", views.ProfileView.as_view()),

  path("login/", views.LoginView.as_view()),
  path("logout/", views.LogoutView.as_view()),
  path("csrf/", get_csrf_cookie),
]

urlpatterns = format_suffix_patterns(urlpatterns)
