"use client";

import { Eye, Clock, FileText, IndianRupee, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

import { Quotation } from "../utility/index";
import { formatDate } from "../src/utils/DateFormat";
import { getStatusConfig } from "../src/utils/Status";
import { fetchQuotations } from "../utility/api";

export default function VendorDashboard() {
  const router = useRouter();
  const [data, setData] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vendorProfile, setVendorProfile] = useState<any>(null);

  useEffect(() => {
    // 1. Get current vendor profile
    try {
      const cookieData = Cookies.get("userProfile");
      if (cookieData) {
        setVendorProfile(JSON.parse(decodeURIComponent(cookieData)));
      }
    } catch (e) {
      console.warn("No vendor profile found.");
    }

    // 2. Fetch Quotations
    const getQuotations = async () => {
      setIsLoading(true);
      try {
        const response = await fetchQuotations();

        const backendData: Quotation[] = response.map((item: any) => ({
          id: item.id,
          category: item.category,
          quotationTitle: item.title,
          description: item.description,
          department: item.department,
          submissionDeadline: item.submission_deadline,
          deliveryPeriod: item.delivery_period,
          status: item.status,
          qtReqVerifiedAccountant: item.qt_req_verified_accountant,
          finalQtVerifiedAccountant: item.final_qt_verified_accountant,
          qtVerifiedPrincipal: item.qt_verified_principal,
          items: item.items.map((i: any) => ({
            id: i.id,
            itemName: i.name,
            itemDescription: i.description,
            amount: i.amount,
          })),
        }));

        // Filter: Show only verified requirements that aren't globally rejected
        const updatedData = backendData.filter(
          (q) => q.status !== "REJECTED" && q.qtReqVerifiedAccountant,
        );
        const data = updatedData.sort((a, b) => b.id - a.id);
        setData(data);
      } catch (err) {
        console.error("Error fetching quotations", err);
      } finally {
        setIsLoading(false);
      }
    };

    getQuotations();
  }, []);

  const getQuotationTotal = (items: { amount: number }[]) => {
    return items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  return (
    <div className="flex min-h-screen bg-[#F2F2F2] font-sans text-[#111110]">
      <main className="flex-1 px-[clamp(20px,4vw,40px)] py-[clamp(24px,4vw,40px)] transition-[margin-left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] max-md:ml-[68px]">
        <div className="mx-auto max-w-[1200px]">
          {/* ── Header ── */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-black/[0.06] bg-white p-6 shadow-sm">
            <div>
              <div className="mb-1 flex items-center gap-3">
                <h1 className="text-[22px] font-bold tracking-[-0.03em] text-[#111110]">
                  Available Quotations
                </h1>
                <span className="rounded-full bg-[#111110] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-white">
                  Vendor Portal
                </span>
              </div>
              <p className="text-[13.5px] text-[#929090]">
                Review verified institutional requirements and submit your
                competitive bids.
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

          {/* ── Stats ── */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[14px] border border-black/[0.06] bg-white p-5 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                  Open Requests
                </p>
                <FileText size={16} className="text-[#FB4D27]" />
              </div>
              <p className="font-mono text-[28px] font-bold text-[#111110]">
                {data.length}
              </p>
            </div>
          </div>

          {/* ── Quotation List ── */}
          <h2 className="mb-4 text-[16px] font-bold text-[#111110]">
            Current Requirements
          </h2>

          <div className="flex flex-col gap-4">
            {isLoading ? (
              // Skeleton Loader
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-24 animate-pulse rounded-[14px] border border-black/5 bg-white p-6 shadow-sm"
                />
              ))
            ) : data.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-[14px] border border-black/[0.06] bg-white py-16 text-center shadow-sm">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[12px] bg-[#F2F2F2]">
                  <FileText size={28} className="text-[#D3D6DA]" />
                </div>
                <h3 className="mb-1 text-[16px] font-bold text-[#111110]">
                  No Active Requests
                </h3>
                <p className="text-[13.5px] text-[#929090]">
                  There are currently no open quotation requests available for
                  bidding.
                </p>
              </div>
            ) : (
              data.map((quotation) => {
                const totalAmount = getQuotationTotal(quotation.items);
                // In a real scenario, you might want a simpler status map for vendors
                const statusConfig = getStatusConfig(quotation.status);

                return (
                  <div
                    key={quotation.id}
                    className="group flex flex-col items-start justify-between gap-4 overflow-hidden rounded-[14px] border border-black/[0.06] bg-white p-5 shadow-sm transition-all hover:border-black/15 hover:shadow-md md:flex-row md:items-center"
                  >
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-[#929090]">
                          REQ #{quotation.id}
                        </span>
                        <span className="rounded-full bg-[#FB4D27]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em] text-[#FB4D27]">
                          {quotation.department}
                        </span>
                      </div>

                      <h3 className="mb-1 text-[16px] font-bold leading-snug text-[#111110]">
                        {quotation.quotationTitle ||
                          quotation.description?.slice(0, 50) + "..."}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-medium text-[#929090]">
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} /> {quotation.items.length} Items
                          Listed
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} /> Due:{" "}
                          <span className="text-[#111110]">
                            {formatDate(quotation.submissionDeadline)}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="flex w-full flex-row items-center justify-between gap-6 border-t border-black/[0.04] pt-4 md:w-auto md:flex-col md:items-end md:border-t-0 md:pt-0">
                      <div className="text-left md:text-right">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                          Est. Budget limit
                        </p>
                        <p className="font-mono text-[18px] font-bold text-[#111110]">
                          ₹{totalAmount.toLocaleString("en-IN")}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          router.push(`/vendor/quotation/${quotation.id}`)
                        }
                        className="inline-flex shrink-0 items-center gap-2 rounded-[9px] bg-[#111110] px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:-translate-y-[1px] hover:bg-[#FB4D27] hover:shadow-[0_4px_12px_rgba(251,77,39,0.3)]"
                      >
                        <Eye size={16} /> View & Bid
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
