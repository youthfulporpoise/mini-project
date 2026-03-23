from django.shortcuts import render
from django.core.mail import send_mail
from rest_framework.response import Response

import razorpay
import hmac
import hashlib
from django.conf import settings

from django.contrib.auth import (
  get_user_model,
  login,
  logout,
  authenticate,
)

from rest_framework import (
  views,
  generics,
  renderers,
  permissions,
  status,
)

from main.models import (
  Vendor,
  Quotation,
  QuotationResponse,
  QuotationAccepted,
  Item,
  ResponseItem,
  Payment,
  DeliveryVerification,
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
  UserSerializer,
  GenerateOTPSerializer,
  VerifyOTPSerializer,
)

from main.permissions import (
  IsAdmin,
  IsHOD,
  IsPrincipal,
  IsAccountant,
  IsVendor
)


razorpay_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


class CreatePaymentOrderView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            quotation_id = request.data.get("quotation_id")
            amount = request.data.get("amount")        # in rupees

            # convert rupees to paise
            amount_paise = int(amount) * 100

            # create order on razorpay
            order = razorpay_client.order.create({
                "amount": amount_paise,
                "currency": "INR",
                "payment_capture": 1,           # auto capture
            })

            # save to db
            Payment.objects.create(
                quotation=Quotation.objects.get(pk=quotation_id),
                razorpay_order_id=order["id"],
                amount=amount_paise,
            )

            return Response({
                "order_id": order["id"],
                "amount": amount_paise,
                "currency": "INR",
            })

        except Exception as e:
            return Response({"error": str(e)}, status=400)


class VerifyPaymentView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        razorpay_order_id = request.data.get("razorpay_order_id")
        razorpay_payment_id = request.data.get("razorpay_payment_id")
        razorpay_signature = request.data.get("razorpay_signature")

        # verify signature
        body = razorpay_order_id + "|" + razorpay_payment_id
        expected_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            body.encode(),
            hashlib.sha256
        ).hexdigest()

        if expected_signature == razorpay_signature:
            # update payment record
            payment = Payment.objects.get(razorpay_order_id=razorpay_order_id)
            payment.razorpay_payment_id = razorpay_payment_id
            payment.razorpay_signature = razorpay_signature
            payment.is_verified = True
            payment.save()

            # update quotation status to paid
            payment.quotation.status = 5
            payment.quotation.save()

            return Response({"message": "payment verified", "status": "success"})

        else:
            return Response({"error": "invalid signature"}, status=400)


##########################################

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


class GenerateOTPView(views.APIView):
  permission_classes = [permissions.IsAuthenticated]
  
  def post(self, request):
    serializer = GenerateOTPSerializer(data=request.data)
    if not serializer.is_valid():
      return Response(
        serializers.errors, status=status.HTTP_400_BAD_REQUEST 
      )

    quotation_id = serializer.validated_data["quotation_id"]

    try:
      quotation = Quotation.objects.get(id=quotation_id)
    except Quotation.DoesNotExist:
      return Response(
        {"error": "quotation not found"},
        status=status.HTTP_400_BAD_REQUEST
      )

    DeliveryVerification.objects.filter(quotation=quotation).delete()

    otp_code = DeliveryVerification.generate_otp()
    DeliveryVerification.objects.create(quotation=quotation, otp=otp_code)

    send_mail(
      subject="QMS - Delivery Verification OTP",
      message=(
        f"Quotation ID: {quotation.id}\n"
        f"Delivery Verification OTP: {otp_code}\n"
        "This OTP is valid for 5 minutes.\n",
      ),
      from_email=settings.DEFAULT_FROM_EMAIL,
      recipient_list=[request.user.email],
      fail_silently=False
    )

    return Response(
      {"message": "OTP sent to registered mail"},
      status=status.HTTP_200_OK,
    )


class VerifyOTPView(views.APIView):
  permission_classes = [permissions.IsAuthenticated]

  def post(self, request):
    serializer = VerifyOTPSerializer(data=request.data)
    if not serializer.is_valid():
      return Response(
        serializers.errors,
        status=status.HTTP_400_BAD_REQUEST,
      )

    quotation_id = serializer.validated_data["quotation_id"]
    otp_input = serializer.validated_data["otp"]

    try:
      delivery = DeliveryVerification.objects.get(
        quotation__id=quotation_id,
        is_verified=False
      )
    except DeliveryVerification.DoesNotExist:
      return Response(
        {"error": "No pending OTP found for this quotation"},
        status=status.HTTP_404_NOT_FOUND,
      )

    if delivery.is_expired():
      return Response(
        {"error": "OTP expired"},
        status=status.HTTP_400_BAD_REQUEST,
      )

    if delivery_otp != otp_input:
      return Response(
        {"error": "OTP does not match"},
        status=status.HTTP_400_BAD_REQUEST,
      )

    delivery.is_verified = True
    delivery.save()

    quotation = delivery.quotation
    quotation.status = "DELIVERED"
    quotation.save()

    return Response(
      {
        "message": "Delivery verified",
        "quotation_id": quotation.id,
        "status": quotation.status,
      },
      status=status.HTTP_200_OK,
    )
