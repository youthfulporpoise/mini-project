"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, XCircle } from "lucide-react";
import { formatDate } from "@/app/src/utils/DateFormat";
import { getStatusConfig } from "@/app/src/utils/Status";
import { Quotation, QuotationItems } from "../utility/index";
import { fetchQuotationById } from "../utility/api";

export function QuotationDetailsById({ quotationId }: { quotationId: string }) {
  const router = useRouter();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        setLoading(true);
        const data = await fetchQuotationById(quotationId);

        setQuotation({
          id: data.id,
          category: data.category,
          quotationTitle: data.title,
          description: data.description,
          department: data.department,
          submissionDeadline: data.submission_deadline,
          deliveryPeriod: data.delivery_period,
          status: data.status,
          qtReqVerifiedAccountant: data.qt_req_verified_accountant,
          finalQtVerifiedAccountant: data.final_qt_verified_accountant,
          qtVerifiedPrincipal: data.qt_verified_principal,
          items: data.items.map((item: any) => ({
            id: item.id,
            itemName: item.name,
            itemDescription: item.description,
            amount: item.amount,
          })),
        });
      } catch (err) {
        console.error("Error fetching quotation:", err);
        setError("Failed to load quotation details.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [quotationId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-[14px] border border-black/[0.06] bg-white">
        <div className="flex flex-col items-center gap-3 text-[#929090]">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#FB4D27] border-r-transparent" />
          <p className="text-[13px] font-medium">
            Loading quotation details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-[14px] border border-red-500/20 bg-red-500/5 text-center">
        <XCircle className="mb-2 h-8 w-8 text-[#e53e3e]" />
        <p className="text-[14px] font-medium text-[#c53030]">
          {error || "Quotation not found"}
        </p>
      </div>
    );
  }

  const statusConfig = getStatusConfig(quotation.status);
  const StatusIcon = statusConfig.icon || FileText;
  const totalAmount = quotation.items.reduce(
    (sum, item) => sum + (item.amount || 0),
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Meta Info Card */}
      <div className="rounded-[14px] border border-black/[0.06] bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-[18px] font-bold tracking-[-0.02em] text-[#111110]">
            Quotation Details{" "}
            <span className="font-mono text-[#FB4D27]">#{quotation.id}</span>
          </h3>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#929090] transition-colors hover:text-[#111110]"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                Department
              </p>
              <p className="text-[14px] font-medium text-[#111110]">
                {quotation.department}
              </p>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                Description
              </p>
              <p className="text-[14px] font-medium text-[#4C433F]">
                {quotation.description}
              </p>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                Items Requested
              </p>
              <p className="text-[14px] font-medium text-[#111110]">
                {quotation.items.length}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                Valid Until
              </p>
              <p className="text-[14px] font-medium text-[#111110]">
                {formatDate(quotation.submissionDeadline)}
              </p>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                Est. Budget
              </p>
              <p className="font-mono text-[20px] font-bold text-[#111110]">
                ₹{totalAmount.toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                Status
              </p>
              <div
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.04em] ${statusConfig.color || "border-black/10 bg-black/5 text-[#111110]"}`}
              >
                <StatusIcon size={14} />
                {statusConfig.label || quotation.status}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Requested Card */}
      {quotation.items && quotation.items.length > 0 && (
        <div className="rounded-[14px] border border-black/[0.06] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-[16px] font-bold tracking-[-0.01em] text-[#111110]">
            Requested Items
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quotation.items.map((item: QuotationItems, index: number) => (
              <div
                key={item.id || index}
                className="rounded-[10px] border border-black/[0.06] bg-[#F2F2F2] p-4 transition-colors hover:border-[#FB4D27]/30 hover:bg-white"
              >
                <div className="mb-3 flex items-start justify-between">
                  <span className="font-mono text-[11px] font-semibold tracking-[0.06em] text-[#929090]">
                    ITEM {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[14px] font-bold text-[#111110]">
                    ₹{(item.amount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <h4 className="mb-1 text-[14px] font-semibold text-[#111110]">
                  {item.itemName || "N/A"}
                </h4>
                <p className="text-[12px] leading-relaxed text-[#4C433F]">
                  {item.itemDescription || "N/A"}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end border-t border-black/[0.06] pt-4">
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                Total Budget Limit
              </p>
              <p className="font-mono text-[24px] font-bold text-[#111110]">
                ₹{totalAmount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
