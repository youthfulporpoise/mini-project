"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  FileText,
  Clock,
  Trophy,
} from "lucide-react";
import {
  acceptedQuotations,
  fetchQuotations,
  fetchResponses,
  updateQuotationById,
} from "../utility/api"; // Added this import

// Extended interface to hold the new bid data
interface PrincipalQuotation {
  id: string | number;
  category: string;
  quotationTitle: string;
  description: string;
  department: string;
  status: string;
  qtReqVerifiedAccountant: boolean;
  finalQtVerifiedAccountant: boolean;
  qtVerifiedPrincipal: boolean;
  items: any[];
  winningBidAmount: number;
  winningVendorId: string | number | null;
}

export default function PrincipalDashboard() {
  const [pendingRequests, setPendingRequests] = useState<PrincipalQuotation[]>(
    [],
  );
  const [processedRequests, setProcessedRequests] = useState<
    PrincipalQuotation[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Fetch User Profile from Cookies
    try {
      const cookieData = Cookies.get("userProfile");
      if (cookieData) {
        setUserProfile(JSON.parse(decodeURIComponent(cookieData)));
      }
    } catch (e) {
      console.error("Failed to parse user profile cookie", e);
    }

    // 2. Fetch Data (Quotations + Accepted List + Responses)
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [qtRes, acceptedRes, responsesRes] = await Promise.all([
          fetchQuotations(),
          acceptedQuotations(),
          fetchResponses(),
        ]);

        const rawQuotations = qtRes;
        const acceptedRecords = Array.isArray(acceptedRes)
          ? acceptedRes
          : [];
        const allResponses = Array.isArray(responsesRes)
          ? responsesRes
          : responsesRes || [];

        // Map backend snake_case to frontend camelCase AND attach winning bid info
        const mappedData: PrincipalQuotation[] = rawQuotations.map((d: any) => {
          // Find the accepted record for this quotation
          const acceptedRecord = acceptedRecords.find(
            (acc: any) => String(acc.quotation) === String(d.id),
          );
          let winningBidAmount = 0;
          let winningVendorId = null;

          // If a vendor was accepted, calculate their actual bid total
          if (acceptedRecord) {
            const winningResponse = allResponses.find(
              (r: any) => String(r.id) === String(acceptedRecord.response),
            );
            if (winningResponse) {
              winningVendorId = winningResponse.vendor;
              winningBidAmount =
                winningResponse.response_items?.reduce(
                  (sum: number, item: any) =>
                    sum + (Number(item.unit_price) || 0),
                  0,
                ) || 0;
            }
          } else {
            // Fallback: If no vendor selected yet (shouldn't happen at Principal stage), use HOD estimate
            winningBidAmount =
              d.items?.reduce(
                (sum: number, item: any) => sum + (Number(item.amount) || 0),
                0,
              ) || 0;
          }

          return {
            id: d.id,
            category: d.category,
            quotationTitle: d.title,
            description: d.description,
            department: d.department,
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
            winningBidAmount,
            winningVendorId,
          };
        });

        // Filter 1: Awaiting Principal Approval
        setPendingRequests(
          mappedData.filter(
            (q) =>
              q.finalQtVerifiedAccountant &&
              !q.qtVerifiedPrincipal &&
              q.status !== "REJECTED",
          ),
        );

        // Filter 2: History (Already processed by Principal)
        setProcessedRequests(
          mappedData.filter(
            (q) => q.qtVerifiedPrincipal || q.status === "REJECTED",
          ),
        );
      } catch (error) {
        console.error("Error fetching principal queue:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const payload = {
        qt_verified_principal: true,
        status: "DELIVERED",
      };
      await updateQuotationById(id, payload);

      // Optimistic UI update
      const approvedItem = pendingRequests.find(
        (q) => String(q.id) === String(id),
      );
      if (approvedItem) {
        setPendingRequests((prev) =>
          prev.filter((q) => String(q.id) !== String(id)),
        );
        setProcessedRequests((prev) => [
          { ...approvedItem, qtVerifiedPrincipal: true, status: "APPROVED" },
          ...prev,
        ]);
      }
    } catch (error) {
      console.error("Failed to approve quotation", error);
      alert("Failed to approve. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (
      !window.confirm("Are you sure you want to reject this quotation request?")
    )
      return;

    setProcessingId(id);
    try {
      const payload = {
        status: "REJECTED",
      };
      await updateQuotationById(id, payload);

      // Optimistic UI update
      const rejectedItem = pendingRequests.find(
        (q) => String(q.id) === String(id),
      );
      if (rejectedItem) {
        setPendingRequests((prev) =>
          prev.filter((q) => String(q.id) !== String(id)),
        );
        setProcessedRequests((prev) => [
          { ...rejectedItem, status: "REJECTED" },
          ...prev,
        ]);
      }
    } catch (error) {
      console.error("Failed to reject quotation", error);
      alert("Failed to reject. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F2F2F2] font-sans text-[#111110]">
      <main className="flex-1 px-[clamp(20px,4vw,40px)] py-[clamp(24px,4vw,40px)] transition-[margin-left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] max-md:ml-[68px]">
        <div className="mx-auto max-w-[1200px]">
          {/* ── Top Header ── */}
          <div className="mb-8 flex items-center justify-between rounded-[14px] border border-black/[0.06] bg-white p-6 shadow-sm">
            <div>
              <div className="mb-1 flex items-center gap-3">
                <h1 className="text-[22px] font-bold tracking-[-0.03em] text-[#111110]">
                  Principal Verification
                </h1>
                <span className="rounded-full bg-[#111110] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-white">
                  {userProfile?.role || "PRINCIPAL"}
                </span>
              </div>
              <p className="text-[13.5px] text-[#929090]">
                Review and provide final institutional approval for procurement
                requests.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[13px] font-bold text-[#111110] capitalize">
                  {userProfile?.name || "Principal User"}
                </p>
                <p className="font-mono text-[11px] text-[#929090]">
                  {userProfile?.email || "PRNC-001"}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#111110] to-[#4C433F] text-[14px] font-bold uppercase text-white shadow-sm">
                {userProfile?.name ? userProfile.name.charAt(0) : "P"}
              </div>
            </div>
          </div>

          {/* ── Metrics ── */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-[14px] border border-[#FFBD2E]/30 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                  Action Required
                </span>
                <div className="flex h-[32px] w-[32px] items-center justify-center rounded-lg bg-[#FFBD2E]/15">
                  <Clock size={16} className="text-[#9a6e00]" />
                </div>
              </div>
              <p className="font-mono text-[32px] font-bold tracking-tight text-[#111110]">
                {pendingRequests.length}
              </p>
              <p className="mt-0.5 text-[12px] text-[#929090]">
                Pending your final approval
              </p>
            </div>

            <div className="rounded-[14px] border border-black/[0.06] bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                  Recently Processed
                </span>
                <div className="flex h-[32px] w-[32px] items-center justify-center rounded-lg bg-[#28CA41]/10">
                  <ShieldCheck size={16} className="text-[#28CA41]" />
                </div>
              </div>
              <p className="font-mono text-[32px] font-bold tracking-tight text-[#111110]">
                {processedRequests.length}
              </p>
              <p className="mt-0.5 text-[12px] text-[#929090]">
                Approved or rejected historically
              </p>
            </div>
          </div>

          {/* ── Main Content Queue ── */}
          <div className="flex flex-col gap-6">
            <h2 className="text-[18px] font-bold text-[#111110]">
              Pending Approvals
            </h2>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center rounded-[14px] border border-black/[0.06] bg-white py-20 text-[#929090] shadow-sm">
                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-[3px] border-[#111110] border-r-transparent" />
                <p className="text-[13px] font-medium">
                  Loading compliance queue...
                </p>
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[14px] border border-black/[0.06] bg-white py-16 text-center shadow-sm">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#28CA41]/10">
                  <ShieldCheck size={28} className="text-[#1a8c30]" />
                </div>
                <h3 className="mb-1 text-[16px] font-bold text-[#111110]">
                  Queue is Empty
                </h3>
                <p className="text-[13.5px] text-[#929090]">
                  There are no quotations pending your approval at this time.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {pendingRequests.map((request) => {
                  const isActing = processingId === String(request.id);

                  return (
                    <div
                      key={request.id}
                      className="overflow-hidden rounded-[14px] border border-black/[0.06] bg-white shadow-sm transition-all hover:border-black/15"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/[0.06] bg-[#FAFAFA] p-6">
                        <div>
                          <div className="mb-1 flex items-center gap-2.5">
                            <FileText size={18} className="text-[#FB4D27]" />
                            <h3 className="text-[18px] font-bold text-[#111110]">
                              {request.quotationTitle}
                            </h3>
                          </div>
                          <p className="flex items-center gap-2 text-[13px] font-medium text-[#4C433F]">
                            Req{" "}
                            <span className="font-mono text-[#929090]">
                              #{request.id}
                            </span>{" "}
                            · {request.department} · {request.category}
                            <span className="rounded-full bg-[#5B7FA6]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em] text-[#5B7FA6]">
                              Accountant Verified
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="flex items-center justify-end gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[#1a8c30]">
                            <Trophy size={12} /> Final Vendor Bid
                          </p>
                          <div className="font-mono text-[24px] font-bold text-[#111110]">
                            ₹{request.winningBidAmount.toLocaleString("en-IN")}
                          </div>
                          {request.winningVendorId && (
                            <p className="mt-0.5 text-[11px] font-medium text-[#929090]">
                              Vendor ID: {request.winningVendorId}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                              Description
                            </p>
                            <p className="text-[13.5px] leading-relaxed text-[#4C433F]">
                              {request.description ||
                                "No description provided."}
                            </p>
                          </div>
                          <div>
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                              Requested Items ({request.items.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {request.items.map((item) => (
                                <span
                                  key={item.id}
                                  className="rounded-md border border-black/5 bg-[#F2F2F2] px-2.5 py-1 text-[12px] font-semibold text-[#111110]"
                                >
                                  {item.itemName}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 border-t border-black/[0.06] pt-5">
                          <button
                            onClick={() => handleApprove(String(request.id))}
                            disabled={isActing}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-[9px] bg-[#28CA41] py-3 text-[14px] font-bold text-white transition-all hover:-translate-y-[1px] hover:bg-[#1a8c30] hover:shadow-[0_4px_12px_rgba(40,202,65,0.2)] disabled:pointer-events-none disabled:opacity-50 sm:flex-none sm:px-8"
                          >
                            {isActing ? (
                              "Processing..."
                            ) : (
                              <>
                                <CheckCircle2 size={16} /> Grant Final Approval
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(String(request.id))}
                            disabled={isActing}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-[9px] border-[1.5px] border-[#FF5F57]/30 bg-white py-3 text-[14px] font-semibold text-[#c53030] transition-colors hover:bg-[#FF5F57]/5 disabled:pointer-events-none disabled:opacity-50 sm:flex-none sm:px-8"
                          >
                            <XCircle size={16} /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
