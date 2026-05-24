import razorpay
import hmac
import hashlib
import requests 

from django.shortcuts import render
from django.core.mail import send_mail
from rest_framework.response import Response
from django.conf import settings
from django.http import JsonResponse

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
  Quotation,
  QuotationResponse,
  QuotationAccepted,
  Item,
  ResponseItem,
  Payment,
  DeliveryVerification,
  PaymentArchive,
)

from main.serializers import (
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

from main.services import (
  create_razorpay_order,
  fetch_payment,
  verify_signature,
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
            payment.quotation.status = "SUCCESS"
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


class QuotationList(generics.ListCreateAPIView):
  permission_classes = [permissions.IsAuthenticated]
  serializer_class = QuotationSerializer

  def get_queryset(self):
    user = self.request.user

    if user.role == "HOD":
      return Quotation.objects.filter(created_by=user.id)
    else:
      return Quotation.objects.all()
  
  def perform_create(self, serializer):
    user = self.request.user

    if user.role == "HOD":
      serializer.save(created_by=self.request.user)
    else:
      return Response({
        "message": "not authorized to create a quotation",
        "status": status.HTTP_400_BAD_REQUEST,
      })


class QuotationResponseList(generics.ListCreateAPIView):
  permission_classes = [permissions.IsAuthenticated]
  serializer_class = QuotationResponseSerializer

  def get_queryset(self):
    user = self.request.user

    if user.role == "HOD":
      return QuotationResponse.objects.filter(quotation__created_by=user)
    elif user.role == "VENDOR":
      return QuotationResponse.objects.filter(vendor__id=user.id)
    elif user.role in ("PRINCIPAL", "ACCOUNTANT", "ADMIN"):
      return QuotationResponse.objects.all()
    else:
      return QuotationResponse.objects.none()
    
  def perform_create(self, serializer):
    user = self.request.user

    if user.role == "VENDOR":
      serializer.save(vendor=user)
    else:
      return Response({
        "message": "not a vendor",
        "status": status.HTTP_400_BAD_REQUEST,
      })


class QuotationAcceptedResponseList(views.APIView):
  permission_classes = [permissions.IsAuthenticated]

  def get(self , request):
    verified_quotation = Quotation.objects.filter(qt_req_verified_accountant = True)
    result = [] 

    for quotation in verified_quotation: 
      responses = QuotationResponse.objects.filter(quotation = quotation)
      result.append({
        "quotation_id":    quotation.id,
        "quotation_title": quotation.title,
        "department":      quotation.department,
        "category":        quotation.category,
        "status":          quotation.status,
        "responses": [
          {
            "response_id": r.id,
            "vendor_id":   r.vendor.id,
            "vendor_name":  r.vendor.get_full_name() or r.vendor.username,
            "vendor_email":r.vendor.email,
            "response_items": [
              {
                  "id":              ri.id,
                  "item_id":         ri.item.id,
                  "item_name":       ri.item.name,
                  "brand_model":     ri.brand_model,
                  "unit_price":      ri.unit_price,
                  "delivery_period": str(ri.delivery_period),
                  "description":     ri.description,
              }
              for ri in r.response_items.all()
            ],
          }
          for r in responses
        ],
      })
    return Response(result)

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
  def perform_create(self, serializer):
    accepted = serializer.save() 
    accepted.quotation.status = Quotation.Status.APPROVED
    accepted.quotation.save()

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

  def perform_create(self, serializer):
    serializer.save(created_by=self.request.user)


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
        serializer.errors, status=status.HTTP_400_BAD_REQUEST 
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
        "This OTP is valid for 5 minutes.\n"
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
        serializer.errors,
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

    if delivery.otp != otp_input:
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


# get all transactions 
class RazorpayTransactions(views.APIView):
  permission_classes = [permissions.AllowAny]

  def get(self, request):
      try:
          # Basic Auth — Razorpay uses Key ID + Key Secret
          auth = (
              settings.RAZORPAY_KEY_ID,
              settings.RAZORPAY_KEY_SECRET
          )

          # Razorpay API URL for fetching all payments
          url = "https://api.razorpay.com/v1/payments"

          response = requests.get(url, auth=auth)
          data = response.json()

          return Response(data)

      except Exception as e:
          return Response({"error": str(e)}, status=400)

# @login_required
def initiate_payment(request):
    """Step 1: Create a Razorpay order and archive it with 'created' status."""

    amount_inr = 499.00  # replace with your actual amount logic

    rz_order = create_razorpay_order(amount_inr, notes={"user_id": str(request.user.id)})

    # Archive the order immediately
    PaymentArchive.objects.create(
        user=request.user,
        razorpay_order_id=rz_order["id"],
        amount=rz_order["amount"],
        currency=rz_order["currency"],
        status=PaymentArchive.Status.CREATED,
        raw_response=rz_order,
    )

    return JsonResponse({
        "order_id": rz_order["id"],
        "amount":   rz_order["amount"],
        "currency": rz_order["currency"],
        "key":      settings.RAZORPAY_KEY_ID,
    })


# Razorpay posts here; protect via signature check instead
# @csrf_exempt
def payment_callback(request):
    """Step 2: Called after user completes payment on the frontend."""

    if request.method != "POST":
        return JsonResponse(
          {"error": "Method not allowed"},
          status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    data = request.POST
    order_id = data.get("razorpay_order_id")
    payment_id = data.get("razorpay_payment_id")
    signature = data.get("razorpay_signature")

    try:
        archive = PaymentArchive.objects.get(razorpay_order_id=order_id)
    except PaymentArchive.DoesNotExist:
        return JsonResponse({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

    # Verify signature first — never trust unverified callbacks
    if not verify_signature(order_id, payment_id, signature):
        archive.status = PaymentArchive.Status.FAILED
        archive.save(update_fields=["status"])
        return JsonResponse(
          {"error": "Invalid signature"},
          status=status.HTTP_400_BAD_REQUEST
        )

    # Fetch full payment details from Razorpay API
    payment_data = fetch_payment(payment_id)

    # Update and archive
    archive.razorpay_payment_id = payment_id
    archive.razorpay_signature = signature
    archive.status = payment_data.get("status", PaymentArchive.Status.CAPTURED)
    archive.method = payment_data.get("method", "")
    archive.email = payment_data.get("email", "")
    archive.contact = payment_data.get("contact", "")
    archive.raw_response = payment_data
    archive.captured_at = timezone.now()
    archive.save()

    return JsonResponse({"status": "success", "payment_id": payment_id})
