"use client";

import { useState, useEffect } from "react";
import {
  VendorResponseItem,
  VendorResponseItemDetail,
} from "@/app/utility/index";
import {
  Send,
  Package,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { createResponses } from "@/app/utility/api";

interface VendorResponseFormProps {
  quotationId: string;
  vendorId: number;
  quotationItems: Array<{
    id: string;
    itemName: string;
    itemDescription: string;
    amount: number;
  }>;
  setSubmittedResponse: (response: VendorResponseItem) => void;
  // NEW: Pass this from the parent if the API indicates a response already exists
  isAlreadySubmitted?: boolean;
}

// ─── Form Section Wrapper ────────────────────────────────────────────────────
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
    <div className="overflow-hidden rounded-[14px] border border-black/[0.06] bg-white shadow-sm transition-all duration-200">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-4 transition-colors hover:bg-[#F9FAFB]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5B7FA6]/10 text-[#5B7FA6]">
            {icon}
          </div>
          <div className="text-left">
            <h3 className="flex items-center gap-2 text-[15px] font-bold tracking-[-0.01em] text-[#111110]">
              {title}
              {required && <span className="text-[#FB4D27]">*</span>}
            </h3>
          </div>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#F2F2F2] text-[#929090] transition-colors hover:bg-black/5 hover:text-[#111110]">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-black/[0.06] px-6 pb-6">
          <div className="pt-6">{children}</div>
        </div>
      )}
    </div>
  );
}

