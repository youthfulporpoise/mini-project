"use client";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { quotations } from "@/app/SampleData";
import { useParams } from "next/navigation";
import { Sidebar } from "@/app/components/Sidebar";
import { useQuotation } from "@/app/context/QuotatationContext";

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
  const context = useQuotation();
  const quotation = context?.selectedQuotation;
  console.log(quotation);
  const searchParams = useParams();
  if (!searchParams) return null;
  const currentQuotation = searchParams.slug;
  const statusConfig = getStatusConfig(quotation.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="flex">
      <Sidebar />
      <div className="m-5">
        {currentQuotation && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-[80vw]">
            {quotation && (
              <div key={quotation.id}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Quotation Details - {quotation.id}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Department</p>
                      <p className="text-base font-medium text-gray-900">
                        {quotation.department}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Description</p>
                      <p className="text-base font-medium text-gray-900">
                        {quotation.description}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Number of Items
                      </p>
                      <p className="text-base font-medium text-gray-900">
                        {quotation.items.length}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Request Date</p>
                      <p className="text-base font-medium text-gray-900">
                        {quotation.requestDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Valid Until</p>
                      <p className="text-base font-medium text-gray-900">
                        {quotation.validUntil}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Quotation Amount
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {quotation.amount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <div className="flex items-center gap-3">
                        <StatusIcon
                          className={`w-6 h-6 ${statusConfig.iconColor}`}
                        />
                        <span
                          className={`px-3 py-1 text-sm rounded-full ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  {quotation.status === "pending" && (
                    <>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Approve Quotation
                      </button>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Reject Quotation
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
