"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const RAZORPAY_USER_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const RAZORPAY_SECRET_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET;

type Payment = {
  id: number;
  quotation: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  amount: number;
  is_verified: boolean;
  created_at: string;
};

export default function TransactionHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetch = async () => {
  //     try {
  //       const url = "";
  //       const { data } = await axios.get(url, {
  //         withCredentials: true,
  //         auth: {
  //           username: RAZORPAY_USER_ID,
  //           password: RAZORPAY_SECRET_KEY,
  //         },
  //       });
  //       setPayments(data);
  //     } catch {
  //       console.error("Failed to fetch payments");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetch();
  // }, []);

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-sm font-medium text-gray-800">
          Transaction history
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          {payments.length} total payments
        </p>
      </div>

      {/* Empty */}
      {payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-gray-500 text-sm">No transactions yet.</p>
          <p className="text-gray-400 text-xs mt-1">
            Payments will appear here once processed.
          </p>
        </div>
      ) : (
        /* Table */
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">
                  Order ID
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">
                  Payment ID
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">
                  Quotation
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">
                  Amount
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">
                  Date
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-100 hover:bg-slate-50 transition-colors"
                >
                  {/* Order ID */}
                  <td className="px-6 py-3 text-xs font-mono text-gray-600">
                    {p.razorpay_order_id || "—"}
                  </td>

                  {/* Payment ID */}
                  <td className="px-6 py-3 text-xs font-mono text-gray-600">
                    {p.razorpay_payment_id || "—"}
                  </td>

                  {/* Quotation */}
                  <td className="px-6 py-3 text-xs text-gray-600">
                    #{p.quotation}
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-3 text-xs font-medium text-gray-800">
                    ₹{(p.amount / 100).toLocaleString()}
                  </td>

                  {/* Date */}
                  <td className="px-6 py-3 text-xs text-gray-500">
                    {new Date(p.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-3">
                    {p.is_verified ? (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                        Verified
                      </span>
                    ) : (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