// ─── Main Form Component ─────────────────────────────────────────────────────
const VendorResponseForm = ({
  quotationId,
  vendorId,
  quotationItems,
  setSubmittedResponse,
  isAlreadySubmitted = false,
}: VendorResponseFormProps) => {
  const [expandedSections, setExpandedSections] = useState({
    items: true,
  });

  const [hasSubmittedLocal, setHasSubmittedLocal] =
    useState(isAlreadySubmitted);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync prop changes if parent updates
  useEffect(() => {
    setHasSubmittedLocal(isAlreadySubmitted);
  }, [isAlreadySubmitted]);

  // Initialize response items
  const getInitialState = (): VendorResponseItem => ({
    id: uuidv4(),
    quotation: quotationId,
    vendor: vendorId,
    responseItems: quotationItems.map((item) => ({
      item: item.id,
      brandModel: "",
      unitPrice: 0,
      description: "",
      deliveryPeriod: "",
    })),
  });

  const [responseData, setResponseData] =
    useState<VendorResponseItem>(getInitialState());

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
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
      (item) =>
        item.brandModel.trim() &&
        item.unitPrice > 0 &&
        item.deliveryPeriod.trim(),
    );

    if (!isValid) {
      alert(
        "Please fill all required fields (Brand, Unit Price, and Delivery Time) before submitting.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Camel Case to Snake Case conversion for backend
      const backendData = {
        id: responseData.id,
        quotation: responseData.quotation,
        vendor: responseData.vendor,
        response_items: responseData.responseItems.map((item) => ({
          item: item.item,
          brand_model: item.brandModel,
          unit_price: item.unitPrice,
          description: item.description,
          delivery_period: item.deliveryPeriod + " 00:00:00",
        })),
      };

      await createResponses(backendData);
      setSubmittedResponse(responseData);

      // 1. Reset the form back to initial state internally
      setResponseData(getInitialState());

      // 2. Trigger the Success / Already Submitted state
      setHasSubmittedLocal(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Server response:",
          JSON.stringify(error.response?.data, null, 2),
        );
        alert("Failed to submit response. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── ALREADY SUBMITTED / SUCCESS STATE ───
  if (hasSubmittedLocal) {
    return (
      <div className="mt-6 flex w-[80vw] flex-col items-center justify-center rounded-[14px] border border-black/[0.06] bg-white p-12 text-center shadow-sm">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#28CA41]/10">
          <CheckCircle2 className="h-10 w-10 text-[#1a8c30]" />
        </div>
        <h2 className="mb-2 text-[24px] font-bold tracking-[-0.02em] text-[#111110]">
          Response Submitted!
        </h2>
        <p className="text-[14px] text-[#929090] max-w-md mx-auto">
          You have already successfully submitted your quotation response for
          this request. The institution is currently reviewing all bids.
        </p>
      </div>
    );
  }

  // Common input styles for UI consistency
  const inputClasses =
    "w-full rounded-[9px] border-[1.5px] border-black/10 bg-[#F2F2F2] px-[14px] py-[11px] text-[14px] text-[#111110] outline-none transition-all duration-200 placeholder:text-[#D3D6DA] focus:border-[#5B7FA6] focus:bg-white focus:shadow-[0_0_0_3px_rgba(91,127,166,0.15)]";
  const labelClasses =
    "mb-[7px] block text-[11.5px] font-semibold uppercase tracking-[0.07em] text-[#929090]";

  return (
    <form
      className="mt-6 w-[60vw] space-y-6 font-sans"
      onSubmit={handleSubmitResponse}
    >
      <FormSection
        title="Submit Your Quotation Response"
        icon={<Package size={20} />}
        isExpanded={expandedSections.items}
        onToggle={() => toggleSection("items")}
        required
      >
        <div className="space-y-5">
          {responseData.responseItems.map((responseItem, index) => {
            const quotationItem = quotationItems[index];
            return (
              <div
                key={responseItem.item}
                className="rounded-[12px] border border-black/10 bg-[#FAFAFA] p-5 transition-colors focus-within:border-[#5B7FA6]/30 focus-within:bg-white"
              >
                <div className="mb-4 flex flex-col gap-1 border-b border-black/[0.04] pb-3">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                    Responding to Item #{index + 1}
                  </span>
                  <h4 className="text-[15px] font-bold text-[#111110]">
                    {quotationItem?.itemName || "Unknown Item"}
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className={labelClasses}>
                      Brand/Model <span className="text-[#FB4D27]">*</span>
                    </label>
                    <input
                      type="text"
                      value={responseItem.brandModel}
                      onChange={(e) =>
                        updateResponseItem(index, "brandModel", e.target.value)
                      }
                      required
                      className={inputClasses}
                      placeholder="e.g., Bosch XYZ-123"
                    />
                  </div>

                  <div>
                    <label className={labelClasses}>
                      Delivery Time <span className="text-[#FB4D27]">*</span>
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
                      className={inputClasses}
                      placeholder="e.g., 7 days"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClasses}>
                      Unit Price (₹) <span className="text-[#FB4D27]">*</span>
                    </label>
                    <input
                      type="number"
                      value={responseItem.unitPrice || ""}
                      onChange={(e) =>
                        updateResponseItem(
                          index,
                          "unitPrice",
                          Number(e.target.value),
                        )
                      }
                      required
                      min="1"
                      className={`${inputClasses} max-w-md font-mono font-medium`}
                      placeholder="Enter Unit Price"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClasses}>
                      Description / Specifications
                    </label>
                    <textarea
                      value={responseItem.description}
                      onChange={(e) =>
                        updateResponseItem(index, "description", e.target.value)
                      }
                      rows={3}
                      className={`${inputClasses} resize-none`}
                      placeholder="Product specifications, warranty, certifications, etc."
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </FormSection>

      <div className="sticky bottom-4 z-10 rounded-[14px] border border-black/[0.06] bg-white/90 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
              Total Bid Amount
            </p>
            <p className="font-mono text-[20px] font-bold text-[#111110]">
              ₹
              {responseData.responseItems
                .reduce((sum, item) => sum + (Number(item.unitPrice) || 0), 0)
                .toLocaleString("en-IN")}
            </p>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-[9px] bg-[#111110] px-7 py-3.5 text-[14px] font-semibold text-white transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#5B7FA6] hover:shadow-[0_4px_12px_rgba(91,127,166,0.3)] active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:bg-[#111110] disabled:hover:shadow-none"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Submitting...
              </>
            ) : (
              <>
                <Send size={16} />
                Submit Response
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default VendorResponseForm;
