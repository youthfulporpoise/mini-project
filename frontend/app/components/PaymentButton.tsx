"use client";

import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { BACKEND_URL } from "@/app/utility";

const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

export default function PaymentButton({
  quotationId,
  amount,
}: {
  quotationId: string;
  amount: number; // in rupees
}) {
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  const profile = JSON.parse(Cookies.get("userProfile") ?? "{}");

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Step 1 — load razorpay script
      const csrfToken = Cookies.get("csrftoken");
      await new Promise<void>((resolve, reject) => {
        if (document.getElementById("rzp-script")) {
          resolve();
          return;
        }
        const s = document.createElement("script");
        s.id = "rzp-script";
        s.src = "https://checkout.razorpay.com/v1/checkout.js";
        s.onload = () => resolve();
        s.onerror = () => reject();
        document.body.appendChild(s);
      });

      // Step 2 — create order from Django
      const { data } = await axios.post(
        `${BACKEND_URL}/payment/create-order/`,
        { quotation_id: quotationId, amount },
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          withCredentials: true,
        },
      );

      // Step 3 — open razorpay popup
      const options = {
        key: RAZORPAY_KEY,
        amount: data.amount,
        currency: data.currency,
        order_id: data.order_id,
        name: "QMS",
        description: `Quotation #${quotationId}`,
        prefill: {
          name: profile.name ?? "",
          email: profile.email ?? "",
        },
        theme: { color: "#2563eb" },

        // Step 4 — on success verify with Django
        handler: async (response: any) => {
          await axios.post(
            `${BACKEND_URL}/payment/verify/`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            {
              headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken,
              },
              withCredentials: true,
            },
          );
          setPaid(true);
        },
      };

      new (window as any).Razorpay(options).open();
    } catch {
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // paid state
  if (paid)
    return (
      <span className="text-xs px-3 py-1.5 rounded-full bg-green-100 text-green-700 font-medium">
        Payment successful
      </span>
    );

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
    >
      {loading ? "Processing..." : `Pay ₹${amount.toLocaleString()}`}
    </button>
  );
}
