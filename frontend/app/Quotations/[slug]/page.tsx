"use client";
import { useEffect, useState } from "react";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/app/components/Sidebar";
import { parseISO, format } from "date-fns";
import { QuotationItems, Quotation, VendorResponseItem } from "../../utility/index";
import { BACKEND_URL } from "@/app/utility";
import axios from "axios";

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

const formatDate = (dateString: string) => {
  return format(parseISO(dateString), "MMMM dd, yyyy");
};

const getQuotationTotal = (items: { amount: number }[]) => {
  return items.reduce((sum, item) => sum + (item.amount || 0), 0);
};
export default function Page() {
  const params = useParams();
  const router = useRouter();
  const [quotation, setQuotation] = useState<Quotation>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vendorResponses, setVendorResponses] = useState<VendorResponseItem[]>(
    [],
  );

  useEffect(() => {
    const fetchQuotation = async () => {
      if (!params.slug) return;
      console.log(params.slug);
      try {
        setLoading(true);
        const response = await axios.get(`${BACKEND_URL}/qt/${params.slug}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = response.data;

        const backendData: Quotation = {
          id: data.id,
          category: data.category,
          quotationTitle: data.title,
          description: data.description,
          department: data.department,
          submissionDeadline: data.submission_deadline,
          deliveryPeriod: data.delivery_period,
          status: data.status,
          items: data.items.map(
            (item: {
              id: string;
              name: string;
              description: string;
              amount: number;
            }) => ({
              id: item.id,
              itemName: item.name,
              itemDescription: item.description,
              amount: item.amount,
            }),
          ),
        };

        const data2 = await fetch(`${BACKEND_URL}/responses`);
        const res = await data2.json();
        const submittedResponseData = res.map(
          (eachResponse: {
            id: string;
            quotation: string;
            vendor: string;
            response_items: [];
          }) => ({
            responseId: eachResponse.id,
            quotationId: eachResponse.quotation,
            vendorId: eachResponse.vendor,
            responseItems: eachResponse.response_items.map(
              (eachItem: {
                item: string;
                brand_model: string;
                unit_price: number;
                description: string;
                delivery_period: string;
              }) => ({
                itemId: eachItem.item,
                brandModel: eachItem.brand_model,
                unitPrice: eachItem.unit_price,
                description: eachItem.description,
                deliveryPeriod: eachItem.delivery_period,
              }),
            ),
          }),
        );

        const quotationResponses = submittedResponseData.filter(
          (each) => each.quotationId == params.slug,
        );

        setVendorResponses(quotationResponses);

        setQuotation(backendData);
        setError(null);
      } catch (err) {
        console.error("Error fetching quotation:", err);
        setError("Failed to load quotation");
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex items-center justify-center w-full h-screen">
          <div className="text-lg text-gray-600">Loading quotation...</div>
        </div>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex flex-col items-center justify-center w-full h-screen">
          <div className="text-lg text-red-600 mb-4">
            {error || "Quotation not found"}
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(quotation.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-5 w-full overflow-y-scroll h-screen">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-[80vw]">
          <div key={quotation.id}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Quotation Details - {quotation.id}
              </h3>
              <button
                onClick={() => router.back()}
                className="text-blue-600 hover:text-blue-700"
              >
                ← Back
              </button>
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
                  <p className="text-sm text-gray-600 mb-1">Number of Items</p>
                  <p className="text-base font-medium text-gray-900">
                    {quotation.items.length}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Valid Until</p>
                  <p className="text-base font-medium text-gray-900">
                    {formatDate(quotation?.submissionDeadline)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Quotation Amount</p>
                  <p className="text-xl font-bold text-gray-900">
                    ₹{getQuotationTotal(quotation.items)}
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
            {/* <div className="mt-6 flex gap-3">
              {quotation.status === 0 && (
                <>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Approve Quotation
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Reject Quotation
                  </button>
                </>
              )}
            </div> */}
          </div>
        </div>

        {/* Items Grid Section */}
        {quotation.items && quotation.items.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-[80vw] mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Items ({quotation.items.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quotation.items.map((item: QuotationItems, index: number) => (
                <div
                  key={item.id || index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-gray-500">
                      Item #{index + 1}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      ₹{item.amount || 0}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    {item.itemName || "N/A"}
                  </h4>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    {item.itemDescription || "N/A"}
                  </h4>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      Unit Price:{" "}
                      <span className="font-medium">₹{item.amount || 0}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹
                  {quotation.items.reduce(
                    (sum: number, item: QuotationItems) =>
                      sum + (item.amount || 0),
                    0,
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Display Submitted Response by vendors  */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-[80vw] mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Vendor Responses ({vendorResponses.length})
          </h3>

          <div className="space-y-6">
            {vendorResponses.map((response, responseIndex) => {
              const totalAmount = response.responseItems.reduce(
                (sum, item) => sum + item.unitPrice,
                0,
              );

              return (
                <div
                  key={response.responseId}
                  className="border border-gray-300 rounded-lg overflow-hidden"
                >
                  {/* Vendor Header */}
                  <div className="bg-blue-50 p-4 border-b border-gray-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Vendor ID: {response.vendorId}
                        </h4>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total Quote</p>
                        <p className="text-2xl font-bold text-green-600">
                          ₹{totalAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Items Grid */}
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {response.responseItems.map((item, itemIndex) => (
                        <div
                          key={item.itemId}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-xs font-semibold text-gray-500">
                              Item #{itemIndex + 1}
                            </span>
                            <span className="text-lg font-bold text-gray-900">
                              ₹{item.unitPrice.toLocaleString()}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-gray-600">
                                Brand/Model
                              </p>
                              <p className="text-sm font-semibold text-blue-600">
                                {item.brandModel}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-600">
                                Delivery Period
                              </p>
                              <p className="text-sm font-medium text-gray-900">
                                {item.deliveryPeriod}
                              </p>
                            </div>

                            {item.description && (
                              <div>
                                <p className="text-xs text-gray-600">
                                  Description
                                </p>
                                <p className="text-xs text-gray-700 line-clamp-3">
                                  {item.description}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
