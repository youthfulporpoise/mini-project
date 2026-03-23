"use client";
import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import axios from "axios";
import { Quotation } from "@/app/utility/index";
import { getStatusConfig } from "@/app/src/utils/Status";
import { formatDate } from "@/app/src/utils/DateFormat";
import { BACKEND_URL } from "@/app/utility";
import PaymentButton from "@/app/components/PaymentButton";

const getQuotationTotal = (items: { amount: number }[]) => {
  return items.reduce((sum, item) => sum + (item.amount || 0), 0);
};

export default function Page() {
  const [data, setData] = useState<Quotation[]>([]);

  useEffect(() => {
    const getQuotations = async () => {
      try {
        const { data } = await axios.get(`${BACKEND_URL}/qt/`, {
          withCredentials: true,
        });

        const backendData: Quotation[] = data
          .map((d: any) => ({
            id: d.id,
            category: d.category,
            quotationTitle: d.title,
            description: d.description,
            department: d.department,
            submissionDeadline: d.submission_deadline,
            deliveryPeriod: d.delivery_period,
            status: d.status,
            qtReqVerifiedAccountant: d.qt_req_verified_accountant,
            finalQtVerifiedAccountant: d.final_qt_verified_accountant,
            qtVerifiedPrincipal: d.qt_verified_principal,
            items: d.items.map((item: any) => ({
              id: item.id,
              itemName: item.name,
              itemDescription: item.description,
              amount: item.amount,
            })),
          }))
          .filter((q: Quotation) => q.qtVerifiedPrincipal === true); // ← only show principal approved

        setData(backendData);
      } catch {
        console.error("Failed to fetch quotations");
      }
    };
    getQuotations();
  }, []);

  const router = useRouter();

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Quotation Requests for Payment
          </h3>
        </div>
        {data.length == 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-gray-500 text-sm">No pending payments.</p>
            <p className="text-gray-400 text-xs mt-1">
              Quotations approved by principal will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    Quotation ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    Department
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    Valid Until
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((quotation) => {
                  const statusConfig = getStatusConfig(quotation.status);
                  const StatusIcon = statusConfig.icon;
                  return (
                    <tr
                      key={quotation.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {quotation.id}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {quotation.department}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {quotation.description}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        ₹{getQuotationTotal(quotation.items)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(quotation?.submissionDeadline)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <StatusIcon
                            className={`w-4 h-4 ${statusConfig.iconColor}`}
                          />
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${statusConfig.color}`}
                          >
                            {statusConfig.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => {
                            router.push(`quotations/${quotation.id}`);
                          }}
                          className="text-blue-600 hover:text-blue-700 p-1"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <PaymentButton quotationId="1" amount={1000} />
    </div>
  );
}
