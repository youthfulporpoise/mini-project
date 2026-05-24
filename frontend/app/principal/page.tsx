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
  ClipboardList,
} from "lucide-react";
import {
  acceptedQuotations,
  fetchQuotations,
  fetchResponses,
  updateQuotationById,
} from "../utility/api";

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
  qtReqVerifiedPrincipal: boolean;
  items: any[];
  winningBidAmount: number;
  winningVendorId: string | number | null;
}

export default function PrincipalDashboard() {
  // Section 1 — initial request approval
  const [reqPending, setReqPending] = useState<PrincipalQuotation[]>([]);
  const [reqProcessingId, setReqProcessingId] = useState<string | null>(null);

  // Section 2 — final payment approval
  const [pendingRequests, setPendingRequests] = useState<PrincipalQuotation[]>([]);
  const [processedRequests, setProcessedRequests] = useState<PrincipalQuotation[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    try {
      const cookieData = Cookies.get("userProfile");
      if (cookieData) {
        setUserProfile(JSON.parse(decodeURIComponent(cookieData)));
      }
    } catch (e) {
      console.error("Failed to parse user profile cookie", e);
    }

    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [qtRes, acceptedRes, responsesRes] = await Promise.all([
          fetchQuotations(),
          acceptedQuotations(),
          fetchResponses(),
        ]);

        const rawQuotations = qtRes;
        const acceptedRecords = Array.isArray(acceptedRes) ? acceptedRes : [];
        const allResponses = Array.isArray(responsesRes) ? responsesRes : responsesRes || [];

        const mappedData: PrincipalQuotation[] = rawQuotations.map((d: any) => {
          const acceptedRecord = acceptedRecords.find(
            (acc: any) => String(acc.quotation) === String(d.id),
          );
          let winningBidAmount = 0;
          let winningVendorId = null;

          if (acceptedRecord) {
            const winningResponse = allResponses.find(
              (r: any) => String(r.id) === String(acceptedRecord.response),
            );
            if (winningResponse) {
              winningVendorId = winningResponse.vendor;
              winningBidAmount =
                winningResponse.response_items?.reduce(
                  (sum: number, item: any) => sum + (Number(item.unit_price) || 0),
                  0,
                ) || 0;
            }
          } else {
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
            qtReqVerifiedPrincipal: d.qt_req_verified_principal,
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

        setReqPending(
          mappedData.filter(
            (q) => !q.qtReqVerifiedPrincipal && q.status !== "REJECTED",
          ),
        );

        setPendingRequests(
          mappedData.filter(
            (q) =>
              q.finalQtVerifiedAccountant &&
              !q.qtVerifiedPrincipal &&
              q.status !== "REJECTED",
          ),
        );

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

  // ── Section 1 handlers ───────────────────────────────────────────────────────

  const handleReqApprove = async (id: string) => {
    setReqProcessingId(id);
    try {
      await updateQuotationById(id, { qt_req_verified_principal: true });
      setReqPending((prev) => prev.filter((q) => String(q.id) !== id));
    } catch (error) {
      console.error("Failed to approve request", error);
      alert("Failed to approve request. Please try again.");
    } finally {
      setReqProcessingId(null);
    }
  };

  const handleReqReject = async (id: string) => {
    if (!window.confirm("Are you sure you want to reject this quotation request?")) return;
    setReqProcessingId(id);
    try {
      await updateQuotationById(id, { status: "REJECTED" });
      setReqPending((prev) => prev.filter((q) => String(q.id) !== id));
    } catch (error) {
      console.error("Failed to reject request", error);
      alert("Failed to reject request. Please try again.");
    } finally {
      setReqProcessingId(null);
    }
  };

  // ── Section 2 handlers ───────────────────────────────────────────────────────

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await updateQuotationById(id, {
        qt_verified_principal: true,
        status: "DELIVERED",
      });
      const approvedItem = pendingRequests.find((q) => String(q.id) === String(id));
      if (approvedItem) {
        setPendingRequests((prev) => prev.filter((q) => String(q.id) !== String(id)));
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
    if (!window.confirm("Are you sure you want to reject this quotation request?")) return;
    setProcessingId(id);
    try {
      await updateQuotationById(id, { status: "REJECTED" });
      const rejectedItem = pendingRequests.find((q) => String(q.id) === String(id));
      if (rejectedItem) {
        setPendingRequests((prev) => prev.filter((q) => String(q.id) !== String(id)));
        setProcessedRequests((prev) => [{ ...rejectedItem, status: "REJECTED" }, ...prev]);
      }
    } catch (error) {
      console.error("Failed to reject quotation", error);
      alert("Failed to reject. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  // ── Metrics config ───────────────────────────────────────────────────────────

  const metrics = [
    {
      label: "Request Queue",
      value: reqPending.length,
      sub: "Requests awaiting initial approval",
      bg: "bg-[#FB4D27]/10",
      icon: <ClipboardList size={16} className="text-[#FB4D27]" />,
      border: "border-[#FB4D27]/20",
    },
    {
      label: "Action Required",
      value: pendingRequests.length,
      sub: "Pending your final approval",
      bg: "bg-[#FFBD2E]/15",
      icon: <Clock size={16} className="text-[#9a6e00]" />,
      border: "border-[#FFBD2E]/30",
    },
    {
      label: "Recently Processed",
      value: processedRequests.length,
      sub: "Approved or rejected historically",
      bg: "bg-[#28CA41]/10",
      icon: <ShieldCheck size={16} className="text-[#28CA41]" />,
      border: "border-black/[0.06]",
    },
  ];

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F2F2F2] font-sans text-[#111110]">
      <div className="mx-auto max-w-[1400px] px-[clamp(16px,4vw,32px)] py-[clamp(24px,4vw,40px)]">

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
              Review and provide final institutional approval for procurement requests.
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
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {metrics.map((m) => (
            <div
              key={m.label}
              className={`rounded-[14px] border ${m.border} bg-white p-5 shadow-sm`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                  {m.label}
                </span>
                <div className={`flex h-[32px] w-[32px] items-center justify-center rounded-lg ${m.bg}`}>
                  {m.icon}
                </div>
              </div>
              <p className="font-mono text-[32px] font-bold tracking-tight text-[#111110]">
                {m.value}
              </p>
              <p className="mt-0.5 text-[12px] text-[#929090]">{m.sub}</p>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#929090]">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-[3px] border-[#111110] border-r-transparent" />
            <p className="text-[13px] font-medium">Syncing principal records...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">

            {/* ══ COLUMN 1: Request Approvals ══ */}
            <div className="overflow-hidden rounded-[14px] border border-black/[0.06] bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-black/[0.06] bg-[#FAFAFA] px-6 py-4">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#FB4D27]/10 text-[13px] font-bold text-[#FB4D27]">
                  1
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#111110]">
                    Request Approvals
                  </h3>
                  <p className="text-[12px] text-[#929090]">
                    Initial sign-off before accountant processing.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 bg-white p-5">
                {reqPending.length === 0 ? (
                  <div className="py-12 text-center">
                    <CheckCircle2 size={28} className="mx-auto mb-3 text-[#D3D6DA]" />
                    <p className="text-[14px] font-bold text-[#111110]">All caught up.</p>
                  </div>
                ) : (
                  reqPending.map((q) => {
                    const isActing = reqProcessingId === String(q.id);
                    return (
                      <div
                        key={q.id}
                        className="rounded-[12px] border border-black/10 bg-[#FAFAFA] p-5 transition-colors hover:border-[#FB4D27]/40 hover:bg-white"
                      >
                        <div className="mb-1">
                          <h4 className="text-[15px] font-bold text-[#111110]">
                            {q.quotationTitle}
                          </h4>
                          <p className="mt-1 flex items-center gap-2 text-[12px] text-[#929090]">
                            Req <span className="font-mono">#{q.id}</span> · {q.department}
                            <span className="rounded bg-[#FB4D27]/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#FB4D27]">
                              {q.category}
                            </span>
                          </p>
                        </div>

                        {q.description && (
                          <p className="mb-3 mt-2 text-[12.5px] leading-relaxed text-[#4C433F]">
                            {q.description}
                          </p>
                        )}

                        {q.items.length > 0 && (
                          <div className="mb-4 flex flex-wrap gap-1.5">
                            {q.items.map((item) => (
                              <span
                                key={item.id}
                                className="rounded-md border border-black/5 bg-white px-2 py-0.5 text-[11px] font-semibold text-[#111110]"
                              >
                                {item.itemName}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReqApprove(String(q.id))}
                            disabled={isActing}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-[8px] bg-[#111110] px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#FB4D27] disabled:pointer-events-none disabled:opacity-50"
                          >
                            {isActing ? (
                              "Processing..."
                            ) : (
                              <>
                                <CheckCircle2 size={14} /> Approve Request
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleReqReject(String(q.id))}
                            disabled={isActing}
                            className="flex items-center justify-center gap-1.5 rounded-[8px] border border-black/10 bg-white px-4 py-2.5 text-[13px] font-semibold text-[#c53030] transition-colors hover:border-[#FF5F57]/40 hover:bg-[#FF5F57]/5 disabled:pointer-events-none disabled:opacity-50"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ══ COLUMN 2: Final Payment Approvals ══ */}
            <div className="overflow-hidden rounded-[14px] border border-black/[0.06] bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-black/[0.06] bg-[#FAFAFA] px-6 py-4">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#28CA41]/20 text-[13px] font-bold text-[#1a8c30]">
                  2
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#111110]">
                    Final Payment Approvals
                  </h3>
                  <p className="text-[12px] text-[#929090]">
                    Accountant-verified vendor quotes for sign-off.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 bg-white p-5">
                {pendingRequests.length === 0 ? (
                  <div className="py-12 text-center">
                    <ShieldCheck size={28} className="mx-auto mb-3 text-[#D3D6DA]" />
                    <p className="text-[14px] font-bold text-[#111110]">
                      Nothing to approve yet.
                    </p>
                  </div>
                ) : (
                  pendingRequests.map((request) => {
                    const isActing = processingId === String(request.id);
                    return (
                      <div
                        key={request.id}
                        className="rounded-[12px] border border-black/10 bg-[#FAFAFA] p-5 transition-colors hover:border-[#28CA41]/50 hover:bg-white"
                      >
                        <div className="mb-3">
                          <h4 className="text-[15px] font-bold text-[#111110]">
                            {request.quotationTitle}
                          </h4>
                          <p className="mt-1 flex items-center gap-2 text-[12px] text-[#929090]">
                            Req <span className="font-mono">#{request.id}</span> · {request.department}
                            <span className="rounded bg-[#5B7FA6]/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#5B7FA6]">
                              Accountant Verified
                            </span>
                          </p>
                        </div>

                        {/* Winning bid amount */}
                        <div className="mb-4 flex items-center justify-between rounded-[8px] border border-black/5 bg-white px-4 py-3">
                          <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[#1a8c30]">
                            <Trophy size={12} /> Final Vendor Bid
                          </p>
                          <div className="text-right">
                            <p className="font-mono text-[18px] font-bold text-[#111110]">
                              ₹{request.winningBidAmount.toLocaleString("en-IN")}
                            </p>
                            {request.winningVendorId && (
                              <p className="text-[10px] text-[#929090]">
                                Vendor ID: {request.winningVendorId}
                              </p>
                            )}
                          </div>
                        </div>

                        {request.items.length > 0 && (
                          <div className="mb-4 flex flex-wrap gap-1.5">
                            {request.items.map((item) => (
                              <span
                                key={item.id}
                                className="rounded-md border border-black/5 bg-white px-2 py-0.5 text-[11px] font-semibold text-[#111110]"
                              >
                                {item.itemName}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(String(request.id))}
                            disabled={isActing}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-[8px] bg-[#111110] px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#28CA41] disabled:pointer-events-none disabled:opacity-50"
                          >
                            {isActing ? (
                              "Processing..."
                            ) : (
                              <>
                                <CheckCircle2 size={14} /> Grant Final Approval
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(String(request.id))}
                            disabled={isActing}
                            className="flex items-center justify-center gap-1.5 rounded-[8px] border border-black/10 bg-white px-4 py-2.5 text-[13px] font-semibold text-[#c53030] transition-colors hover:border-[#FF5F57]/40 hover:bg-[#FF5F57]/5 disabled:pointer-events-none disabled:opacity-50"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}