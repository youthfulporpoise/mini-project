import {  useState } from "react";
import { VendorResponseItem, VendorResponseItemDetail } from "../utility/index";
import { Send, Package, ChevronDown, ChevronUp } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { BACKEND_URL } from "../utility";
import axios from "axios";

interface VendorResponseFormProps {
  quotationId: string;
  vendorId: string;
  quotationItems: Array<{
    id: string;
    itemName: string;
    itemDescription: string;
    amount: number;
  }>;
  setSubmittedResponse: (response: VendorResponseItem) => void;
}

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

const VendorResponseForm = ({
  quotationId,
  vendorId,
  quotationItems,
  setSubmittedResponse,
}: VendorResponseFormProps) => {
  const [expandedSections, setExpandedSections] = useState({
    items: true,
  });

  // Initialize response items according to your format
  const [responseData, setResponseData] = useState<VendorResponseItem>({
    id: uuidv4(),
    quotation: quotationId,
    vendor: vendorId,
    responseItems: quotationItems.map((item) => ({
      item: item.id, // Reference to quotation item ID
      brandModel: "",
      unitPrice: 0,
      description: "",
      deliveryPeriod: "",
    })),
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateResponseItem = (
    index: number,
    field: keyof VendorResponseItemDetail,
    value: string | number,
  ) => {
    setResponseData((prev) => ({
      ...prev,
      responseItems: prev.responseItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that all required fields are filled
    const isValid = responseData.responseItems.every(
      (item) => item.brandModel && item.unitPrice > 0 && item.deliveryPeriod,
    );

    if (!isValid) {
      alert("Please fill all required fields");
      return;
    }

    try {
      // Camel Case to Snake Case conversion
      const backendData = {
        id: responseData.id,
        quotation: responseData.quotation,
        vendor: responseData.vendor,
        response_items: responseData.responseItems.map((item) => ({
          item: item.item,
          brand_model: item.brandModel,
          unit_price: item.unitPrice,
          description: item.description,
          delivery_period: item.deliveryPeriod,
        })),
      };

      const options = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const response = await axios.post(
        `${BACKEND_URL}/responses.json`,
        backendData,
        options,
      );
      console.log("Response:", response.data);

      setTimeout(() => {
        // Reset sections to expanded
        setExpandedSections({
          items: true,
        });
      }, 3000);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to submit quotation. Please try again.");
    }

    // Update parent component's state
    setSubmittedResponse(responseData);
    console.log(responseData);
    // Show success message
    alert("Response submitted successfully!");
  };





  return (
    <div className="space-y-4 mt-6 w-[80vw]">
      <FormSection
        title="Submit Your Quotation Response"
        icon={<Package className="w-5 h-5" />}
        isExpanded={expandedSections.items}
        onToggle={() => toggleSection("items")}
        required
      >
        <div className="space-y-6">
          {responseData.responseItems.map((responseItem, index) => {
            const quotationItem = quotationItems[index];
            return (
              <div
                key={responseItem.item}
                className="border border-gray-300 rounded-lg p-4 bg-slate-50"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">
                    Item #{index + 1}: {quotationItem.itemName}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2">
                      Brand/Model <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={responseItem.brandModel}
                      onChange={(e) =>
                        updateResponseItem(index, "brandModel", e.target.value)
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
                      value={responseItem.unitPrice}
                      onChange={(e) =>
                        updateResponseItem(
                          index,
                          "unitPrice",
                          Number(e.target.value),
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
                      value={responseItem.deliveryPeriod}
                      onChange={(e) =>
                        updateResponseItem(
                          index,
                          "deliveryPeriod",
                          e.target.value,
                        )
                      }
                      required
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="e.g., 7-10 days"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-2">
                      Description/Specifications
                    </label>
                    <textarea
                      value={responseItem.description}
                      onChange={(e) =>
                        updateResponseItem(index, "description", e.target.value)
                      }
                      rows={3}
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                      placeholder="Product specifications, warranty, certifications, etc."
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </FormSection>

      <div className="bg-white rounded-lg shadow-lg p-6 sticky">
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
  );
};

export default VendorResponseForm;
