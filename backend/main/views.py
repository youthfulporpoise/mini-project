from django.shortcuts import render
from django.contrib.auth import (
  get_user_model,
  login,
  logout,
  authenticate,
)

from rest_framework import views, generics, renderers, permissions
from rest_framework.response import Response

from main.models import (
  Vendor,
  Quotation,
  QuotationResponse,
  QuotationAccepted,
  Item,
  ResponseItem
)

from main.serializers import (
  VendorSerializer,
  QuotationSerializer,
  QuotationResponseSerializer,
  QuotationAcceptedSerializer,
  ItemSerializer,
  QuotationWithItemSerializer,
  ResponseItemSerializer,
  RegisterSerializer,
  UserSerializer
)

from main.permissions import (
  IsAdmin,
  IsHOD,
  IsPrincipal,
  IsAccountant,
  IsVendor
)


User = get_user_model()


###########################################


class RegisterView(generics.CreateAPIView):
  queryset = User.objects.all()
  serializer_class = RegisterSerializer
  permission_classes = [permissions.AllowAny]


class LoginView(views.APIView):
  permission_classes = [permissions.AllowAny]

  def post(self, request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(request, username=username, password=password)
    if user:
      login(request, user)
      return Response({
        "message": "logged in",
        "user_id": user.id,
        "username": user.username,
        "role": user.role 
      })
    else:
      return Response({ "error": "invalid credentials" })


class LogoutView(views.APIView):
  permission_classes = [permissions.IsAuthenticated]

  def post(self, request):
    logout(request)
    return Response({ "message": "logged out" })


class UserListView(generics.ListAPIView):
  queryset = User.objects.all()
  serializer_class = UserSerializer
  permission_classes = [IsAdmin]


class ProfileView(generics.ListAPIView):
  permission_classes = [permissions.IsAuthenticated]

  def get(self, request):
    user = request.user
    return Response({
      "id": user.id,
      "name": user.username,
      "email": user.email,
      "phone": user.phone,
      "role": user.role,
    })


###########################################


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
