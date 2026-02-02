"use client";
import { useEffect, useState } from "react";
import { FileText, Clock, CheckCircle, XCircle, Send, Package, ChevronDown, ChevronUp } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/app/components/Vendor/Sidebar";
import { parseISO, format } from "date-fns";

import { BACKEND_URL } from "@/app/utility";
import axios from "axios";
import { QuotationItems , Quotation, VendorResponseItem } from "@/app/utility/index";

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



function FormSection({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
  required = false,
}: {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-blue-600">{icon}</div>
          <div className="text-left">
            <h3 className="flex items-center gap-2">
              {title}
              {required && <span className="text-red-600 text-sm">*</span>}
            </h3>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-200">
          <div className="pt-6">{children}</div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const [quotation, setQuotation] = useState<Quotation>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedSections, setExpandedSections] = useState({
    items: true,
  });

  const [responseItems, setResponseItems] = useState<VendorResponseItem[]>([]);
  const [submittedResponse, setSubmittedResponse] = useState<VendorResponseItem[] | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    const fetchQuotation = async () => {
      if (!params.slug) return;

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
            })
          ),
        };

        setQuotation(backendData);

        // Initialize response items
        const initialResponseItems = backendData.items.map((item) => ({
          id: Date.now().toString() + Math.random(),
          quotationItemId: item.id,
          itemName: item.itemName,
          brandModel: "",
          unitPrice: 0,
          specifications: "",
          deliveryTime: "",
        }));
        setResponseItems(initialResponseItems);

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

  const updateResponseItem = (
    id: string,
    field: keyof VendorResponseItem,
    value: string | number
  ) => {
    setResponseItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmitResponse = (e: React.FormEvent) => {
    e.preventDefault();

    // Save submitted response
    setSubmittedResponse(responseItems);

    // Show success message
    alert("Response submitted successfully!");
  };

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
    <div className="flex h-screen">
      <Sidebar />
      <div className="p-5 w-full overflow-y-scroll h-screen">
        {/* Quotation Details */}
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
          </div>
        </div>

        {/* Items Grid */}
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
                  <h4 className="text-sm text-gray-600 mb-2">
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
                    0
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Vendor Response Form  */}
        {!submittedResponse ? (
          <div className="space-y-4 mt-6 w-[80vw]">
            <FormSection
              title="Submit Your Quotation Response"
              icon={<Package className="w-5 h-5" />}
              isExpanded={expandedSections.items}
              onToggle={() => toggleSection("items")}
              required
            >
              <div className="space-y-6">
                {responseItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="border border-gray-300 rounded-lg p-4 bg-slate-50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">
                        Item #{index + 1}: {item.itemName}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2">
                          Brand/Model <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={item.brandModel}
                          onChange={(e) =>
                            updateResponseItem(item.id, "brandModel", e.target.value)
                          }
                          required
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          placeholder="e.g., Bosch XYZ-123"
                        />
                      </div>

                      <div>
                        <label className="block mb-2">
                          Unit Price (₹) <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateResponseItem(
                              item.id,
                              "unitPrice",
                              Number(e.target.value)
                            )
                          }
                          required
                          min="0"
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block mb-2">
                          Delivery Time <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={item.deliveryTime}
                          onChange={(e) =>
                            updateResponseItem(item.id, "deliveryTime", e.target.value)
                          }
                          required
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                          placeholder="e.g., 7-10 days"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block mb-2">Specifications</label>
                        <textarea
                          value={item.specifications}
                          onChange={(e) =>
                            updateResponseItem(
                              item.id,
                              "specifications",
                              e.target.value
                            )
                          }
                          rows={3}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                          placeholder="Product specifications, warranty, certifications, etc."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </FormSection>

            <div className="bg-white rounded-lg shadow-lg p-6 sticky ">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmitResponse}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Submit Quotation Response
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Display Submitted Response Data  */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-[80vw] mt-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Your Submitted Response
              </h3>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Submitted</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {submittedResponse.map((item, index) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 bg-slate-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-gray-500">
                      Item #{index + 1}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      ₹{item.unitPrice.toLocaleString()}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-gray-900 mb-1">
                    {item.itemName}
                  </h4>
                  <p className="text-sm text-blue-600 mb-2">{item.brandModel}</p>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Delivery:</span> {item.deliveryTime}
                    </p>
                    {item.specifications && (
                      <p className="text-xs mt-2">{item.specifications}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Quote Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹
                  {submittedResponse
                    .reduce((sum, item) => sum + item.unitPrice, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}