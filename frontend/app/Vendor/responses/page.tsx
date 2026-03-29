"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import axios from "axios";
import {
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  ArrowRight,
  FileText,
  CheckCheck,
} from "lucide-react";
import { BACKEND_URL } from "@/app/utility";
import { fetchQuotations, fetchResponses } from "@/app/utility/api";

interface EnrichedResponse {
  id: number;
  quotation: number;
  quotationTitle: string;
  department: string;
  status: string;
  totalAmount: number;
  itemCount: number;
}

export default function VendorResponsesPage() {
  const router = useRouter();
  const [myResponses, setMyResponses] = useState<EnrichedResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vendorProfile, setVendorProfile] = useState<any>(null);

  useEffect(() => {
    const loadVendorData = async () => {
      setIsLoading(true);
      try {
        // 1. Get current vendor ID
        let currentVendorId = null;
        const cookieData = Cookies.get("userProfile");
        if (cookieData) {
          const profile = JSON.parse(decodeURIComponent(cookieData));
          setVendorProfile(profile);
          currentVendorId = profile.id;
        }

        if (!currentVendorId) {
          console.warn("No vendor profile found.");
          setIsLoading(false);
          return;
        }

        // 2. Fetch Quotations, Responses, AND Accepted Quotations simultaneously
        const [allQuotations, allResponsesRes, acceptedRes] = await Promise.all(
          [
            fetchQuotations(),
            fetchResponses(),
            axios
              .get(`${BACKEND_URL}/quotations/accepted/`)
              .catch(() => ({ data: [] })), // Catch 404s safely
          ],
        );

        const allResponses = Array.isArray(allResponsesRes)
          ? allResponsesRes
          : allResponsesRes.data;
        const acceptedData = Array.isArray(acceptedRes.data)
          ? acceptedRes.data
          : [];

        // 3. Filter responses belonging ONLY to this vendor
        const vendorResponses = allResponses.filter(
          (r: any) => String(r.vendor) === String(currentVendorId),
        );

        // 4. Enrich the response data with true backend status
        const enrichedData: EnrichedResponse[] = vendorResponses.map(
          (res: any) => {
            const relatedQuotation = allQuotations.find(
              (q: any) => String(q.id) === String(res.quotation),
            );

            const totalAmount =
              res.response_items?.reduce(
                (sum: number, item: any) =>
                  sum + (Number(item.unit_price) || 0),
                0,
              ) || 0;

            // --- DETERMINE TRUE STATUS ---
            const acceptedRecord = acceptedData.find(
              (acc: any) => String(acc.quotation) === String(res.quotation),
            );

            let calculatedStatus = res.status || "PENDING_REVIEW";

            if (acceptedRecord) {
              if (String(acceptedRecord.response) === String(res.id)) {
                // Check if the overall quotation lifecycle is marked as DELIVERED
                if (relatedQuotation?.status === "DELIVERED") {
                  calculatedStatus = "DELIVERED";
                } else {
                  calculatedStatus = "ACCEPTED";
                }
              } else {
                // The quotation is closed, and someone else won
                calculatedStatus = "REJECTED";
              }
            }

            return {
              id: res.id,
              quotation: res.quotation,
              quotationTitle:
                relatedQuotation?.title || `Quotation #${res.quotation}`,
              department: relatedQuotation?.department || "Unknown Department",
              status: calculatedStatus,
              totalAmount,
              itemCount: res.response_items?.length || 0,
            };
          },
        );

        // 5. Sort: DELIVERED and ACCEPTED first, then PENDING, then REJECTED
        enrichedData.sort((a, b) => {
          const order: Record<string, number> = {
            DELIVERED: 1,
            ACCEPTED: 2,
            PENDING_REVIEW: 3,
            REJECTED: 4,
          };
          return (order[a.status] || 5) - (order[b.status] || 5);
        });

        setMyResponses(enrichedData);
      } catch (error) {
        console.error("Error loading responses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVendorData();
  }, []);

  // Helper to render the appropriate status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#5B7FA6]/20 bg-[#5B7FA6]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.04em] text-[#5B7FA6]">
            <CheckCheck size={12} /> Delivered
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#28CA41]/20 bg-[#28CA41]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.04em] text-[#1a8c30]">
            <CheckCircle2 size={12} /> Approved / Won
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#FF5F57]/20 bg-[#FF5F57]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.04em] text-[#c53030]">
            <XCircle size={12} /> Not Selected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#FFBD2E]/25 bg-[#FFBD2E]/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.04em] text-[#9a6e00]">
            <Clock size={12} /> Under Review
          </span>
        );
    }
  };

  // Metrics calculation
  const approvedOrDeliveredCount = myResponses.filter(
    (r) => r.status === "ACCEPTED" || r.status === "DELIVERED",
  ).length;
  
  const pendingCount = myResponses.filter(
    (r) => r.status !== "ACCEPTED" && r.status !== "DELIVERED" && r.status !== "REJECTED",
  ).length;

  return (
    <div className="flex min-h-screen bg-[#F2F2F2] font-sans text-[#111110]">
      <main className="flex-1 px-[clamp(20px,4vw,40px)] py-[clamp(24px,4vw,40px)] transition-[margin-left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] max-md:ml-[68px]">
        <div className="mx-auto max-w-[1200px]">
          {/* ── Header ── */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-black/[0.06] bg-white p-6 shadow-sm">
            <div>
              <div className="mb-1 flex items-center gap-3">
                <h1 className="text-[22px] font-bold tracking-[-0.03em] text-[#111110]">
                  My Quotation Responses
                </h1>
                <span className="rounded-full bg-[#111110] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-white">
                  Vendor Portal
                </span>
              </div>
              <p className="text-[13.5px] text-[#929090]">
                Track the status of your submitted bids and process approved deliveries.
              </p>
            </div>
            <div className="text-right">
              <p className="text-[13px] font-bold text-[#111110] capitalize">
                {vendorProfile?.name || "Vendor"}
              </p>
              <p className="font-mono text-[11px] text-[#929090]">
                ID: {vendorProfile?.id ? `VND-${vendorProfile.id}` : "UNKNOWN"}
              </p>
            </div>
          </div>

          {/* ── Quick Stats ── */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-[14px] border border-black/[0.06] bg-white p-5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                Total Bids Submitted
              </p>
              <p className="mt-1 font-mono text-[32px] font-bold tracking-tight text-[#111110]">
                {myResponses.length}
              </p>
            </div>
            <div className="rounded-[14px] border border-[#28CA41]/30 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                Approved / Delivered
              </p>
              <p className="mt-1 font-mono text-[32px] font-bold tracking-tight text-[#1a8c30]">
                {approvedOrDeliveredCount}
              </p>
            </div>
            <div className="rounded-[14px] border border-[#FFBD2E]/30 bg-white p-5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                Pending Review
              </p>
              <p className="mt-1 font-mono text-[32px] font-bold tracking-tight text-[#9a6e00]">
                {pendingCount}
              </p>
            </div>
          </div>

          {/* ── Main List ── */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center rounded-[14px] border border-black/[0.06] bg-white py-20 text-[#929090] shadow-sm">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-[3px] border-[#111110] border-r-transparent" />
              <p className="text-[13px] font-medium">
                Fetching your responses...
              </p>
            </div>
          ) : myResponses.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[14px] border border-black/[0.06] bg-white py-20 text-center shadow-sm">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[12px] bg-[#F2F2F2]">
                <Package size={28} className="text-[#D3D6DA]" />
              </div>
              <h3 className="mb-1 text-[16px] font-bold text-[#111110]">
                No Bids Found
              </h3>
              <p className="text-[13.5px] text-[#929090]">
                You haven't submitted any quotation responses yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {myResponses.map((res) => {
                const isDelivered = res.status === "DELIVERED";
                const isApproved = res.status === "ACCEPTED";
                const isRejected = res.status === "REJECTED";

                return (
                  <div
                    key={res.id}
                    className={`flex flex-col overflow-hidden rounded-[14px] border transition-all ${
                      isDelivered
                        ? "border-[#5B7FA6]/30 bg-[#5B7FA6]/[0.02]"
                        : isApproved
                          ? "border-[#28CA41]/40 bg-white shadow-[0_8px_24px_rgba(40,202,65,0.08)] ring-1 ring-[#28CA41]/10"
                          : isRejected
                            ? "border-black/[0.06] bg-[#FAFAFA] opacity-75"
                            : "border-black/[0.08] bg-white shadow-sm hover:border-black/15 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start justify-between border-b border-black/[0.04] p-5 pb-4">
                      <div>
                        {renderStatusBadge(res.status)}
                        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                          Req #{res.quotation}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                          Your Bid
                        </p>
                        <p
                          className={`font-mono text-[18px] font-bold ${
                            isApproved || isDelivered ? "text-[#1a8c30]" : "text-[#111110]"
                          }`}
                        >
                          ₹{res.totalAmount.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="mb-1 line-clamp-2 text-[16px] font-bold leading-snug text-[#111110]">
                        {res.quotationTitle}
                      </h3>
                      <p className="mb-5 text-[13px] text-[#929090]">
                        {res.department} · {res.itemCount} Items
                      </p>

                      <div className="mt-auto">
                        {isDelivered ? (
                          <div className="flex w-full items-center justify-center gap-2 rounded-[9px] bg-[#28CA41]/10 px-4 py-3 text-[13.5px] font-bold text-[#1a8c30]">
                            <CheckCheck size={16} /> Delivery Successfully Verified
                          </div>
                        ) : isApproved ? (
                          <button
                            onClick={() =>
                              router.push(`/vendor/delivery/${res.quotation}`)
                            }
                            className="flex w-full items-center justify-between rounded-[9px] bg-[#28CA41] px-4 py-3 text-[13.5px] font-bold text-white transition-all hover:-translate-y-[1px] hover:bg-[#1a8c30] hover:shadow-[0_4px_12px_rgba(40,202,65,0.25)]"
                          >
                            <span className="flex items-center gap-2">
                              <Truck size={16} /> Process Delivery & OTP
                            </span>
                            <ArrowRight size={16} />
                          </button>
                        ) : isRejected ? (
                          <button
                            disabled
                            className="flex w-full items-center justify-center rounded-[9px] bg-[#F2F2F2] px-4 py-3 text-[13.5px] font-semibold text-[#929090]"
                          >
                            Bid Closed
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              router.push(`/vendor/quotations/${res.quotation}`)
                            }
                            className="flex w-full items-center justify-between rounded-[9px] border-[1.5px] border-black/10 bg-white px-4 py-3 text-[13.5px] font-semibold text-[#111110] transition-colors hover:bg-[#F2F2F2]"
                          >
                            <span className="flex items-center gap-2">
                              <FileText size={16} /> View Original Request
                            </span>
                            <ArrowRight size={16} className="text-[#929090]" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}