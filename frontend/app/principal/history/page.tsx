"use client";

import { useState, useEffect } from "react";
import {
  Search,
  History,
  FileText,
  Building2,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";
import {
  acceptedQuotations,
  fetchQuotations,
  fetchResponses,
} from "@/app/utility/api";

interface HistoricalRecord {
  id: string | number;
  title: string;
  department: string;
  category: string;
  submissionDeadline: string;
  winningVendorId: string | number | null;
  winningBidAmount: number;
}

export default function ApprovalHistoryPage() {
  const [historyData, setHistoryData] = useState<HistoricalRecord[]>([]);
  const [filteredData, setFilteredData] = useState<HistoricalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        // Fetch all required data concurrently
        const [qtRes, acceptedRes, responsesRes] = await Promise.all([
          fetchQuotations(),
          acceptedQuotations(),
          fetchResponses(),
        ]);

        const rawQuotations = qtRes;
        const acceptedRecords = Array.isArray(acceptedRes) ? acceptedRes : [];
        const allResponses = Array.isArray(responsesRes)
          ? responsesRes
          : responsesRes || [];

        // 1. Filter ONLY quotations fully approved by the Principal

        const approvedQuotations = rawQuotations.filter(
          (q: any) =>
            q.qt_verified_principal === true && q.status === "DELIVERED",
        );

        // 2. Map and enrich with winning vendor data
        const enrichedHistory: HistoricalRecord[] = approvedQuotations.map(
          (d: any) => {
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
                    (sum: number, item: any) =>
                      sum + (Number(item.unit_price) || 0),
                    0,
                  ) || 0;
              }
            } else {
              // Fallback to original estimate if vendor mapping fails
              winningBidAmount =
                d.items?.reduce(
                  (sum: number, item: any) => sum + (Number(item.amount) || 0),
                  0,
                ) || 0;
            }

            return {
              id: d.id,
              title: d.title,
              department: d.department,
              category: d.category,
              submissionDeadline: d.submission_deadline,
              winningVendorId,
              winningBidAmount,
            };
          },
        );

        // Sort by ID descending (newest first)
        enrichedHistory.sort((a, b) => Number(b.id) - Number(a.id));

        setHistoryData(enrichedHistory);
        setFilteredData(enrichedHistory);
      } catch (error) {
        console.error("Failed to load history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Handle Search Filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredData(historyData);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = historyData.filter(
        (record) =>
          record.title.toLowerCase().includes(lowerQuery) ||
          String(record.id).includes(lowerQuery) ||
          record.department.toLowerCase().includes(lowerQuery) ||
          (record.winningVendorId &&
            String(record.winningVendorId).includes(lowerQuery)),
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, historyData]);

  const totalHistoricalSpend = historyData.reduce(
    (sum, record) => sum + record.winningBidAmount,
    0,
  );

  return (
    <div className="flex min-h-screen bg-[#F2F2F2] font-sans text-[#111110]">
      {/* Ensure you pass your actual menuItems here if needed */}
      <main className="flex-1 px-[clamp(20px,4vw,40px)] py-[clamp(24px,4vw,40px)] transition-[margin-left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] max-md:ml-[68px]">
        <div className="mx-auto max-w-[1200px]">
          {/* ── Header ── */}
          <div className="mb-8 flex flex-wrap items-end justify-between gap-6 rounded-[14px] border border-black/[0.06] bg-white p-6 shadow-sm">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#111110]/5">
                  <History size={20} className="text-[#111110]" />
                </div>
                <h1 className="text-[22px] font-bold tracking-[-0.03em] text-[#111110]">
                  Approval Ledger
                </h1>
              </div>
              <p className="text-[13.5px] text-[#929090]">
                A permanent record of all quotations finalized and approved by
                the Principal.
              </p>
            </div>

            <div className="text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                Total Institutional Spend
              </p>
              <p className="font-mono text-[28px] font-bold text-[#111110]">
                ₹{totalHistoricalSpend.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* ── Controls Row ── */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="relative w-full max-w-[400px]">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#929090]"
              />
              <input
                type="text"
                placeholder="Search by ID, Title, Department, or Vendor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-[10px] border border-black/10 bg-white py-2.5 pl-10 pr-4 text-[13.5px] outline-none transition-colors focus:border-[#111110]"
              />
            </div>
            <div className="text-[13px] font-medium text-[#929090]">
              Showing{" "}
              <span className="font-bold text-[#111110]">
                {filteredData.length}
              </span>{" "}
              records
            </div>
          </div>

          {/* ── History Table ── */}
          <div className="overflow-hidden rounded-[14px] border border-black/[0.06] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-[#FAFAFA]">
                    <th className="whitespace-nowrap px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                      Req ID
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                      Quotation Details
                    </th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                      Winning Vendor
                    </th>
                    <th className="whitespace-nowrap px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                      Final Amount
                    </th>
                    <th className="whitespace-nowrap px-6 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.06em] text-[#929090]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[13.5px] text-[#111110]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-[3px] border-[#111110] border-r-transparent" />
                        <p className="text-[#929090]">
                          Loading historical records...
                        </p>
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-16 text-center text-[#929090]"
                      >
                        No approved quotations found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-black/[0.04] transition-colors hover:bg-[#FAFAFA]"
                      >
                        {/* ID */}
                        <td className="whitespace-nowrap px-6 py-4 font-mono font-bold text-[#111110]">
                          REQ-{record.id}
                        </td>

                        {/* Details */}
                        <td className="px-6 py-4">
                          <p className="mb-1 font-bold text-[#111110] line-clamp-1">
                            {record.title}
                          </p>
                          <div className="flex items-center gap-3 text-[12px] text-[#929090]">
                            <span className="flex items-center gap-1">
                              <FileText size={12} /> {record.department}
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarDays size={12} /> Due:{" "}
                              {record.submissionDeadline}
                            </span>
                          </div>
                        </td>

                        {/* Vendor */}
                        <td className="whitespace-nowrap px-6 py-4">
                          {record.winningVendorId ? (
                            <div className="flex items-center gap-2 font-medium text-[#4C433F]">
                              <Building2 size={14} className="text-[#5B7FA6]" />
                              Vendor ID: {record.winningVendorId}
                            </div>
                          ) : (
                            <span className="text-[#929090] italic">
                              Not Assigned
                            </span>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="whitespace-nowrap px-6 py-4 text-right font-mono text-[16px] font-bold text-[#111110]">
                          ₹{record.winningBidAmount.toLocaleString("en-IN")}
                        </td>

                        {/* Status */}
                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#28CA41]/20 bg-[#28CA41]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.04em] text-[#1a8c30]">
                            <CheckCircle2 size={12} /> Approved
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
