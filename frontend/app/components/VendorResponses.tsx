"use client";

import { useEffect, useState } from "react";
import { Users, Info, Package, GitCompare } from "lucide-react";
import { fetchResponses } from "../utility/api";

// Replace with your actual types
import { VendorResponseItem } from "../utility/index";
import { useRouter } from "next/navigation";

export function VendorResponses({ quotationId }: { quotationId?: string }) {
  const router = useRouter();
  const [responses, setResponses] = useState<VendorResponseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadResponses = async () => {
      try {
        setLoading(true);
        // Fetch all, then filter (or modify API to fetch by ID directly)
        const res = await fetchResponses();

        const mappedData = res.map((eachResponse: any) => ({
          responseId: eachResponse.id,
          quotationId: eachResponse.quotation,
          vendorId: eachResponse.vendor,
          responseItems: eachResponse.response_items.map((eachItem: any) => ({
            itemId: eachItem.item,
            brandModel: eachItem.brand_model,
            unitPrice: eachItem.unit_price,
            description: eachItem.description,
            deliveryPeriod: eachItem.delivery_period,
          })),
        }));

        const finalResponses = quotationId
          ? mappedData.filter((r: any) => String(r.quotationId) === quotationId)
          : mappedData;
        setResponses(finalResponses);
      } catch (err) {
        console.error("Error fetching vendor responses:", err);
        setError("Failed to load vendor responses.");
      } finally {
        setLoading(false);
      }
    };

    loadResponses();
  }, [quotationId]);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-[14px] border border-black/[0.06] bg-white">
        <div className="flex flex-col items-center gap-3 text-[#929090]">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#5B7FA6] border-r-transparent" />
          <p className="text-[13px] font-medium">Loading vendor responses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-32 items-center justify-center rounded-[14px] border border-red-500/20 bg-red-500/5">
        <p className="text-[14px] font-medium text-[#c53030]">{error}</p>
      </div>
    );
  }

  if (responses.length === 0 ) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[14px] border border-black/[0.06] bg-white py-14 text-center">
        <div className="mb-[14px] flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-[#F2F2F2]">
          <Users size={22} color="#D3D6DA" />
        </div>
        <h3 className="mb-1 text-[15px] font-semibold tracking-[-0.01em] text-[#111110]">
          No responses yet
        </h3>
        <p className="text-[13px] text-[#929090]">
          Vendors have not submitted quotations for this request yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[14px] border border-black/[0.06] bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-[18px] font-bold tracking-[-0.02em] text-[#111110]">
          Vendor Responses{" "}
          <span className="text-[#929090]">({responses.length})</span>
        </h3>

        {/* COMPARE BIDS BUTTON */}
        {responses.length > 0 && (
          <button
            onClick={() => router.push(`/hod/qt/${quotationId}/compare`)}
            className="inline-flex items-center gap-2 rounded-[9px] bg-[#111110] px-5 py-2.5 text-[13.5px] font-semibold text-white transition-all hover:-translate-y-[1px] hover:bg-[#FB4D27] hover:shadow-[0_4px_12px_rgba(251,77,39,0.3)]"
          >
            <GitCompare size={16} />
            Compare Bids
          </button>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {responses.map((response) => {
          const totalAmount = response.responseItems.reduce(
            (sum, item) => sum + (item.unitPrice || 0),
            0,
          );

          return (
            <div
              key={response.responseId}
              className="overflow-hidden rounded-[12px] border border-black/[0.08]"
            >
              {/* Vendor Header */}
              <div className="flex items-center justify-between border-b border-black/[0.06] bg-[#F2F2F2] px-5 py-4">
                <div>
                  <h4 className="text-[15px] font-bold text-[#111110]">
                    Vendor ID:{" "}
                    <span className="font-mono text-[#FB4D27]">
                      {response.vendorId}
                    </span>
                  </h4>
                  <p className="font-mono text-[11px] text-[#929090]">
                    Response #{response.responseId}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                    Total Quote
                  </p>
                  <p className="font-mono text-[20px] font-bold text-[#28CA41]">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-white p-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {response.responseItems.map((item, itemIndex) => {
                    // Extract days if format is "30 00:00:00"
                    const days =
                      parseInt(item.deliveryPeriod?.split(" ")[0]) || 0;

                    return (
                      <div
                        key={item.itemId || itemIndex}
                        className="rounded-[10px] border border-black/[0.06] p-4 transition-colors hover:border-[#5B7FA6]/30 hover:bg-[#F9FAFB]"
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <span className="font-mono text-[11px] font-semibold tracking-[0.06em] text-[#929090]">
                            ITEM {String(itemIndex + 1).padStart(2, "0")}
                          </span>
                          <span className="font-mono text-[14px] font-bold text-[#111110]">
                            ₹{(item.unitPrice || 0).toLocaleString("en-IN")}
                          </span>
                        </div>

                        <div className="mb-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                            Brand / Model
                          </p>
                          <p className="text-[14px] font-semibold text-[#111110]">
                            {item.brandModel}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2 border-t border-black/[0.04] pt-3">
                          <div className="flex items-center gap-2 text-[12px] text-[#4C433F]">
                            <Package size={14} className="text-[#929090]" />
                            <span className="font-medium">
                              {days} days
                            </span>{" "}
                            delivery
                          </div>

                          {item.description && item.description !== "n/a" && (
                            <div className="flex items-start gap-2 text-[12px] text-[#4C433F]">
                              <Info
                                size={14}
                                className="mt-0.5 shrink-0 text-[#929090]"
                              />
                              <span className="line-clamp-2">
                                {item.description}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
