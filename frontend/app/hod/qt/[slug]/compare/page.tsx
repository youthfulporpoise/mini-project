"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  AlertTriangle,
  Package,
  FileText,
  Info,
} from "lucide-react";

import {
  acceptedQuotations,
  fetchQuotations,
  fetchResponses,
  performQuotationApproval,
} from "@/app/utility/api";

// ─── Types ──────────────────────────────────────────────────────────────────
interface QuotationItem {
  id: number;
  name: string;
  description: string;
  amount: number;
}

interface Quotation {
  id: number;
  title: string;
  department: string;
  items: QuotationItem[];
}

interface ResponseItem {
  id: number;
  item: number;
  brand_model: string;
  delivery_period: string;
  unit_price: number;
  description: string;
}

interface RawVendorResponse {
  id: number;
  quotation: number;
  vendor: number;
  response_items: ResponseItem[];
  status?: "PENDING_REVIEW" | "ACCEPTED" | "REJECTED";
}

interface ProcessedResponse extends RawVendorResponse {
  total_amount: number;
  max_delivery_days: number;
}

// ─── Page Component ─────────────────────────────────────────────────────────
export default function VendorComparisonPage() {
  const router = useRouter();
  const params = useParams();
  const quotationId = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [responses, setResponses] = useState<ProcessedResponse[]>([]);
  const [quotationInfo, setQuotationInfo] = useState({
    budget: 0,
    title: "",
    department: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [approved, setApproved] = useState(false);

  // Modal State for Audit Compliance
  const [justificationModal, setJustificationModal] = useState<{
    isOpen: boolean;
    response: ProcessedResponse | null;
  }>({ isOpen: false, response: null });
  const [justificationText, setJustificationText] = useState("");

  useEffect(() => {
    if (!quotationId) return;

    const loadAndProcessData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [allQuotations, allResponses, acceptedQuotationsList] =
          await Promise.all([
            fetchQuotations(),
            fetchResponses(),
            acceptedQuotations(),
          ]);

        if (!allQuotations || !allResponses) {
          throw new Error("Failed to fetch data from the server.");
        }

        // Check if this quotation has already been accepted in the backend
        const alreadyAccepted = acceptedQuotationsList.filter(
          (qt: any) => String(qt.quotation) === String(quotationId) || String(qt.id) === String(quotationId)
        );
        if (alreadyAccepted.length > 0) {
          setApproved(true);
        }

        const currentQuote = allQuotations.find(
          (q: Quotation) => String(q.id) === String(quotationId),
        );

        if (!currentQuote) {
          setError("Quotation not found.");
          setIsLoading(false);
          return;
        }

        const requestedBudget =
          currentQuote.items?.reduce(
            (sum: number, item: QuotationItem) => sum + (item.amount || 0),
            0,
          ) || 0;

        setQuotationInfo({
          title: currentQuote.title,
          budget: requestedBudget,
          department: currentQuote.department,
        });

        const relevantResponses = allResponses.filter(
          (r: RawVendorResponse) => String(r.quotation) === String(quotationId),
        );

        const processedData: ProcessedResponse[] = relevantResponses.map(
          (res: RawVendorResponse) => {
            const totalAmount =
              res.response_items?.reduce(
                (sum, item) => sum + (item.unit_price || 0),
                0,
              ) || 0;

            const maxDeliveryDays = Math.max(
              ...(res.response_items?.map(
                (item) => parseInt(item.delivery_period?.split(" ")[0]) || 0,
              ) || [0]),
            );

            // If the backend returned an accepted list matching this response ID, mark it locally
            const isThisResponseAccepted = alreadyAccepted.some((acc: any) => String(acc.response) === String(res.id));

            return {
              ...res,
              total_amount: totalAmount,
              max_delivery_days: maxDeliveryDays,
              status: isThisResponseAccepted ? "ACCEPTED" : (res.status || "PENDING_REVIEW"),
            };
          },
        );

        const sortedResponses = processedData.sort(
          (a, b) => a.total_amount - b.total_amount,
        );

        setResponses(sortedResponses);
      } catch (err) {
        console.error("Error loading comparison data:", err);
        setError("An error occurred while preparing the comparison matrix.");
      } finally {
        setIsLoading(false);
      }
    };

    loadAndProcessData();
  }, [quotationId]);

  const handleAcceptBid = async (
    response: ProcessedResponse,
    isL1: boolean,
  ) => {
    if (!isL1) {
      setJustificationModal({ isOpen: true, response });
      return;
    }
    await processApproval(response.id, "L1 Bid Accepted");
  };

  const processApproval = async (responseId: number, reason: string) => {
    setIsProcessing(true);
    try {
      console.log(`Approving Response ${responseId} with reason: ${reason}`);

      // Hit your backend endpoint
      await performQuotationApproval(quotationId, responseId);

      // Optimistic UI Update
      setApproved(true);
      setResponses((prev) =>
        prev.map((res) => ({
          ...res,
          status: res.id === responseId ? "ACCEPTED" : "REJECTED",
        })),
      );
      setJustificationModal({ isOpen: false, response: null });
      setIsProcessing(false);
      
    } catch (err) {
      console.error("Failed to approve quotation", err);
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#F2F2F2] font-sans">
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-[#929090]">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#FB4D27] border-r-transparent" />
            <p className="text-[13px] font-medium">
              Processing bids & generating matrix...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#F2F2F2] font-sans">
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="flex max-w-[400px] flex-col items-center gap-3 rounded-[14px] border border-red-500/20 bg-white p-8 text-center shadow-sm">
            <XCircle className="h-10 w-10 text-[#c53030]" />
            <h3 className="text-[16px] font-bold text-[#111110]">
              Unable to load data
            </h3>
            <p className="text-[13px] text-[#929090]">{error}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 rounded-[9px] bg-[#111110] px-6 py-2.5 text-[13.5px] font-semibold text-white hover:bg-[#FB4D27]"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // A single reliable boolean for the entire page's state
  const isAlreadyApproved = approved || responses.some((r) => r.status === "ACCEPTED");

  return (
    <div className="flex min-h-screen bg-[#F2F2F2] font-sans">
      <main className="flex-1 px-[clamp(20px,4vw,40px)] py-[clamp(24px,4vw,40px)] transition-[margin-left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] max-md:ml-[68px]">
        <div className="mx-auto max-w-[1400px]">
          <button
            onClick={() => router.back()}
            className="mb-6 inline-flex items-center gap-2 text-[13.5px] font-semibold text-[#929090] transition-colors hover:text-[#111110]"
          >
            <ArrowLeft size={16} /> Back to Request
          </button>

          {/* ── Quotation Header ── */}
          <div className="mb-8 flex flex-wrap items-end justify-between gap-6 rounded-[14px] border border-black/[0.06] bg-white p-6 shadow-sm">
            <div>
              <div className="mb-2 flex items-center gap-2.5 text-[#111110]">
                <FileText size={20} className="text-[#FB4D27]" />
                <h1 className="text-[20px] font-bold tracking-[-0.02em]">
                  Bid Comparison Matrix
                </h1>
              </div>
              <p className="text-[14px] font-medium text-[#4C433F]">
                {quotationInfo.title}{" "}
                <span className="font-mono text-[#929090]">
                  (Req #{quotationId})
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                Allocated Budget
              </p>
              <p className="font-mono text-[24px] font-bold text-[#111110]">
                ₹{quotationInfo.budget.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* ── APPROVED BANNER ── */}
          {isAlreadyApproved && (
            <div className="mb-8 flex items-center gap-4 rounded-[14px] border border-[#28CA41]/30 bg-[#28CA41]/10 p-6 shadow-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#28CA41]/20">
                <CheckCircle2 size={24} className="text-[#1a8c30]" />
              </div>
              <div>
                <h2 className="text-[18px] font-bold tracking-[-0.01em] text-[#1a8c30]">
                  Quotation Approved
                </h2>
                <p className="text-[13.5px] text-[#1a8c30]/80">
                  You have successfully selected a vendor. This quotation has
                  been forwarded to the Accountant for final compliance
                  verification.
                </p>
              </div>
            </div>
          )}

          {/* ── Responses Grid ── */}
          {responses.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[14px] border border-black/[0.06] bg-white py-16 text-center shadow-sm">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F2F2F2] text-[#D3D6DA]">
                <Trophy size={24} />
              </div>
              <h3 className="text-[16px] font-bold text-[#111110]">
                No Bids Submitted
              </h3>
              <p className="mt-1 text-[13.5px] text-[#929090]">
                There are currently no vendor responses for this quotation.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {responses.map((response, index) => {
                const isL1 = index === 0;
                const rankLabel = `L${index + 1}`;
                const isOverBudget =
                  response.total_amount > quotationInfo.budget;

                return (
                  <div
                    key={response.id}
                    className={`relative flex flex-col overflow-hidden rounded-[14px] border transition-all duration-300 ${
                      response.status === "ACCEPTED"
                        ? "border-[#28CA41] shadow-[0_8px_24px_rgba(40,202,65,0.15)] ring-1 ring-[#28CA41]"
                        : response.status === "REJECTED"
                          ? "border-black/[0.04] bg-black/[0.02] opacity-75"
                          : isL1
                            ? "border-[#FB4D27]/40 bg-white shadow-md hover:border-[#FB4D27] hover:shadow-lg"
                            : "border-black/[0.08] bg-white shadow-sm hover:shadow-md"
                    }`}
                  >
                    {/* Rank Header */}
                    <div
                      className={`flex items-center justify-between px-5 py-3 ${
                        response.status === "ACCEPTED"
                          ? "bg-[#28CA41]/10"
                          : isL1
                            ? "bg-[#FB4D27]/10"
                            : "bg-[#F2F2F2]"
                      }`}
                    >
                      <div
                        className={`flex items-center gap-2 font-mono text-[14px] font-bold ${
                          response.status === "ACCEPTED"
                            ? "text-[#1a8c30]"
                            : isL1
                              ? "text-[#FB4D27]"
                              : "text-[#929090]"
                        }`}
                      >
                        {isL1 && response.status !== "ACCEPTED" && (
                          <Trophy size={16} />
                        )}
                        {response.status === "ACCEPTED" && (
                          <CheckCircle2 size={16} />
                        )}
                        {rankLabel} BIDDER
                      </div>
                      {isOverBudget && quotationInfo.budget > 0 && (
                        <span className="flex items-center gap-1 rounded-full bg-[#FF5F57]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.04em] text-[#c53030]">
                          <AlertTriangle size={12} /> Over Budget
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      {/* Vendor Identification */}
                      <div className="mb-6">
                        <p className="text-[12px] font-medium text-[#929090]">
                          Vendor Identification
                        </p>
                        <h3 className="text-[18px] font-bold text-[#111110]">
                          Vendor ID: {response.vendor}
                        </h3>
                      </div>

                      {/* Financial & Delivery Summary */}
                      <div className="mb-6 rounded-[10px] border border-black/5 bg-[#FAFAFA] p-4">
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                          Total Quotation
                        </p>
                        <p
                          className={`font-mono text-[28px] font-bold tracking-tight ${isOverBudget && quotationInfo.budget > 0 ? "text-[#c53030]" : "text-[#111110]"}`}
                        >
                          ₹{response.total_amount.toLocaleString("en-IN")}
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-[13px] font-medium text-[#4C433F]">
                          <Package size={15} className="text-[#929090]" />
                          Delivers in{" "}
                          <span className="font-bold text-[#111110]">
                            {response.max_delivery_days} Days
                          </span>
                        </div>
                      </div>

                      {/* Line Items Breakdown */}
                      <div className="mb-8 flex-1">
                        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                          Included Items ({response.response_items?.length || 0}
                          )
                        </p>
                        <ul className="flex flex-col gap-3">
                          {response.response_items?.map((item) => (
                            <li
                              key={item.id}
                              className="flex flex-col border-b border-black/[0.04] pb-3 text-[13px]"
                            >
                              <div className="flex justify-between font-semibold text-[#111110]">
                                <span>{item.brand_model}</span>
                                <span className="font-mono text-[#929090]">
                                  ₹{(item.unit_price || 0).toLocaleString()}
                                </span>
                              </div>
                              {item.description &&
                                item.description !== "n/a" && (
                                  <div className="mt-1 flex items-start gap-1.5 text-[11px] text-[#929090]">
                                    <Info
                                      size={12}
                                      className="mt-[2px] shrink-0"
                                    />
                                    <span>{item.description}</span>
                                  </div>
                                )}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Approval Actions - HIDE IF ANY BID HAS BEEN APPROVED */}
                      {!isAlreadyApproved && (
                        <button
                          onClick={() => handleAcceptBid(response, isL1)}
                          disabled={isProcessing}
                          className={`flex w-full items-center justify-center gap-2 rounded-[9px] py-3 text-[14px] font-semibold transition-all disabled:opacity-50 ${
                            isL1
                              ? "bg-[#111110] text-white hover:-translate-y-[1px] hover:bg-[#FB4D27] hover:shadow-[0_4px_12px_rgba(251,77,39,0.3)]"
                              : "border-[1.5px] border-black/10 bg-white text-[#111110] hover:border-[#111110] hover:bg-[#F2F2F2]"
                          }`}
                        >
                          {isProcessing
                            ? "Processing..."
                            : isL1
                              ? "Accept L1 Quotation"
                              : "Select this Bid"}
                        </button>
                      )}

                      {response.status === "ACCEPTED" && (
                        <div className="flex w-full items-center justify-center gap-2 rounded-[9px] bg-[#28CA41]/10 py-3 text-[14px] font-bold text-[#1a8c30]">
                          <CheckCircle2 size={18} /> Officially Approved
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── Audit Justification Modal ── */}
      {justificationModal.isOpen && justificationModal.response && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111110]/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[500px] overflow-hidden rounded-[16px] bg-white shadow-2xl">
            <div className="bg-[#FFBD2E]/15 p-6 text-[#9a6e00]">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle size={20} />
                <h3 className="text-[16px] font-bold">
                  Audit Compliance Notice
                </h3>
              </div>
              <p className="text-[13px] font-medium leading-relaxed">
                You are bypassing the L1 (Lowest) Bidder. Government procurement
                protocols require a valid justification for selecting a
                higher-priced quotation.
              </p>
            </div>

            <div className="p-6">
              <p className="mb-4 text-[14px] font-medium text-[#111110]">
                You are selecting Vendor{" "}
                <span className="font-bold">
                  #{justificationModal.response.vendor}
                </span>{" "}
                at{" "}
                <span className="font-mono font-bold text-[#FB4D27]">
                  ₹
                  {justificationModal.response.total_amount.toLocaleString(
                    "en-IN",
                  )}
                </span>
                .
              </p>

              <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                Reason for Selection
              </label>
              <textarea
                rows={4}
                value={justificationText}
                onChange={(e) => setJustificationText(e.target.value)}
                placeholder="e.g., L1 vendor cannot meet the required delivery timeline..."
                className="w-full resize-none rounded-[10px] border-[1.5px] border-black/10 bg-[#F2F2F2] p-3 text-[14px] text-[#111110] outline-none transition-all focus:border-[#FB4D27] focus:bg-white"
              />

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setJustificationModal({ isOpen: false, response: null });
                    setJustificationText("");
                  }}
                  className="rounded-[9px] px-5 py-2.5 text-[13.5px] font-semibold text-[#929090] transition-colors hover:bg-[#F2F2F2] hover:text-[#111110]"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    processApproval(
                      justificationModal.response!.id,
                      justificationText,
                    )
                  }
                  disabled={
                    justificationText.trim().length < 10 || isProcessing
                  }
                  className="inline-flex items-center gap-2 rounded-[9px] bg-[#111110] px-6 py-2.5 text-[13.5px] font-semibold text-white transition-all hover:bg-[#FB4D27] disabled:opacity-50"
                >
                  Confirm & Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}