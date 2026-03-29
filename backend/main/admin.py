from django.contrib import admin
from main.models import PaymentArchive


@admin.register(PaymentArchive)
class PaymentArchiveAdmin(admin.ModelAdmin):
    list_display = ("razorpay_order_id", "user", "amount_inr", "status", "method", "created_at")
    list_filter = ("status", "currency", "method")
    search_fields = ("razorpay_order_id", "razorpay_payment_id", "user__email")
    readonly_fields = ("id", "raw_response", "created_at", "captured_at")
    ordering = ("-created_at",)
