"use client";
import { FileText, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import QuotationRequestForm from "../components/QuotationRequestForm";
import {  useEffect, useState } from "react";
import { BACKEND_URL } from "../utility";
import axios from "axios";
import { Quotation } from "../utility/index";
import { useQuotation } from "../context/QuotatationContext";

const getStatusConfig = (status: number) => {
  switch (status) {
    case 1:
      return {
        label: "Approved",
        color: "bg-green-100 text-green-700",
        icon: CheckCircle,
        iconColor: "text-green-600",
      };
    case 0:
      return {
        label: "Pending Review",
        color: "bg-yellow-100 text-yellow-700",
        icon: Clock,
        iconColor: "text-yellow-600",
      };
    case 2:
      return {
        label: "Rejected",
        color: "bg-red-100 text-red-700",
        icon: XCircle,
        iconColor: "text-red-600",
      };
    default:
      return {
        label: "Unknown",
        color: "bg-gray-100 text-gray-700",
        icon: FileText,
        iconColor: "text-gray-600",
      };
  }
};

export default function Page() {
  const [data, setData] = useState<Quotation[]>([]);
  const { setSelectedQuotation } = useQuotation();
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "MMMM dd, yyyy");
  };

  const getQuotations = async () => {
    try {
      const url = `${BACKEND_URL}/qt/`;
      const options = {
        headers: {
          "Content-Type": "Application/json",
        },
      };
      const response = await axios.get(url, options);
      const data = await response.data;
      setData(data);
    } catch {
      console.log("Error");
    }
  };

  useEffect(() => {
    getQuotations();
  }, []);

  const router = useRouter();

  const getQuotationTotal = (items: { amount: number }[]) => {
    return items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  return (
    <div className="flex flex-row ">
      <Sidebar />
      <div className="space-y-6 p-5 overflow-y-scroll h-screen w-[80vw] items-center">
        <QuotationRequestForm />
        {/* Quotations Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Quotation Requests
            </h3>
          </div>
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
                        {formatDate(quotation.submission_deadline)}
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
                            router.push(`Quotations/${quotation.id}`);
                            setSelectedQuotation(quotation);
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
        </div>
      </div>
    </div>
  );
}
